import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SettingsSidebar from "./settingsidebar";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <SettingsSidebar/>
      </div>
    </div>
  );
}
