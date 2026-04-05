import LoginButton from "../LoginButton";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connect your Canvas",
      accent: "#10b981",
      body: "Link your school's Canvas account so StudiBudd can see your real assignments. No fake tasks - everything comes straight from your courses.",
      icon: "🔗",
    },
    {
      num: "02",
      title: "Pick an egg for each course",
      accent: "#f59e0b",
      body: "Choose a creature egg to represent each of your classes. Blue for calc, green for bio - whatever fits. Your egg only grows when you actually do the work.",
      icon: "🥚",
    },
    {
      num: "03",
      title: "Complete assignments to earn XP",
      accent: "#6366f1",
      body: "Every assignment you finish earns XP for that course's egg. The harder the assignment, the more XP. No grinding busywork - your real coursework is the game.",
      icon: "⚡",
    },
    {
      num: "04",
      title: "Hatch and evolve your buddy",
      accent: "#a855f7",
      body: "Enough XP and your egg hatches into a creature. Keep studying and it keeps evolving. Miss assignments and your streak breaks. Stay consistent to unlock new forms.",
      icon: "🐣",
    },
    {
      num: "05",
      title: "Play the minigame",
      accent: "#ef4444",
      body: "Jump into the built-in StudiBudd game to put your buddy to work. The stronger your buddy, the better you do. Studying and playing are the same thing here.",
      icon: "🎮",
    },
    {
      num: "06",
      title: "Compete on the leaderboard",
      accent: "#f59e0b",
      body: "See how your XP, streaks, and buddy level stack up against other students. Weekly resets keep the competition fresh. Top of the board means you actually studied.",
      icon: "🏆",
    },
  ];

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d1117 100%)",
      color: "#fff",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      boxSizing: "border-box",
    }}>
      <style>{`
        .hiw-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 860px;
          width: 100%;
        }
        @media (max-width: 640px) {
          .hiw-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 36px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <img
            src="/pictures/studibuddlogo/studibuddeggbooks_whitetext.png"
            alt="StudiBudd"
            height={40}
            style={{ objectFit: "contain", display: "block" }}
          />
        </a>
        <a href="/" style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          textDecoration: "none",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          paddingBottom: 2,
        }}>
          Back to home
        </a>
      </nav>

      {/* Content */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 28px 80px",
        textAlign: "center",
      }}>
        <h1 style={{
          margin: "0 0 14px",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
        }}>
          How it works
        </h1>
        <p style={{
          margin: "0 0 56px",
          color: "rgba(255,255,255,0.4)",
          fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
          maxWidth: 440,
          lineHeight: 1.65,
        }}>
          Six steps from signing up to top of the leaderboard.
        </p>

        <div className="hiw-grid">
          {steps.map(s => (
            <div key={s.num} style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${s.accent}33`,
              borderRadius: 18,
              padding: "26px 24px",
              textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{
                  fontSize: 28,
                  lineHeight: 1,
                  filter: `drop-shadow(0 0 10px ${s.accent}66)`,
                }}>{s.icon}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: s.accent,
                  letterSpacing: "0.12em",
                }}>{s.num}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{s.body}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Ready? Sign in with Google to get started.</p>
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
