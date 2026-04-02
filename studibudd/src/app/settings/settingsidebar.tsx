"use client";

import { useState } from "react";

type Tab = "customization" | "profile" | "courses";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "customization", label: "Customization", icon: "🎨" },
  { id: "profile", label: "Profile & Account", icon: "👤" },
  { id: "courses", label: "Course Management", icon: "📚" },
];

export default function SettingsSidebar({ email }: { email: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("customization");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-0">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 rounded-l-2xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Settings
          </p>
          <p className="text-sm text-gray-500 truncate">{email}</p>
        </div>

        <nav className="p-3 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content Panel */}
      <main className="flex-1 bg-white rounded-r-2xl shadow-sm p-8">
        {activeTab === "customization" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Customization</h2>
            <p className="text-gray-500 mb-6 text-sm">Personalize your StudiBudd experience.</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-gray-400 text-sm">
              Customization options coming soon...
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile & Account</h2>
            <p className="text-gray-500 mb-6 text-sm">Manage your account details and preferences.</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-gray-400 text-sm">
              Profile settings coming soon...
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Course Management</h2>
            <p className="text-gray-500 mb-6 text-sm">Add, edit, or remove your courses.</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-gray-400 text-sm">
              Course management coming soon...
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
