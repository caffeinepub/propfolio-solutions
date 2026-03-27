import Map     "mo:core/Map";
import Text    "mo:core/Text";
import Time    "mo:core/Time";
import Array   "mo:core/Array";
import Iter    "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {

  // ── Types ───────────────────────────────────────────────────────────

  type LicenseRecord = {
    platform      : Text;   // "MT4" | "MT5" | "cTrader" | "ALL"
    status        : Text;   // "active" | "inactive" | "expired"
    expiryDate    : Int;    // nanoseconds epoch, 0 = no expiry
    accountNumber : Text;   // empty until first /verify ping locks it
  };

  type RateBucket = {
    var count       : Nat;
    var windowStart : Int;
  };

  type VerifyResult = {
    status  : Text;
    message : Text;
  };

  type HeaderField  = (Text, Text);
  type HttpRequest  = { method : Text; url : Text; headers : [HeaderField]; body : Blob };
  type HttpResponse = { status_code : Nat16; headers : [HeaderField]; body : Blob; upgrade : ?Bool };

  // ── Stable storage ────────────────────────────────────────────────────

  // license_key → LicenseRecord
  let licenseStore = Map.empty<Text, LicenseRecord>();

  // rate-limit buckets keyed by IP or license_key
  let rateBuckets  = Map.empty<Text, RateBucket>();

  // admin token -- change with setAdminToken()
  stable var adminToken : Text = "propfolio-admin-2024";

  // ── Constants ───────────────────────────────────────────────────────────

  let RATE_WINDOW_NS : Int = 15 * 60 * 1_000_000_000; // 15 min in ns
  let MAX_FAILURES   : Nat = 5;

  // ── Helpers ─────────────────────────────────────────────────────────────

  func requireAdmin(token : Text) {
    if (token != adminToken) {
      Runtime.trap("Unauthorized: invalid admin token");
    };
  };

  func recordFailure(key : Text) {
    let now = Time.now();
    switch (rateBuckets.get(key)) {
      case null {
        rateBuckets.set(key, { var count = 1; var windowStart = now });
      };
      case (?bucket) {
        if (now - bucket.windowStart > RATE_WINDOW_NS) {
          bucket.count       := 1;
          bucket.windowStart := now;
        } else {
          bucket.count += 1;
        };
      };
    };
  };

  func isRateLimited(key : Text) : Bool {
    let now = Time.now();
    switch (rateBuckets.get(key)) {
      case null false;
      case (?bucket) {
        if (now - bucket.windowStart > RATE_WINDOW_NS) {
          // window expired -- reset
          bucket.count       := 0;
          bucket.windowStart := now;
          false;
        } else {
          bucket.count >= MAX_FAILURES;
        };
      };
    };
  };

  // Minimal flat-JSON string value extractor.
  // Handles {"key":"value"} -- sufficient for this use-case.
  func extractJsonField(json : Text, fieldName : Text) : Text {
    let needle = "\"" # fieldName # "\"";
    // split on the key
    let parts = Text.split(json, #text needle);
    let _ = parts.next();
    switch (parts.next()) {
      case null "";
      case (?right) {
        // right: ":"value",..."
        let colonParts = Text.split(right, #char ':');
        let _ = colonParts.next();
        switch (colonParts.next()) {
          case null "";
          case (?valSection) {
            let trimmed = Text.trim(valSection, #char ' ');
            // grab between quotes
            let qparts = Text.split(trimmed, #char '"');
            let _ = qparts.next(); // empty or whitespace before opening quote
            switch (qparts.next()) {
              case null "";
              case (?v) v;
            };
          };
        };
      };
    };
  };

  // ── Core verify logic ────────────────────────────────────────────────────

  func doVerify(
    licenseKey    : Text,
    accountNumber : Text,
    platform      : Text,
    clientIp      : Text,
  ) : VerifyResult {

    // 1. Rate-limit by IP
    if (isRateLimited(clientIp)) {
      return { status = "error"; message = "Too many attempts. Try again in 15 minutes." };
    };

    // 2. Look up license
    let rec = switch (licenseStore.get(licenseKey)) {
      case null {
        recordFailure(clientIp);
        recordFailure(licenseKey);
        return { status = "invalid"; message = "License key not found." };
      };
      case (?r) r;
    };

    // 3. Check key-level rate limit too
    if (isRateLimited(licenseKey)) {
      return { status = "error"; message = "Too many attempts for this key. Try again in 15 minutes." };
    };

    // 4. Check status
    if (rec.status != "active") {
      recordFailure(clientIp);
      return { status = "invalid"; message = "License is not active." };
    };

    // 5. Check expiry (0 = perpetual)
    if (rec.expiryDate != 0 and Time.now() > rec.expiryDate) {
      recordFailure(clientIp);
      return { status = "invalid"; message = "License has expired." };
    };

    // 6. Platform check ("ALL" passes any platform)
    if (rec.platform != "ALL" and rec.platform != platform) {
      recordFailure(clientIp);
      return { status = "invalid"; message = "License not valid for this platform." };
    };

    // 7. Account-number locking
    if (rec.accountNumber == "") {
      // First ping -- lock this key to the account
      licenseStore.set(licenseKey, { rec with accountNumber = accountNumber });
      return { status = "active"; message = "License activated and bound to account." };
    };

    if (rec.accountNumber != accountNumber) {
      recordFailure(clientIp);
      recordFailure(licenseKey);
      return { status = "invalid"; message = "Account number mismatch." };
    };

    { status = "active"; message = "License is valid." };
  };

  // ── Admin endpoints ─────────────────────────────────────────────────────

  /// Push / update a license record from the admin panel.
  /// expiryDateNs = 0 means perpetual.
  public shared func syncLicense(
    token        : Text,
    licenseKey   : Text,
    platform     : Text,
    status       : Text,
    expiryDateNs : Int,
  ) : async () {
    requireAdmin(token);
    let existingAccount = switch (licenseStore.get(licenseKey)) {
      case null    "";
      case (?rec)  rec.accountNumber;
    };
    licenseStore.set(licenseKey, {
      platform      = platform;
      status        = status;
      expiryDate    = expiryDateNs;
      accountNumber = existingAccount; // preserve locked account
    });
  };

  /// Remove a license entirely.
  public shared func removeLicense(token : Text, licenseKey : Text) : async () {
    requireAdmin(token);
    licenseStore.delete(licenseKey);
  };

  /// Clear the bound account number so a trader can re-bind to a new account.
  public shared func resetAccountLock(token : Text, licenseKey : Text) : async () {
    requireAdmin(token);
    switch (licenseStore.get(licenseKey)) {
      case null ();
      case (?rec) {
        licenseStore.set(licenseKey, { rec with accountNumber = "" });
      };
    };
  };

  /// Change the admin token.
  public shared func setAdminToken(oldToken : Text, newToken : Text) : async () {
    if (oldToken != adminToken) {
      Runtime.trap("Unauthorized: wrong existing token");
    };
    adminToken := newToken;
  };

  /// List all licenses (admin only).
  public shared func listLicenses(token : Text) : async [(Text, LicenseRecord)] {
    requireAdmin(token);
    licenseStore.entries().toArray();
  };

  // ── HTTP interface ──────────────────────────────────────────────────────

  // POST requests require state mutation (account locking), so we must
  // upgrade them from the query http_request to http_request_update.
  public query func http_request(req : HttpRequest) : async HttpResponse {
    if (req.method == "POST") {
      // Signal the IC gateway to retry as an update call
      return { status_code = 204; headers = []; body = ""; upgrade = ?true };
    };
    // Health check: GET /
    {
      status_code = 200;
      headers     = [("Content-Type", "text/plain")];
      body        = "license_auth_service: OK";
      upgrade     = null;
    };
  };

  public func http_request_update(req : HttpRequest) : async HttpResponse {
    let jsonHeaders : [HeaderField] = [
      ("Content-Type",                "application/json"),
      ("Access-Control-Allow-Origin", "*"),
    ];

    if (req.url != "/verify") {
      return {
        status_code = 404;
        headers     = jsonHeaders;
        body        = "{\"status\":\"error\",\"message\":\"Endpoint not found.\"}";
        upgrade     = null;
      };
    };

    // Extract client IP
    let clientIp = label ipSearch : Text {
      for ((k, v) in req.headers.vals()) {
        if (Text.toLowercase(k) == "x-forwarded-for" or Text.toLowercase(k) == "x-real-ip") {
          break ipSearch v;
        };
      };
      "0.0.0.0";
    };

    // Decode body
    let bodyText = switch (Text.fromBlob(req.body)) {
      case null {
        return {
          status_code = 400;
          headers     = jsonHeaders;
          body        = "{\"status\":\"error\",\"message\":\"Body is not valid UTF-8.\"}";
          upgrade     = null;
        };
      };
      case (?t) t;
    };

    let licenseKey    = extractJsonField(bodyText, "license_key");
    let accountNumber = extractJsonField(bodyText, "account_number");
    let platform      = extractJsonField(bodyText, "platform");

    if (licenseKey == "" or accountNumber == "" or platform == "") {
      return {
        status_code = 400;
        headers     = jsonHeaders;
        body        = "{\"status\":\"error\",\"message\":\"Missing required fields.\"}";
        upgrade     = null;
      };
    };

    let result   = doVerify(licenseKey, accountNumber, platform, clientIp);
    let respBody = "{\"status\":\"" # result.status # "\",\"message\":\"" # result.message # "\"}";
    let code : Nat16 = if (result.status == "active") 200 else if (result.status == "error") 429 else 403;

    { status_code = code; headers = jsonHeaders; body = respBody; upgrade = null };
  };

};
