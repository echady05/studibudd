import { getServerSession } from "next-auth";
import LoginButton from "./LoginButton";
import StudyBuddyGame from "./StudyBuddyGame";

// Inline fallback logo
const logoSrc =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><rect width="44" height="44" rx="10" fill="#111827"/><text x="22" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">S</text></svg>'
  );

export default async function Page() {
  const session = await getServerSession();
  const year = new Date().getFullYear();

  // --- 1. LANDING / LOGIN PAGE (Shown only if NOT logged in) ---
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <header className="mb-8">
          <img src={logoSrc} alt="StudiBudd" width={80} height={80} className="mx-auto mb-4 rounded-xl shadow-lg" />
          <h1 className="text-5xl font-bold text-gray-900 mb-2">StudiBudd</h1>
          <p className="text-xl text-gray-600 italic">"Your motivation to stay on track"</p>
        </header>

        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full">
          <p className="mb-8 text-gray-500">Sign in with your Google account to start hatching your focus missions.</p>
          <LoginButton />
        </div>
        
        <footer className="mt-12 text-gray-400 text-sm">
          © {year} StudiBudd
        </footer>
      </main>
    );
  }

  // --- 2. FULL WEBSITE (Shown only if LOGGED IN) ---
  return (
    <main>
      <a className="skip-link" href="#game">
        Skip to game
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <img
              src={logoSrc}
              alt="StudiBudd"
              className="brand-logo"
              width={44}
              height={44}
            />
            <div className="brand-text">
              <div className="brand-name">StudiBudd</div>
              <div className="brand-tagline">Study Buddy game</div>
            </div>
          </div>

          <nav className="nav">
            <a href="#game">Play</a>
            <a href="#features">How it works</a>
            <a href="#contact">Contact</a>
            {/* The LoginButton will now show "Sign Out" automatically */}
            <LoginButton />
          </nav>
        </div>
      </header>

      <section className="hero hero-egg">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="pillRow" aria-hidden="true">
              <span className="pill pillEgg pillScience">Science</span>
              <span className="pill pillEgg pillMath">Math</span>
              <span className="pill pillEgg pillBuddy">Mainly StudiBudd</span>
            </div>

            <h1 className="hero-h1">Welcome back, {session.user?.name}!</h1>
            <p className="hero-p">
              Pick Science or Math (or the Mainly StudiBudd egg). Complete missions
              and watch your egg hatch—because studying should feel rewarding.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#game">
                Play in the browser
              </a>
              <a className="btn btn-ghost" href="#features">
                See how it works
              </a>
            </div>

            <div className="trustRow" aria-hidden="true">
              <div className="trustCard">
                <div className="trustTitle">Fast missions</div>
                <div className="trustText">Quick egg missions to keep you moving.</div>
              </div>
              <div className="trustCard">
                <div className="trustTitle">Egg progress</div>
                <div className="trustText">XP, level, streak.</div>
              </div>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="orbit">
              <div className="orb orb1" />
              <div className="orb orb2" />
              <div className="orb orb3" />
            </div>
            <div className="big-egg">
              <div className="big-egg-glow" />
              <div className="big-egg-shell" />
              <div className="big-egg-eyes">
                <span />
                <span />
              </div>
              <div className="big-egg-mouth" />
            </div>
            <div className="mascot-label">Meet your Study Buddy</div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Everything you need to study more</h2>
            <p>Simple gameplay loops that turn studying into “one more mission”.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="featureTop">
                <div className="featureDot featureDotScience" />
                <div className="featureTitle">Choose an egg</div>
              </div>
              <div className="featureText">
                Science, Math, or Mainly StudiBudd. Each egg has its own vibe.
              </div>
            </div>

            <div className="feature-card">
              <div className="featureTop">
                <div className="featureDot featureDotMath" />
                <div className="featureTitle">Complete missions</div>
              </div>
              <div className="featureText">
                Quick questions help you practice while the egg fills up.
              </div>
            </div>

            <div className="feature-card">
              <div className="featureTop">
                <div className="featureDot featureDotBuddy" />
                <div className="featureTitle">Hatch & level up</div>
              </div>
              <div className="featureText">
                Progress becomes XP, XP becomes levels, and your streak keeps going.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="game" className="section section-game">
        <div className="container">
          <StudyBuddyGame />
        </div>
      </section>

      <section id="contact" className="section section-contact">
        <div className="container contact-inner">
          <div className="contact-copy">
            <h2>Contact</h2>
            <p>
              Want StudiBudd for your school? Want to ship new subjects into the game?
              Email us and we’ll build it with you.
            </p>
            <div className="contact-actions">
              <a className="btn btn-primary" href="mailto:hello@studiBudd.com">
                Email StudiBudd
              </a>
              <a className="btn btn-ghost" href="#game">
                Back to game
              </a>
            </div>
          </div>

          <aside className="contact-panel" aria-label="What we can build">
            <div className="panel-title">What you can add</div>
            <div className="panel-body">
              <div className="kv">
                <span>New subjects</span>
                <code>History, Biology, Language</code>
              </div>
              <div className="kv">
                <span>More game</span>
                <code>Daily streaks</code>
                <code>Leaderboards</code>
              </div>
              <div className="kv">
                <span>Study tools</span>
                <code>Focus timers</code>
                <code>Review decks</code>
              </div>
              <p className="panel-note">
                Tell us what students struggle with, and we’ll turn it into missions.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>© {year} StudiBudd</div>
          <div className="footer-links">
            <a href="#game">Play</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}