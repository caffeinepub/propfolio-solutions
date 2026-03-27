import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, isInitializing, loginStatus } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const adminQuery = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  const profileQuery = useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isLoggedIn,
    isAdmin: adminQuery.data === true,
    isLoading: isInitializing || isFetching,
    isAdminLoading: adminQuery.isLoading,
    login,
    logout: clear,
    identity,
    loginStatus,
    profile: profileQuery.data ?? null,
    principal: identity?.getPrincipal().toString() ?? "",
  };
}
