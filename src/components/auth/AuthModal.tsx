"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { IClose } from "../art/Icons";

export default function AuthModal() {
  const { modalOpen, setModalOpen, isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!modalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
    } catch (err) {
      setError((err as Error).message || "Authentication failed. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError((err as Error).message || "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={() => setModalOpen(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="auth-head">
          <div className="auth-title-group">
            <h2>{mode === "signin" ? "Sign in to AIConstruct" : "Create Apprentice Account"}</h2>
            <p>Access your training progress, custom sub-assemblies and build logs.</p>
          </div>
          <button
            type="button"
            className="auth-close"
            onClick={() => setModalOpen(false)}
            aria-label="Close authentication window"
          >
            <IClose size={18} />
          </button>
        </header>

        {!isConfigured && (
          <div className="auth-notice">
            <b>Firebase Setup Notice:</b> Add your Firebase configuration keys to <code>.env.local</code> (<code>NEXT_PUBLIC_FIREBASE_API_KEY</code>, <code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code>).
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-body">
          <button
            type="button"
            className="auth-btn google"
            onClick={handleGoogle}
            disabled={submitting || !isConfigured}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full name or trade ID</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Alex Miller"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="apprentice@trade-school.ac.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-btn primary" disabled={submitting || !isConfigured}>
              {submitting ? "Signing in..." : mode === "signin" ? "Sign in" : "Create Account"}
            </button>
          </form>

          <footer className="auth-foot">
            {mode === "signin" ? (
              <p>
                New apprentice?{" "}
                <button type="button" className="auth-link-btn" onClick={() => setMode("signup")}>
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{" "}
                <button type="button" className="auth-link-btn" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </p>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
