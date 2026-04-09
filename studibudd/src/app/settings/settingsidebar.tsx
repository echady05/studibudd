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
    <div className="settings-page">
      <aside className="settings-sidebar">
        <div className="settings-sidebar-header">
          <p className="settings-sidebar-label">Settings</p>
          <p className="settings-sidebar-email">{email}</p>
        </div>

        <nav className="settings-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-tab-btn${activeTab === tab.id ? " active" : ""}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && <span className="settings-tab-indicator" />}
            </button>
          ))}
        </nav>
      </aside>

      <main className="settings-main">
        {activeTab === "customization" && (
          <div>
            <h2 className="settings-panel-title">Customization</h2>
            <p className="settings-panel-sub">Personalize your StudiBudd experience.</p>
            <div className="settings-panel-card">Customization options coming soon...</div>
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2 className="settings-panel-title">Profile & Account</h2>
            <p className="settings-panel-sub">Manage your account details and preferences.</p>
            <div className="settings-panel-card">Profile settings coming soon...</div>
          </div>
        )}

        {activeTab === "courses" && (
          <div>
            <h2 className="settings-panel-title">Course Management</h2>
            <p className="settings-panel-sub">Add, edit, or remove your courses.</p>
            <div className="settings-panel-card">Course management coming soon...</div>
          </div>
        )}
      </main>
    </div>
  );
}
