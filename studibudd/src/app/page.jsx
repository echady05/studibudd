import { getServerSession } from "next-auth";
import LoginButton from "./LoginButton";
import BentoDashboard from "./BentoDashboard";

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          boxSizing: "border-box",
          textAlign: "center",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          background:
            "radial-gradient(1000px 520px at 10% -10%, rgba(202, 225, 238, 0.75), transparent 55%), radial-gradient(900px 460px at 92% 5%, rgba(46, 75, 88, 0.77), transparent 56%), linear-gradient(145deg, #0b1220 0%, #0f172a 42%, #111827 100%)",
        }}
      >
        <div
          style={{
            width: "min(860px, 100%)",
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,0.16)",
            background:
              "linear-gradient(180deg, rgba(112, 106, 106, 0.1) 0%, rgba(255,255,255,0.04) 100%)",
            boxShadow: "0 28px 80px rgba(2, 6, 23, 0.65)",
            backdropFilter: "blur(10px)",
            padding: "36px 28px 34px",
          }}
        >
          <img
            src="pictures\studibuddlogo\studibuddeggbooks.png"
            alt="StudiBudd logo"
            width={920}
            height={360}
            style={{
              width: "100%",
              maxWidth: 760,
              height: "auto",
              display: "block",
              margin: "0 auto 18px",
              borderRadius: 20,
              boxShadow: "0 20px 46px rgba(0,0,0,0.45)",
            }}
          />
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#f8fafc",
            }}
          >
            StudiBudd
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              color: "rgba(226,232,240,0.95)",
              fontSize: "clamp(1.05rem, 2.1vw, 1.25rem)",
              fontWeight: 600,
            }}git status
          >
            Build momentum every single study session.
          </p>

          <p style={{ margin: "0 0 14px", color: "rgba(203,213,225,0.9)", fontSize: 14 }}>
            Sign in to continue
          </p>
          <LoginButton />
        </div>
      </main>
    );
  }

  return <BentoDashboard session={session} />;
}
