import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function AdminSetup() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/admin-login", replace: true });
  }, [navigate]);
  return null;
}
