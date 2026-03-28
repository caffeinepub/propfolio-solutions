import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, UserProfile } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

function useActorReady() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  return { actor, isFetching, isLoggedIn };
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGetMyOrders() {
  const { actor, isFetching, isLoggedIn } = useActorReady();
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching, isLoggedIn } = useActorReady();
  return useQuery({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });
}

export function useGetOrderTradingAccounts() {
  const { actor, isFetching, isLoggedIn } = useActorReady();
  return useQuery({
    queryKey: ["orderTradingAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrderTradingAccounts();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });
}

export function useGetMyLicenses() {
  const { actor, isFetching, isLoggedIn } = useActorReady();
  return useQuery({
    queryKey: ["myLicenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyLicenses();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      productId: bigint;
      amount: number;
      cryptoCoin: string;
      paymentHash: string;
      tradingAccountNumber: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(
        params.productId,
        params.amount,
        params.cryptoCoin,
        params.paymentHash,
        params.tradingAccountNumber,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myOrders"] }),
  });
}

export function useApproveOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveOrder(orderId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
      qc.invalidateQueries({ queryKey: ["myLicenses"] });
    },
  });
}

export function useRejectOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectOrder(orderId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProduct(product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product }: { id: bigint; product: Product }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(id, product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

export function useGetLifetimePrices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["lifetimePrices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLifetimePrices();
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSetLifetimePrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      price,
    }: { productId: bigint; price: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.setLifetimePrice(productId, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lifetimePrices"] });
    },
  });
}
