"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 24px",
          borderRadius: 12,
          border: "1px solid rgba(44, 62, 80, 0.25)",
          background: "rgba(109, 155, 202, 0.8)",
          color: "rgba(25, 25, 26, 0.75)",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          cursor: "pointer",
          transition: "all 0.18s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(135, 187, 240, 0.8)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(25, 25, 26, 0.75)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(109, 155, 202, 0.8)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(25, 25, 26, 0.75)";
        }}
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "13px 32px",
        borderRadius: 14,
        border: "1px solid rgba(50, 89, 121, 0.35)",
        background: "linear-gradient(160deg, rgb(85, 119, 144) 0%, rgb(50, 89, 121) 100%)",
        color: "#f5f0e8",
        fontSize: 15,
        fontWeight: 700,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        cursor: "pointer",
        boxShadow: "0 4px 18px rgba(50, 89, 121, 0.35)",
        transition: "all 0.18s ease",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "linear-gradient(160deg, rgb(100, 135, 162) 0%, rgb(65, 104, 138) 100%)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 6px 24px rgba(50, 89, 121, 0.50)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "linear-gradient(160deg, rgb(85, 119, 144) 0%, rgb(50, 89, 121) 100%)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 4px 18px rgba(50, 89, 121, 0.35)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      }}
    >
      <GoogleIcon />
      Sign in with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}