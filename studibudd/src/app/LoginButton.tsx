"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        style={{
          fontSize: 12, fontWeight: 500,
          color: "var(--bento-text-secondary)",
          background: "transparent",
          border: "0.5px solid var(--bento-border)",
          borderRadius: 8,
          padding: "5px 12px",
          cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2";
          (e.currentTarget as HTMLButtonElement).style.color = "#dc2626";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,0.3)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--bento-text-secondary)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bento-border)";
        }}
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      style={{
        fontSize: 12, fontWeight: 500,
        color: "#fff",
        background: "#111827",
        border: "none",
        borderRadius: 8,
        padding: "5px 14px",
        cursor: "pointer",
      }}
    >
      Sign in with Google
    </button>
  );
}
