import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    features: Array<string>;
    name: string;
    tier: string;
    description: string;
    platform: string;
    isActive: boolean;
    price: number;
    fileUrl?: ExternalBlob;
}
export interface DownloadableFile {
    id: bigint;
    name: string;
    description: string;
    productId?: bigint;
    category: string;
    uploadedAt: bigint;
    fileUrl: ExternalBlob;
}
export interface PaymentGatewaySettings {
    usdtAddress: string;
    ethAddress: string;
    paymentInstructions: string;
    ltcAddress: string;
    enabledCoins: Array<string>;
    btcAddress: string;
}
export interface Order {
    status: OrderStatus;
    userId: Principal;
    createdAt: bigint;
    productId: bigint;
    licenseId?: bigint;
    paymentHash: string;
    amount: number;
    cryptoCoin: string;
}
export interface SiteSettings {
    tagline: string;
    telegramUrl: string;
    twitterUrl: string;
    maintenanceMode: boolean;
    siteName: string;
    supportEmail: string;
    contactEmail: string;
    discordUrl: string;
    youtubeUrl: string;
}
export interface License {
    maxAccounts: bigint;
    status: LicenseStatus;
    expiryDate: bigint;
    userId: Principal;
    createdAt: bigint;
    productId: bigint;
    platform: string;
    orderId: bigint;
    licenseKey: string;
    accountNumbers: Array<string>;
}
export interface AdminAccount {
    username: string;
    createdAt: bigint;
    principalId: string;
}
export interface UserProfile {
    name: string;
    createdAt: bigint;
    email: string;
}
export interface Coupon {
    code: string;
    discountPercent: number;
    maxTotalUses: bigint;
    maxPerUser: bigint;
    applicableProductIds: Array<bigint>;
    applicablePlatforms: Array<string>;
    expiresAt: bigint;
    isActive: boolean;
    createdAt: bigint;
}
export enum LicenseStatus {
    Active = "Active",
    Revoked = "Revoked",
    Expired = "Expired"
}
export enum OrderStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdminAccount(username: string, principalText: string): Promise<void>;
    approveOrder(orderId: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(productId: bigint, amount: number, cryptoCoin: string, paymentHash: string, tradingAccountNumber: string): Promise<bigint>;
    createProduct(product: Product): Promise<bigint>;
    deleteDownloadableFile(id: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    extendLicense(licenseId: bigint, extraDays: bigint): Promise<void>;
    getAdminAccounts(): Promise<Array<AdminAccount>>;
    getAllLicenses(): Promise<Array<[bigint, License]>>;
    getAllOrders(): Promise<Array<[bigint, Order]>>;
    getAllProducts(): Promise<Array<[bigint, Product]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDownloadableFiles(): Promise<Array<[bigint, DownloadableFile]>>;
    getMyLicenses(): Promise<Array<[bigint, License]>>;
    getMyOrders(): Promise<Array<[bigint, Order]>>;
    getOrderTradingAccounts(): Promise<Array<[bigint, string]>>;
    getPaymentGatewaySettings(): Promise<PaymentGatewaySettings>;
    getProduct(productId: bigint): Promise<Product | null>;
    getSiteSettings(): Promise<SiteSettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdminRegistered(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    manuallyGenerateLicense(userId: string, productId: bigint, durationDays: bigint): Promise<bigint>;
    reassignLicense(licenseId: bigint, newUserPrincipal: string): Promise<void>;
    rejectOrder(orderId: bigint): Promise<void>;
    removeAdminAccount(principalText: string): Promise<void>;
    revokeLicense(licenseId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDownloadableFile(file: DownloadableFile): Promise<void>;
    savePaymentGatewaySettings(settings: PaymentGatewaySettings): Promise<void>;
    saveSiteSettings(settings: SiteSettings): Promise<void>;
    setupFirstAdmin(principalText: string): Promise<void>;
    updateProduct(productId: bigint, product: Product): Promise<void>;
    getLifetimePrices(): Promise<Array<[bigint, number]>>;
    setLifetimePrice(productId: bigint, price: number): Promise<void>;
    removeLifetimePrice(productId: bigint): Promise<void>;
    validateLicense(licenseKey: string, accountNumber: string): Promise<{
        status: LicenseStatus;
        expiryDate: bigint;
        platform: string;
    } | null>;
    // Coupon functions
    getAllCoupons(): Promise<Array<[string, Coupon]>>;
    createCoupon(coupon: Coupon): Promise<void>;
    updateCoupon(code: string, coupon: Coupon): Promise<void>;
    deleteCoupon(code: string): Promise<void>;
    validateCoupon(code: string, productId: bigint, platform: string): Promise<number | null>;
    redeemCoupon(code: string): Promise<void>;
    getCouponStats(code: string): Promise<{ totalUses: bigint }>;
    // Trial functions
    setProductTrialSettings(productId: bigint, trialEnabled: boolean, trialDurationDays: bigint): Promise<void>;
    getAllProductTrialSettings(): Promise<Array<[bigint, { trialEnabled: boolean; trialDurationDays: bigint }]>>;
    hasCallerUsedTrial(): Promise<boolean>;
    markTrialUsed(): Promise<void>;
    resetUserTrial(principalText: string): Promise<void>;
    getUsersWhoUsedTrial(): Promise<Array<string>>;
}
