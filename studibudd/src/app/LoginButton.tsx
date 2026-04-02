"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button 
        onClick={() => signOut()} 
        className="btn-logout"
        style={{ fontSize: '12px', fontWeight: 600 }} // Optional: match your pill style
      >
        Sign Out
      </button>
    );
  }

  return (
    <button 
      onClick={() => signIn("google", { callbackUrl: '/' })} 
      className="btn-login"
    >
      Sign in with Google
    </button>
  );
}