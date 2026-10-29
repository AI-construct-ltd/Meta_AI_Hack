"use client";

import { useAuth } from "@/lib/firebase/AuthContext";
import { IPerson } from "../art/Icons";

export default function UserMenu() {
  const { user, canAuthor, loading, setModalOpen, signOut } = useAuth();

  if (loading) {
    return <span className="auth-user-loading" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        className="auth-sign-btn"
        onClick={() => setModalOpen(true)}
      >
        <IPerson size={15} />
        <span>Sign in</span>
      </button>
    );
  }

  const name = user.displayName || user.email?.split("@")[0] || "Apprentice";
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="auth-user-bar">
      <div className="auth-user-info" title={user.email ?? undefined}>
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt={name} className="auth-avatar" />
        ) : (
          <span className="auth-initials">{initials}</span>
        )}
        <span className="auth-user-name">{name}</span>
        <span
          className="auth-badge"
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            padding: "2px 6px",
            background: canAuthor ? "var(--ink)" : "var(--sunk)",
            color: canAuthor ? "#ffffff" : "var(--ink-3)",
            border: "1px solid var(--line)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {canAuthor ? "Author" : "Apprentice"}
        </span>
      </div>
      <button
        type="button"
        className="auth-logout-btn"
        onClick={() => signOut()}
        title="Sign out of apprentice session"
      >
        Sign out
      </button>
    </div>
  );
}
