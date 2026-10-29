"use client";

import { useAuth } from "@/lib/firebase/AuthContext";
import { useMounted } from "@/lib/useMounted";
import AuthenticatedHome from "./AuthenticatedHome";
import LandingHome from "./LandingHome";

export default function HomeView() {
  const { user, loading, isConfigured } = useAuth();
  const mounted = useMounted();

  // If user is authenticated, render the full current home view
  if (mounted && user) {
    return <AuthenticatedHome />;
  }

  // If checking session for a previously logged-in user, prevent flash
  if (mounted && loading && isConfigured) {
    const hasCachedProfile =
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("aiconstruct_user_profile"));
    if (hasCachedProfile) {
      return (
        <div className="site">
          <div className="auth-user-loading" style={{ minHeight: "60vh" }} aria-hidden="true" />
        </div>
      );
    }
  }

  // Default to landing page when unauthenticated
  return <LandingHome />;
}
