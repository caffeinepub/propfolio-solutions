import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminAccount,
  DownloadableFile,
  PaymentGatewaySettings,
  SiteSettings,
} from "../backend";
import { useActor } from "./useActor";

function useActorReady() {
  const { actor, isFetching } = useActor();
  return { actor, isFetching };
}

// ─── Site Settings ────────────────────────────────────────────────────────────
export function useGetSiteSettings() {
  const { actor, isFetching } = useActorReady();
  return useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSiteSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSiteSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveSiteSettings(settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["siteSettings"] }),
  });
}

// ─── Payment Gateway ──────────────────────────────────────────────────────────
export function useGetPaymentGatewaySettings() {
  const { actor, isFetching } = useActorReady();
  return useQuery({
    queryKey: ["paymentGatewaySettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPaymentGatewaySettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavePaymentGatewaySettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: PaymentGatewaySettings) => {
      if (!actor) throw new Error("Not connected");
      return actor.savePaymentGatewaySettings(settings);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["paymentGatewaySettings"] }),
  });
}

// ─── Licenses ─────────────────────────────────────────────────────────────────
export function useGetAllLicenses() {
  const { actor, isFetching } = useActorReady();
  return useQuery({
    queryKey: ["allLicenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLicenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRevokeLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (licenseId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.revokeLicense(licenseId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allLicenses"] }),
  });
}

export function useExtendLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      licenseId,
      extraDays,
    }: {
      licenseId: bigint;
      extraDays: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.extendLicense(licenseId, extraDays);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allLicenses"] }),
  });
}

export function useReassignLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      licenseId,
      newUserPrincipal,
    }: {
      licenseId: bigint;
      newUserPrincipal: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.reassignLicense(licenseId, newUserPrincipal);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allLicenses"] }),
  });
}

export function useManuallyGenerateLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      productId,
      durationDays,
    }: {
      userId: string;
      productId: bigint;
      durationDays: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.manuallyGenerateLicense(userId, productId, durationDays);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allLicenses"] }),
  });
}

// ─── Admin Accounts ───────────────────────────────────────────────────────────
export function useGetAdminAccounts() {
  const { actor, isFetching } = useActorReady();
  return useQuery<AdminAccount[]>({
    queryKey: ["adminAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdminAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      principalText,
    }: {
      username: string;
      principalText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addAdminAccount(username, principalText);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminAccounts"] }),
  });
}

export function useRemoveAdminAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeAdminAccount(principalText);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminAccounts"] }),
  });
}

// ─── Downloadable Files ───────────────────────────────────────────────────────
export function useGetDownloadableFiles() {
  const { actor, isFetching } = useActorReady();
  return useQuery({
    queryKey: ["downloadableFiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDownloadableFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveDownloadableFile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: DownloadableFile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveDownloadableFile(file);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["downloadableFiles"] }),
  });
}

export function useDeleteDownloadableFile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteDownloadableFile(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["downloadableFiles"] }),
  });
}
