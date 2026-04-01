import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession();

  // Redirect to home if not logged in
  if (!session) {
    redirect("/");
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow border">
        <p className="text-gray-600">Logged in as: {session.user.email}</p>
        {/* Add your settings forms or components here */}
      </div>
    </main>
  );
}