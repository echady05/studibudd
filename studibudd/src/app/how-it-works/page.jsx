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
    <main className="page-shell page-dark">
      <nav className="page-nav">
        <a href="/">
          <img
            src="/pictures/studibuddlogo/studibuddeggbooks_whitetext.png"
            alt="StudiBudd"
            height={40}
            className="brand-logo"
          />
        </a>
        <a href="/">← Home</a>
      </nav>

      <div className="page-container">
        <div className="page-content" style={{ textAlign: "center", paddingTop: 62 }}> 
          <h1 className="page-title">How it works</h1>
          <p className="page-subtitle">Six steps from signing up to top of the leaderboard.</p>

          <div className="hiw-grid">
            {steps.map((step) => (
              <div key={step.num} className="hiw-card" style={{ borderColor: `${step.accent}33` }}>
                <div className="hiw-step-head">
                  <span className="hiw-step-icon" style={{ color: step.accent }}>{step.icon}</span>
                  <span className="hiw-step-badge" style={{ color: step.accent }}>{step.num}</span>
                </div>
                <div className="hiw-step-title">{step.title}</div>
                <div className="hiw-step-body">{step.body}</div>
              </div>
            ))}
          </div>

          <div className="cta-group">
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Ready? Sign in with Google to get started.</p>
            <LoginButton />
          </div>
        </div>
      </div>
    </main>
  );
}
