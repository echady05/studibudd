'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => {
        if (data?.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      })
      .catch(() => {
        // If CSRF endpoint fails, allow the form to degrade safely.
      });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!csrfToken) {
      setError('Security token not loaded. Please refresh and try again.');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ displayName, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        setError('Account created, but automatic login failed. Please sign in.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <div className="container authWrap">
        <div className="authCard">
          <div className="authTitle">Sign up</div>
          <div className="authSub">Create your Study Buddy account.</div>

          <form onSubmit={onSubmit} className="authForm">
            <label className="authLabel">
              Display name
              <input
                className="authInput"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                type="text"
                autoComplete="nickname"
                required
              />
            </label>

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
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>

            {error ? <div className="authError">{error}</div> : null}
            {!csrfToken ? (
              <div className="authError">Loading security token... please wait before submitting.</div>
            ) : null}

            <button className="btn btn-primary authBtn" disabled={loading || !csrfToken}>
              {loading ? 'Creating...' : 'Create account'}
            </button>

            <div className="authHint">
              Already have an account?{' '}
              <a className="authLink" href="/login">
                Log in
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
