import { getServerSession } from "next-auth";
import LoginButton from "./LoginButton";
import BentoDashboard from "./BentoDashboard";

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    const eggs = [
      { src: "pictures/buddies/pink/egg.png",  color: "#f472b6" },
      { src: "pictures/buddies/blue/egg.png",  color: "#60a5fa" },
      { src: "pictures/buddies/green/egg.png", color: "#34d399" },
      { src: "pictures/buddies/red/egg.png",   color: "#f87171" },
      { src: "pictures/buddies/grey/egg.png",  color: "#94a3b8" },
      { src: "pictures/buddies/beige/egg.png", color: "#fbbf24" },
    ];

    return (
      <main style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d1117 100%)",
        boxSizing: "border-box",
        color: "#fff",
        overflowX: "hidden",
      }}>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .egg-float { animation: float 3s ease-in-out infinite; }
          .egg-float:nth-child(2) { animation-delay: 0.4s; }
          .egg-float:nth-child(3) { animation-delay: 0.8s; }
          .egg-float:nth-child(4) { animation-delay: 1.2s; }
          .egg-float:nth-child(5) { animation-delay: 1.6s; }
          .egg-float:nth-child(6) { animation-delay: 2.0s; }
          .sb-steps {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            width: 100%;
            max-width: 820px;
          }
          .sb-step {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 22px 20px;
            text-align: left;
          }
          @media (max-width: 680px) {
            .sb-steps { grid-template-columns: 1fr 1fr; }
            .sb-steps .sb-step:last-child { grid-column: span 2; }
          }
          @media (max-width: 420px) {
            .sb-steps { grid-template-columns: 1fr; }
            .sb-steps .sb-step:last-child { grid-column: span 1; }
          }
        `}</style>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", flexShrink: 0 }}>
          <img
            src="pictures/studibuddlogo/studibuddeggbooks_whitetext.png"
            alt="StudiBudd"
            height={44}
            style={{ objectFit: "contain", display: "block" }}
          />
          <a href="/how-it-works" style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 999,
            padding: "7px 16px",
          }}>
            How it works
          </a>
        </nav>

        {/* Main */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 28px 40px",
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box",
        }}>

          {/* Floating eggs */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
            {eggs.map((egg, i) => (
              <div key={i} className="egg-float" style={{ filter: `drop-shadow(0 6px 18px ${egg.color}55)` }}>
                <img src={egg.src} alt="" width={56} height={70} style={{ objectFit: "contain", display: "block" }} />
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1 style={{
            margin: "0 0 18px",
            fontSize: "clamp(2.4rem, 6.5vw, 4.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}>
            The grind hits different<br />
            <span style={{
              display: "inline-block",
              paddingBottom: "0.1em",
              background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>when something&apos;s hatching.</span>
          </h1>

          <p style={{
            margin: "0 0 44px",
            color: "rgba(255,255,255,0.45)",
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            maxWidth: 460,
            lineHeight: 1.65,
          }}>
            Pick an egg. Do your homework. Watch it hatch. Climb the leaderboard. Actually learn something.
          </p>

          {/* Steps */}
          <div className="sb-steps">
            {[
              { num: "01", title: "Pick your eggs", body: "Choose a buddy for each course. They only grow if you do the work." },
              { num: "02", title: "Do real assignments", body: "Connect Canvas and complete your actual coursework to earn XP - no fake grinding." },
              { num: "03", title: "Play, hatch & compete", body: "Battle in the minigame, hatch evolved forms, and see where you rank on the leaderboard." },
            ].map(s => (
              <div key={s.num} className="sb-step">
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-in footer */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          padding: "28px 32px 44px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              display: "inline-block",
              width: 8, height: 8, borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
            }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
              Sign in with Google, then connect Canvas to start earning XP
            </p>
          </div>
          <LoginButton />
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            Free to use - no credit card needed
          </p>
        </div>

      </main>
    );
  }

  return <BentoDashboard session={session} />;
}