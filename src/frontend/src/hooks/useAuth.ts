import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useAdminPasswordAuth } from "./useAdminPasswordAuth";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, isInitializing, loginStatus } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { isAdminAuthenticated, adminLogout } = useAdminPasswordAuth();

  const isLoggedIn =
    isAdminAuthenticated ||
    (!!identity && !identity.getPrincipal().isAnonymous());

  const iiLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const adminQuery = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && iiLoggedIn && !isAdminAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const profileQuery = useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && iiLoggedIn && !isAdminAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  function logout() {
    if (isAdminAuthenticated) {
      adminLogout();
    } else {
      clear();
    }
  }

  return {
    isLoggedIn,
    isAdmin: isAdminAuthenticated || adminQuery.data === true,
    isLoading: isAdminAuthenticated ? false : isInitializing || isFetching,
    isAdminLoading: isAdminAuthenticated ? false : adminQuery.isLoading,
    login,
    logout,
    identity,
    loginStatus,
    profile: profileQuery.data ?? null,
    principal: identity?.getPrincipal().toString() ?? "",
  };
}
