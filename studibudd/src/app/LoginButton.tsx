"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {/* Profile Picture */}
        {session.user?.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name || "User"} 
            className="w-8 h-8 rounded-full border border-gray-200"
          />
        )}
        <span className="text-sm font-medium hidden md:inline">
          {session.user?.name}
        </span>
        <button 
          onClick={() => signOut()} 
          className="btn-logout ml-2"
        >
          Sign Out
        </button>
      </div>
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