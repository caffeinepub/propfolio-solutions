import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetAllProductTrialSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["productTrialSettings"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllProductTrialSettings() as Promise<
        Array<[bigint, { trialEnabled: boolean; trialDurationDays: bigint }]>
      >;
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
  });
}

export function useHasCallerUsedTrial() {
  const { actor, isFetching, isLoggedIn } = useActor();
  return useQuery({
    queryKey: ["hasUsedTrial"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).hasCallerUsedTrial() as Promise<boolean>;
    },
    enabled: !!actor && !isFetching && isLoggedIn,
    staleTime: 60 * 1000,
  });
}

export function useGetUsersWhoUsedTrial() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["usersWhoUsedTrial"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getUsersWhoUsedTrial() as Promise<Array<string>>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetProductTrialSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      trialEnabled,
      trialDurationDays,
    }: {
      productId: bigint;
      trialEnabled: boolean;
      trialDurationDays: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).setProductTrialSettings(
        productId,
        trialEnabled,
        trialDurationDays,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["productTrialSettings"] }),
  });
}

export function useResetUserTrial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).resetUserTrial(principalText);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usersWhoUsedTrial"] }),
  });
}
