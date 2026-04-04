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
            "radial-gradient(900px 500px at 20% 0%, rgb(88, 81, 63), transparent 60%), radial-gradient(800px 500px at 85% 10%, rgb(88, 81, 63), transparent 60%), linear-gradient(160deg, rgb(88, 81, 63) 0%, rgb(88, 81, 63) 40%, rgb(88, 81, 63) 100%)",
        }}
      >
        <div
          style={{
            width: "min(860px, 100%)",
            borderRadius: 30,
            border: "1px solid rgba(128, 127, 127, 0.6)",
            background:
              "linear-gradient(180deg, rgba(172, 169, 162, 0.92) 0%, rgba(130, 123, 108, 0.92) 100%)",
            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.41)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            padding: "36px 28px 34px",
            overflow: "hidden",
            isolation: "isolate",
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
            }}
          />
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#2c3e50",
            }}
          >
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              color: "rgba(0, 0, 0, 0.78)",
              fontSize: "clamp(1.55rem, 2.6vw, 1.75rem)",
              fontWeight: 600,
            }}
          >
            Study and Grow Together
          </p>

          <p style={{ margin: "0 0 14px", color: "rgba(255, 0, 0, 0.5)", fontSize: 14 }}>
          </p>
          <LoginButton />
        </div>
      </main>
    );
  }

  return <BentoDashboard session={session} />;
}