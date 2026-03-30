import { getServerSession } from "next-auth";
import LoginButton from "./LoginButton";
import StudyBuddyGame from "./StudyBuddyGame";
import BentoDashboard from "./BentoDashboard";

const logoSrc =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><rect width="44" height="44" rx="10" fill="#111827"/><text x="22" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">S</text></svg>'
  );

export default async function Page() {
  const session = await getServerSession();
  const year = new Date().getFullYear();
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
        <footer className="mt-12 text-gray-400 text-sm">© {year} StudiBudd</footer>
      </main>
    );
  }

  return <BentoDashboard session={session} />;
}
