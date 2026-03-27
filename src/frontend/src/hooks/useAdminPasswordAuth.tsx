import { Ed25519KeyIdentity } from "@dfinity/identity";
import { createContext, useContext, useEffect, useState } from "react";

const SESSION_KEY = "adminPasswordSeed";

interface AdminPasswordAuthCtx {
  adminIdentity: Ed25519KeyIdentity | null;
  isAdminAuthenticated: boolean;
  adminLogin: (
    username: string,
    password: string,
  ) => Promise<Ed25519KeyIdentity>;
  adminLogout: () => void;
}

const Ctx = createContext<AdminPasswordAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminIdentity, setAdminIdentity] = useState<Ed25519KeyIdentity | null>(
    null,
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const seed = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
        const identity = Ed25519KeyIdentity.generate(seed);
        setAdminIdentity(identity);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  async function adminLogin(
    username: string,
    password: string,
  ): Promise<Ed25519KeyIdentity> {
    const combined = `${username}:${password}`;
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(combined),
    );
    const seed = new Uint8Array(hashBuffer);
    const identity = Ed25519KeyIdentity.generate(seed);
    const b64 = btoa(String.fromCharCode(...seed));
    sessionStorage.setItem(SESSION_KEY, b64);
    setAdminIdentity(identity);
    return identity;
  }

  function adminLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAdminIdentity(null);
  }

  return (
    <Ctx.Provider
      value={{
        adminIdentity,
        isAdminAuthenticated: !!adminIdentity,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdminPasswordAuth() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useAdminPasswordAuth must be used inside AdminAuthProvider",
    );
  return ctx;
}
