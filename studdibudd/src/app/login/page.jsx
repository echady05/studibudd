"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("studiBuddToken", data.token);
      router.push("/");
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <div className="container authWrap">
        <div className="authCard">
          <div className="authTitle">Log in</div>
          <div className="authSub">
            Save progress and sync your egg.
          </div>

          <form onSubmit={onSubmit} className="authForm">
            <label className="authLabel">
              Email
              <input
                className="authInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </label>

            <label className="authLabel">
              Password
              <input
                className="authInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? <div className="authError">{error}</div> : null}

            <button className="btn btn-primary authBtn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="authHint">
              New here?{" "}
              <a className="authLink" href="/signup">
                Create an account
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

