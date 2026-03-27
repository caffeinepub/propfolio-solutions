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
export interface UserProfile {
    name: string;
    createdAt: bigint;
    email: string;
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
    approveOrder(orderId: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(productId: bigint, amount: number, cryptoCoin: string, paymentHash: string): Promise<bigint>;
    createProduct(product: Product): Promise<bigint>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllOrders(): Promise<Array<[bigint, Order]>>;
    getAllProducts(): Promise<Array<[bigint, Product]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyLicenses(): Promise<Array<[bigint, License]>>;
    getMyOrders(): Promise<Array<[bigint, Order]>>;
    getProduct(productId: bigint): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectOrder(orderId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(productId: bigint, product: Product): Promise<void>;
    validateLicense(licenseKey: string, accountNumber: string): Promise<{
        status: LicenseStatus;
        expiryDate: bigint;
        platform: string;
    } | null>;
}
