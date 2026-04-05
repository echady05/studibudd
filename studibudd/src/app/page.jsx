"use client";

import { useEffect, useRef } from "react";
import LoginButton from "./LoginButton";

const EGGS = [
  { src: "/pictures/buddies/pink/egg.png",  glow: "#f472b6" },
  { src: "/pictures/buddies/blue/egg.png",  glow: "#60a5fa" },
  { src: "/pictures/buddies/green/egg.png", glow: "#34d399" },
  { src: "/pictures/buddies/red/egg.png",   glow: "#f87171" },
  { src: "/pictures/buddies/grey/egg.png",  glow: "#94a3b8" },
  { src: "/pictures/buddies/beige/egg.png", glow: "#fbbf24" },
];

const STEPS = [
  {
    num: "01",
    title: "Pick your eggs",
    body: "Choose a buddy for each course. They only grow if you do the work.",
  },
  {
    num: "02",
    title: "Do real assignments",
    body: "Connect Canvas and complete your actual coursework to earn XP — no fake grinding.",
  },
  {
    num: "03",
    title: "Play, hatch & compete",
    body: "Battle in the minigame, hatch evolved forms, and climb the leaderboard.",
  },
];

export default function SplashPage() {
  const heroSigninRef   = useRef(null);
  const cornerSigninRef = useRef(null);
  const navRef          = useRef(null);
  const navLogoRef      = useRef(null);
  const revealRefs      = useRef([]);

  useEffect(() => {
    const heroSignin   = heroSigninRef.current;
    const cornerSignin = cornerSigninRef.current;
    const nav          = navRef.current;
    const navLogo      = navLogoRef.current;

    function onScroll() {
      const y         = window.scrollY;
      const threshold = window.innerHeight * 0.5;

      // Nav glass effect
      if (nav) {
        if (y > 50) {
          nav.style.background     = "rgba(13,13,26,0.78)";
          nav.style.backdropFilter = "blur(18px)";
          nav.style.borderBottom   = "1px solid rgba(255,255,255,0.07)";
        } else {
          nav.style.background     = "transparent";
          nav.style.backdropFilter = "none";
          nav.style.borderBottom   = "none";
        }
      }

      // Nav logo fades in on scroll
      if (navLogo) {
        navLogo.style.opacity = y > 50 ? "1" : "0";
      }

      // Hero sign-in fades out, corner sign-in fades in
      if (heroSignin && cornerSignin) {
        if (y > threshold) {
          heroSignin.style.opacity       = "0";
          heroSignin.style.pointerEvents = "none";
          cornerSignin.style.opacity       = "1";
          cornerSignin.style.pointerEvents = "auto";
          cornerSignin.style.transform     = "translateY(0)";
        } else {
          heroSignin.style.opacity       = "1";
          heroSignin.style.pointerEvents = "auto";
          cornerSignin.style.opacity       = "0";
          cornerSignin.style.pointerEvents = "none";
          cornerSignin.style.transform     = "translateY(-10px)";
        }
      }

      // Scroll-reveal elements
      revealRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Returns a ref callback that stores the element at index i
  const addReveal = (i) => (el) => {
    revealRefs.current[i] = el;
  };

  return (
    <main style={{
      minHeight: "100vh",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d1117 100%)",
      color: "#fff",
      overflowX: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-13px); }
        }
        .egg-0 { animation: float 3.0s ease-in-out infinite 0.0s; }
        .egg-1 { animation: float 3.2s ease-in-out infinite 0.4s; }
        .egg-2 { animation: float 3.0s ease-in-out infinite 0.8s; }
        .egg-3 { animation: float 3.3s ease-in-out infinite 1.2s; }
        .egg-4 { animation: float 3.1s ease-in-out infinite 1.6s; }
        .egg-5 { animation: float 3.0s ease-in-out infinite 2.0s; }

        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0);  opacity: 0.4; }
          50%       { transform: translateY(8px); opacity: 0.85; }
        }
        .scroll-hint { animation: bounce-arrow 1.8s ease-in-out infinite; }

        .sb-step {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          padding: 26px 22px;
          text-align: left;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
        }
        .sb-step:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-4px);
        }
      `}</style>

      {/* Ambient glow orbs — fixed behind everything */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, top: -180, left: -200, borderRadius: "50%", background: "#f59e0b", filter: "blur(110px)", opacity: 0.12 }} />
        <div style={{ position: "absolute", width: 480, height: 480, top: "45%",  right: -140, borderRadius: "50%", background: "#a855f7", filter: "blur(100px)", opacity: 0.13 }} />
        <div style={{ position: "absolute", width: 400, height: 400, bottom: -80, left: "35%", borderRadius: "50%", background: "#3b82f6", filter: "blur(100px)", opacity: 0.10 }} />
      </div>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{
        position: "fixed", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 28px",
        zIndex: 90,
        transition: "background 0.4s, backdrop-filter 0.4s, border-bottom 0.4s",
        background: "transparent",
      }}>
        <img
          ref={navLogoRef}
          src="/pictures/studibuddlogo/studibuddeggbooks_whitetext.png"
          alt="StudiBudd"
          style={{ height: 46, objectFit: "contain", display: "block", opacity: 0, transition: "opacity 0.5s" }}
        />
        <a href="/how-it-works" style={{
          fontSize: 13, fontWeight: 600,
          color: "rgba(255,255,255,0.65)",
          textDecoration: "none",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 999,
          padding: "7px 16px",
        }}>
          How it works
        </a>
      </nav>

      {/* ── Corner sign-in (fixed, appears on scroll) ── */}
      <div ref={cornerSigninRef} style={{
        position: "fixed", top: 14, right: 28, zIndex: 200,
        opacity: 0, pointerEvents: "none",
        transform: "translateY(-10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(15,15,30,0.75)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(16px)",
        borderRadius: 999,
        padding: "6px 8px 6px 16px",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
          Sign in to play
        </span>
        <LoginButton />
      </div>

      {/* ══ SECTION 1: HERO ══ */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "100px 24px 60px",
        position: "relative", zIndex: 10,
      }}>
        {/* Floating eggs */}
        <div style={{ display: "flex", gap: 18, alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
          {EGGS.map((egg, i) => (
            <div key={i} className={`egg-${i}`} style={{ filter: `drop-shadow(0 8px 22px ${egg.glow}70)` }}>
              <img src={egg.src} alt="" width={64} height={80} style={{ objectFit: "contain", display: "block" }} />
            </div>
          ))}
        </div>

        {/* Headline */}
        <h1 style={{
          margin: "0 0 20px",
          fontSize: "clamp(2.4rem, 6vw, 4.6rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.07,
          maxWidth: 800,
        }}>
          The grind hits different
          <br />
          <span style={{
            background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline-block",
          }}>
            when something&apos;s hatching.
          </span>
        </h1>

        <p style={{
          margin: "0 0 52px",
          color: "rgba(255,255,255,0.42)",
          fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
          maxWidth: 420, lineHeight: 1.65,
        }}>
          Pick an egg. Do your homework. Watch it hatch.
        </p>

        {/* Hero sign-in */}
        <div ref={heroSigninRef} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          transition: "opacity 0.4s ease",
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Free to join
          </p>
          <LoginButton />
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint" style={{ marginTop: 56, fontSize: 20, color: "rgba(255,255,255,0.3)" }}>
          ↓
        </div>
      </section>

      {/* ══ SECTION 2: LOGO CENTERPIECE ══ */}
      <section style={{
        padding: "80px 24px 100px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 10,
      }}>
        {/* Shimmer divider top */}
        <div style={{
          width: "100%", maxWidth: 560, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14) 50%, transparent)",
          marginBottom: 80,
        }} />

        {/* Big logo */}
        <div ref={addReveal(0)} style={{
          opacity: 0, transform: "translateY(36px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}>
          <img
            src="/pictures/studibuddlogo/studibuddeggbooks_whitetext.png"
            alt="StudiBudd"
            style={{
              maxWidth: "min(700px, 90vw)",
              width: "100%",
              objectFit: "contain",
              display: "block",
              filter: "drop-shadow(0 0 50px rgba(245,158,11,0.4)) drop-shadow(0 0 100px rgba(168,85,247,0.25))",
            }}
          />
        </div>

        <p ref={addReveal(1)} style={{
          marginTop: 28, marginBottom: 0,
          color: "rgba(255,255,255,0.3)",
          fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
          letterSpacing: "0.12em",
          fontWeight: 700,
          textTransform: "uppercase",
          opacity: 0, transform: "translateY(24px)",
          transition: "opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s",
        }}>
          Study. Level up. Evolve.
        </p>

        {/* Shimmer divider bottom */}
        <div style={{
          width: "100%", maxWidth: 560, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14) 50%, transparent)",
          marginTop: 80,
        }} />
      </section>

      {/* ══ SECTION 3: HOW IT WORKS ══ */}
      <section style={{
        padding: "20px 24px 100px",
        position: "relative", zIndex: 10,
        maxWidth: 920, margin: "0 auto",
      }}>
        <p ref={addReveal(2)} style={{
          textAlign: "center", fontSize: 11, fontWeight: 800,
          letterSpacing: "0.16em", color: "rgba(255,255,255,0.22)",
          textTransform: "uppercase", marginBottom: 36,
          opacity: 0, transform: "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          How it works
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} ref={addReveal(3 + i)} className="sb-step" style={{
              opacity: 0, transform: "translateY(28px)",
              transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", marginBottom: 10 }}>{s.num}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.44)", lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER CTA ══ */}
      <footer style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 16,
        padding: "48px 32px 64px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.15)",
        textAlign: "center",
      }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
          Ready to hatch?
        </p>
        <LoginButton />
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
          Free to join · No credit card needed
        </p>
      </footer>
    </main>
  );
}