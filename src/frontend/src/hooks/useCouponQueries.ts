import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

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

export function useGetAllCoupons() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, Coupon]>>({
    queryKey: ["coupons"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllCoupons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Coupon) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createCoupon(coupon);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useUpdateCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, coupon }: { code: string; coupon: Coupon }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updateCoupon(code, coupon);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deleteCoupon(code);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useValidateCoupon(
  code: string,
  productId: bigint,
  platform: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<number | null>({
    queryKey: ["validateCoupon", code, productId.toString(), platform],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).validateCoupon(code, productId, platform);
    },
    enabled: !!actor && !isFetching && code.length > 0,
  });
}
