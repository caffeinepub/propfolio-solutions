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

  public shared ({ caller }) func createOrder(productId : Nat, amount : Float, cryptoCoin : Text, paymentHash : Text) : async Nat {
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
};
