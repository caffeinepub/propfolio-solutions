import Set "mo:core/Set";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";



actor {
  // Core user authentication and blob storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile
  public type UserProfile = {
    name : Text;
    email : Text;
    createdAt : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Products
  type Product = {
    name : Text;
    platform : Text;
    tier : Text;
    price : Float;
    description : Text;
    features : [Text];
    isActive : Bool;
    fileUrl : ?Storage.ExternalBlob;
  };

  var nextProductId = 1;
  let productStore = Map.empty<Nat, Product>();

  public query ({ caller }) func getAllProducts() : async [(Nat, Product)] {
    // Public access - anyone can view products
    productStore.entries().toArray();
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    // Public access
    productStore.get(productId);
  };

  public shared ({ caller }) func createProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    let productId = nextProductId;
    nextProductId += 1;
    productStore.add(productId, product);
    productId;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not productStore.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    productStore.add(productId, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    productStore.remove(productId);
  };

  // Orders
  type OrderStatus = {
    #Pending;
    #Approved;
    #Rejected;
  };

  type Order = {
    userId : Principal;
    productId : Nat;
    amount : Float;
    cryptoCoin : Text;
    paymentHash : Text;
    status : OrderStatus;
    createdAt : Int;
    licenseId : ?Nat;
  };

  var nextOrderId = 1;
  let orderStore = Map.empty<Nat, Order>();
  let orderTradingAccounts = Map.empty<Nat, Text>();

  public shared ({ caller }) func createOrder(productId : Nat, amount : Float, cryptoCoin : Text, paymentHash : Text, tradingAccountNumber : Text) : async Nat {
    // tradingAccountNumber stored separately below
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let orderId = nextOrderId;
    nextOrderId += 1;
    let order : Order = {
      userId = caller;
      productId = productId;
      amount = amount;
      cryptoCoin = cryptoCoin;
      paymentHash = paymentHash;
      status = #Pending;
      createdAt = Time.now();
      licenseId = null;
    };
    orderStore.add(orderId, order);
    orderTradingAccounts.add(orderId, tradingAccountNumber);
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [(Nat, Order)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    orderStore.entries().toArray().filter(func((id, order) : (Nat, Order)) : Bool {
      order.userId == caller;
    });
  };

  public query ({ caller }) func getAllOrders() : async [(Nat, Order)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orderStore.entries().toArray();
  };

  public shared ({ caller }) func approveOrder(orderId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve orders");
    };
    let order = switch (orderStore.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    // Generate license
    let licenseId = await generateLicense(orderId, order.userId, order.productId);

    let updatedOrder = {
      order with
      status = #Approved;
      licenseId = ?licenseId;
    };
    orderStore.add(orderId, updatedOrder);
    licenseId;
  };

  public shared ({ caller }) func rejectOrder(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject orders");
    };
    let order = switch (orderStore.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    let updatedOrder = {
      order with
      status = #Rejected;
    };
    orderStore.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getOrderTradingAccounts() : async [(Nat, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view trading accounts");
    };
    orderTradingAccounts.entries().toArray();
  };

  // Licenses
  type LicenseStatus = {
    #Active;
    #Expired;
    #Revoked;
  };

  type License = {
    orderId : Nat;
    userId : Principal;
    productId : Nat;
    licenseKey : Text;
    platform : Text;
    accountNumbers : [Text];
    maxAccounts : Nat;
    status : LicenseStatus;
    expiryDate : Int;
    createdAt : Int;
  };

  var nextLicenseId = 1;
  let licenseStore = Map.empty<Nat, License>();
  let licenseKeyIndex = Map.empty<Text, Nat>();

  func generateLicenseKey() : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var key = "";
    var i = 0;
    while (i < 16) {
      let randomByte = (Time.now() + i) % 36;
      let index = Int.abs(randomByte) % 36;
      key #= Text.fromChar(chars.chars().toArray()[index]);
      i += 1;
    };
    key;
  };

  func generateLicense(orderId : Nat, userId : Principal, productId : Nat) : async Nat {
    let product = switch (productStore.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let licenseId = nextLicenseId;
    nextLicenseId += 1;

    let licenseKey = generateLicenseKey();
    let license : License = {
      orderId = orderId;
      userId = userId;
      productId = productId;
      licenseKey = licenseKey;
      platform = product.platform;
      accountNumbers = [];
      maxAccounts = 5;
      status = #Active;
      expiryDate = Time.now() + (365 * 24 * 60 * 60 * 1_000_000_000);
      createdAt = Time.now();
    };
    licenseStore.add(licenseId, license);
    licenseKeyIndex.add(licenseKey, licenseId);
    licenseId;
  };

  public query ({ caller }) func validateLicense(licenseKey : Text, accountNumber : Text) : async ?{
    status : LicenseStatus;
    expiryDate : Int;
    platform : Text;
  } {
    // Public access - anyone can validate licenses
    let licenseId = switch (licenseKeyIndex.get(licenseKey)) {
      case (null) { return null };
      case (?id) { id };
    };
    let license = switch (licenseStore.get(licenseId)) {
      case (null) { return null };
      case (?l) { l };
    };

    let hasAccount = license.accountNumbers.find(func(acc) { acc == accountNumber });
    if (hasAccount == null and license.accountNumbers.size() >= license.maxAccounts) {
      return null;
    };

    ?{
      status = license.status;
      expiryDate = license.expiryDate;
      platform = license.platform;
    };
  };

  public query ({ caller }) func getMyLicenses() : async [(Nat, License)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their licenses");
    };
    licenseStore.entries().toArray().filter(func((id, license) : (Nat, License)) : Bool {
      license.userId == caller;
    });
  };

  // NEW: License Management (admin only)
  public query ({ caller }) func getAllLicenses() : async [(Nat, License)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all licenses");
    };
    licenseStore.entries().toArray();
  };

  public shared ({ caller }) func revokeLicense(licenseId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke licenses");
    };
    let license = switch (licenseStore.get(licenseId)) {
      case (null) { Runtime.trap("License not found") };
      case (?l) { l };
    };
    let updatedLicense = {
      license with
      status = #Revoked;
    };
    licenseStore.add(licenseId, updatedLicense);
  };

  public shared ({ caller }) func extendLicense(licenseId : Nat, extraDays : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can extend licenses");
    };
    let license = switch (licenseStore.get(licenseId)) {
      case (null) { Runtime.trap("License not found") };
      case (?l) { l };
    };
    let extraNanos = extraDays * 24 * 60 * 60 * 1_000_000_000;
    let updatedLicense = {
      license with
      expiryDate = license.expiryDate + extraNanos;
    };
    licenseStore.add(licenseId, updatedLicense);
  };

  public shared ({ caller }) func reassignLicense(licenseId : Nat, newUserPrincipal : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reassign licenses");
    };
    let license = switch (licenseStore.get(licenseId)) {
      case (null) { Runtime.trap("License not found") };
      case (?l) { l };
    };
    let newUserId = Principal.fromText(newUserPrincipal);
    let updatedLicense = {
      license with
      userId = newUserId;
    };
    licenseStore.add(licenseId, updatedLicense);
  };

  public shared ({ caller }) func manuallyGenerateLicense(userId : Text, productId : Nat, durationDays : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manually generate licenses");
    };
    let product = switch (productStore.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let userPrincipal = Principal.fromText(userId);
    let licenseId = nextLicenseId;
    nextLicenseId += 1;

    let licenseKey = generateLicenseKey();
    let durationNanos = durationDays * 24 * 60 * 60 * 1_000_000_000;
    let license : License = {
      orderId = 0; // No order associated
      userId = userPrincipal;
      productId = productId;
      licenseKey = licenseKey;
      platform = product.platform;
      accountNumbers = [];
      maxAccounts = 5;
      status = #Active;
      expiryDate = Time.now() + durationNanos;
      createdAt = Time.now();
    };
    licenseStore.add(licenseId, license);
    licenseKeyIndex.add(licenseKey, licenseId);
    licenseId;
  };

  // NEW: Site Settings
  public type SiteSettings = {
    siteName : Text;
    tagline : Text;
    contactEmail : Text;
    supportEmail : Text;
    maintenanceMode : Bool;
    twitterUrl : Text;
    telegramUrl : Text;
    discordUrl : Text;
    youtubeUrl : Text;
  };

  var siteSettings : SiteSettings = {
    siteName = "PropFolio";
    tagline = "Your Property Portfolio Manager";
    contactEmail = "contact@propfolio.com";
    supportEmail = "support@propfolio.com";
    maintenanceMode = false;
    twitterUrl = "";
    telegramUrl = "";
    discordUrl = "";
    youtubeUrl = "";
  };

  public query func getSiteSettings() : async SiteSettings {
    // Public access - anyone can read site settings
    siteSettings;
  };

  public shared ({ caller }) func saveSiteSettings(settings : SiteSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save site settings");
    };
    siteSettings := settings;
  };

  // NEW: Payment Gateway Settings
  public type PaymentGatewaySettings = {
    enabledCoins : [Text];
    paymentInstructions : Text;
    btcAddress : Text;
    ethAddress : Text;
    usdtAddress : Text;
    ltcAddress : Text;
  };

  var paymentGatewaySettings : PaymentGatewaySettings = {
    enabledCoins = ["BTC", "ETH", "USDT", "LTC"];
    paymentInstructions = "Please send payment to the address below";
    btcAddress = "";
    ethAddress = "";
    usdtAddress = "";
    ltcAddress = "";
  };

  public query func getPaymentGatewaySettings() : async PaymentGatewaySettings {
    // Public access - anyone can read payment gateway settings
    paymentGatewaySettings;
  };

  public shared ({ caller }) func savePaymentGatewaySettings(settings : PaymentGatewaySettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save payment gateway settings");
    };
    paymentGatewaySettings := settings;
  };

  // NEW: Downloadable Files
  public type DownloadableFile = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    productId : ?Nat;
    fileUrl : Storage.ExternalBlob;
    uploadedAt : Int;
  };

  var nextDownloadableFileId = 1;
  let downloadableFileStore = Map.empty<Nat, DownloadableFile>();

  public query func getDownloadableFiles() : async [(Nat, DownloadableFile)] {
    // Public access - anyone can view downloadable files
    downloadableFileStore.entries().toArray();
  };

  public shared ({ caller }) func saveDownloadableFile(file : DownloadableFile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save downloadable files");
    };
    let fileId = if (file.id == 0) {
      let newId = nextDownloadableFileId;
      nextDownloadableFileId += 1;
      newId;
    } else {
      file.id;
    };
    let fileToSave = {
      file with
      id = fileId;
    };
    downloadableFileStore.add(fileId, fileToSave);
  };

  public shared ({ caller }) func deleteDownloadableFile(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete downloadable files");
    };
    downloadableFileStore.remove(id);
  };

  // NEW: Admin Account Management
  public type AdminAccount = {
    username : Text;
    principalId : Text;
    createdAt : Int;
  };

  let adminAccountStore = Map.empty<Principal, AdminAccount>();

  public query ({ caller }) func getAdminAccounts() : async [AdminAccount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view admin accounts");
    };
    adminAccountStore.values().toArray();
  };

  public shared ({ caller }) func addAdminAccount(username : Text, principalText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add admin accounts");
    };
    let newAdminPrincipal = Principal.fromText(principalText);
    if (newAdminPrincipal.isAnonymous()) {
      Runtime.trap("Cannot use anonymous principal as admin");
    };
    
    // Grant admin role using AccessControl
    AccessControl.assignRole(accessControlState, caller, newAdminPrincipal, #admin);
    
    // Store admin account info
    let adminAccount : AdminAccount = {
      username = username;
      principalId = principalText;
      createdAt = Time.now();
    };
    adminAccountStore.add(newAdminPrincipal, adminAccount);
  };

  public shared ({ caller }) func removeAdminAccount(principalText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove admin accounts");
    };
    let targetPrincipal = Principal.fromText(principalText);
    
    // Cannot remove self
    if (targetPrincipal == caller) {
      Runtime.trap("Cannot remove your own admin account");
    };
    
    // Revoke admin role using AccessControl
    AccessControl.assignRole(accessControlState, caller, targetPrincipal, #user);
    
    // Remove from admin account store
    adminAccountStore.remove(targetPrincipal);
  };

  // Admin Password Setup - allows first-time admin registration without Caffeine token
  public shared ({ caller }) func setupFirstAdmin(principalText : Text) : async () {
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin is already configured");
    };
    let adminPrincipal = Principal.fromText(principalText);
    if (adminPrincipal.isAnonymous()) {
      Runtime.trap("Cannot use anonymous principal as admin");
    };
    accessControlState.userRoles.add(adminPrincipal, #admin);
    accessControlState.adminAssigned := true;
    
    // Store first admin account
    let adminAccount : AdminAccount = {
      username = "First Admin";
      principalId = principalText;
      createdAt = Time.now();
    };
    adminAccountStore.add(adminPrincipal, adminAccount);
  };

  public query func isAdminRegistered() : async Bool {
    accessControlState.adminAssigned;
  };

  // Force grant admin - one-time bootstrap for credential migration
  public shared ({ caller }) func forceGrantAdmin(secret : Text) : async Text {
    if (secret != "propfolio-reset-2026") {
      return "Invalid bootstrap token.";
    };
    if (caller.isAnonymous()) {
      return "Cannot use anonymous principal.";
    };
    // Grant admin role regardless of adminAssigned flag
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    // Store admin account
    let adminAccount : AdminAccount = {
      username = "Swara0219";
      principalId = Principal.toText(caller);
      createdAt = Time.now();
    };
    adminAccountStore.add(caller, adminAccount);
    "Admin access granted successfully.";
  };

};
