"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LoginButton from "../LoginButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "account" | "appearance" | "canvas" | "courses" | "notifications" | "danger";

interface TabItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconAccount() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconAppearance() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.5 2v5.5l3.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconCanvas() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7.5h5M7.5 5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconCourses() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 4.5h11M2 7.5h11M2 10.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconNotifications() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2a1 1 0 0 1 1 1v.3A4 4 0 0 1 11.5 7v2.5l1 1.5H2.5l1-1.5V7a4 4 0 0 1 3-3.7V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 11.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconDanger() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2L13 12H2L7.5 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7.5 6v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

// ─── Reusable field components ─────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <div className="setting-row-content">
        <div className="setting-row-label">{label}</div>
        {description && <div className="setting-row-description">{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`toggle-switch${on ? " active" : ""}`}
      onClick={onToggle}
    >
      <span className="toggle-switch-thumb" style={{ left: on ? 20 : 3 }} />
    </button>
  );
}

function SettingsInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className="settings-input"
      style={disabled ? { opacity: 0.6 } : undefined}
    />
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="section-header">
      <div className="section-header-title">{title}</div>
      {description && <div className="section-header-description">{description}</div>}
      <div className="section-header-divider" />
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function AccountPanel({ session }: { session: any }) {
  const [displayName, setDisplayName] = useState(session?.user?.name ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // Wire up to your API here
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <SectionHeader title="Profile" description="Your public-facing identity on StudiBudd." />

      <SettingRow label="Display name" description="Shown on your dashboard and profile.">
        <SettingsInput value={displayName} onChange={setDisplayName} placeholder="Your name" />
      </SettingRow>

      <SettingRow label="Email address" description="Tied to your Google account. Change via Google.">
        <SettingsInput value={session?.user?.email ?? ""} disabled />
      </SettingRow>

      <SettingRow label="Profile photo" description="Pulled from your Google account automatically.">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="Profile"
              style={{ width: 34, height: 34, borderRadius: "50%", border: "0.5px solid var(--bento-border-hover)" }}
            />
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#412402" }}>
              {(session?.user?.name ?? "?")[0].toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 11, color: "var(--bento-text-tertiary)" }}>Via Google</span>
        </div>
      </SettingRow>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleSave}
          className={`setting-button${saved ? " saved" : ""}`}
        >
          {saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div style={{ marginTop: 36 }}>
        <SectionHeader title="Session" description="Manage how you're signed in." />
        <SettingRow label="Sign out" description="End your current session on this device.">
          <LoginButton />
        </SettingRow>
      </div>
    </div>
  );
}

function AppearancePanel() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  const themes: { id: typeof theme; label: string }[] = [
    { id: "dark", label: "Dark" },
    { id: "light", label: "Light" },
    { id: "system", label: "System" },
  ];

  return (
    <div>
      <SectionHeader title="Theme" description="Control how StudiBudd looks across your session." />

      <SettingRow label="Color theme" description="Choose a base theme for the interface.">
        <div style={{ display: "flex", gap: 5 }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "5px 13px",
                borderRadius: 7,
                border: "0.5px solid",
                borderColor: theme === t.id ? "rgba(99,102,241,0.5)" : "var(--bento-border-hover)",
                background: theme === t.id ? "rgba(99,102,241,0.12)" : "var(--bento-surface)",
                color: theme === t.id ? "#a5b4fc" : "var(--bento-text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow label="Compact mode" description="Reduce spacing in cards and panels.">
        <Toggle on={compactMode} onToggle={() => setCompactMode(v => !v)} />
      </SettingRow>

      <SettingRow label="Animations" description="Creature animations, XP flashes, and transitions.">
        <Toggle on={animations} onToggle={() => setAnimations(v => !v)} />
      </SettingRow>
    </div>
  );
}

function CanvasPanel() {
  const [autoSync, setAutoSync] = useState(true);
  const [markUrgent, setMarkUrgent] = useState(true);
  const [urgentDays, setUrgentDays] = useState("2");

  return (
    <div>
      <SectionHeader title="Sync" description="Control how StudiBudd fetches data from Canvas." />

      <SettingRow label="Auto-sync assignments" description="Refresh your assignment list when you open the dashboard.">
        <Toggle on={autoSync} onToggle={() => setAutoSync(v => !v)} />
      </SettingRow>

      <SettingRow label="Mark assignments as urgent" description="Assignments due within this many days are highlighted.">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SettingsInput
            value={urgentDays}
            onChange={setUrgentDays}
            type="number"
          />
          <span style={{ fontSize: 11, color: "var(--bento-text-tertiary)" }}>days</span>
        </div>
      </SettingRow>

      <SettingRow label="Show urgent badge" description="Highlight urgent assignments in red on the board.">
        <Toggle on={markUrgent} onToggle={() => setMarkUrgent(v => !v)} />
      </SettingRow>

      <div style={{ marginTop: 36 }}>
        <SectionHeader title="Connection" description="Manage your Canvas integration." />
        <SettingRow label="Reconnect Canvas" description="Update your token or switch schools.">
          <button
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "6px 14px",
              background: "var(--bento-surface)",
              color: "var(--bento-text-secondary)",
              border: "0.5px solid var(--bento-border-hover)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Reconnect
          </button>
        </SettingRow>
        <SettingRow label="Disconnect Canvas" description="Remove your token and stop syncing.">
          <button
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "6px 14px",
              background: "rgba(220,38,38,0.07)",
              color: "#f87171",
              border: "0.5px solid rgba(220,38,38,0.25)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Disconnect
          </button>
        </SettingRow>
      </div>
    </div>
  );
}

function CoursesPanel() {
  const [courses, setCourses] = useState<{ id: number | string; name: string; code: string }[]>([]);
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/canvas/courses/manage");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setSelected(data.selected || []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSelection = async (newSelected: (number | string)[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/canvas/courses/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedCourseIds: newSelected }),
      });
      if (res.ok) {
        setSelected(newSelected);
      } else {
        alert("Failed to update course selection");
      }
    } catch (error) {
      console.error("Failed to update courses:", error);
      alert("Failed to update course selection");
    } finally {
      setSaving(false);
    }
  };

  const addManualCourse = async () => {
    if (!newCourseName.trim()) {
      alert("Course name is required");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch("/api/canvas/courses/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualCourse: { name: newCourseName.trim(), code: newCourseCode.trim() }
        }),
      });
      if (res.ok) {
        setNewCourseName("");
        setNewCourseCode("");
        setShowAddForm(false);
        await fetchCourses(); // Refresh the list
      } else {
        alert("Failed to add course");
      }
    } catch (error) {
      console.error("Failed to add course:", error);
      alert("Failed to add course");
    } finally {
      setSaving(false);
    }
  };

  const resetProgress = async (courseId: number | string) => {
    if (!confirm("Are you sure you want to reset progress for this course? This cannot be undone.")) return;
    
    // For manual courses, we need to handle the subject differently
    const subject = typeof courseId === 'string' && courseId.startsWith('manual_') 
      ? `manual_${courseId}` 
      : `canvas_${courseId}`;
      
    try {
      const res = await fetch("/api/progress/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: typeof courseId === 'string' ? courseId : courseId }),
      });
      if (res.ok) {
        alert("Course progress reset successfully");
      } else {
        alert("Failed to reset progress");
      }
    } catch (error) {
      console.error("Failed to reset progress:", error);
      alert("Failed to reset progress");
    }
  };

  if (loading) {
    return (
      <div>
        <SectionHeader title="Courses" description="Manage which courses appear on your dashboard." />
        <div style={{ textAlign: "center", padding: "40px", color: "var(--bento-text-tertiary)" }}>
          Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Courses" description="Manage which courses appear on your dashboard and add manual courses." />

      {/* Add Manual Course Button */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "8px 16px",
            background: "rgba(99,102,241,0.12)",
            color: "#a5b4fc",
            border: "0.5px solid rgba(99,102,241,0.5)",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {showAddForm ? "Cancel" : "+ Add Manual Course"}
        </button>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div style={{
          padding: "20px",
          border: "0.5px solid var(--bento-border)",
          borderRadius: 12,
          background: "var(--bento-surface)",
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--bento-text-primary)" }}>
            Add Manual Course
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--bento-text-secondary)", marginBottom: 4, display: "block" }}>
                Course Name *
              </label>
              <SettingsInput
                value={newCourseName}
                onChange={setNewCourseName}
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--bento-text-secondary)", marginBottom: 4, display: "block" }}>
                Course Code (optional)
              </label>
              <SettingsInput
                value={newCourseCode}
                onChange={setNewCourseCode}
                placeholder="e.g., CS101"
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={addManualCourse}
                disabled={saving || !newCourseName.trim()}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "8px 16px",
                  background: saving || !newCourseName.trim() ? "var(--bento-surface)" : "rgba(99,102,241,0.12)",
                  color: saving || !newCourseName.trim() ? "var(--bento-text-tertiary)" : "#a5b4fc",
                  border: `0.5px solid ${saving || !newCourseName.trim() ? "var(--bento-border-hover)" : "rgba(99,102,241,0.5)"}`,
                  borderRadius: 8,
                  cursor: saving || !newCourseName.trim() ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Adding..." : "Add Course"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCourseName("");
                  setNewCourseCode("");
                }}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "8px 16px",
                  background: "var(--bento-surface)",
                  color: "var(--bento-text-secondary)",
                  border: "0.5px solid var(--bento-border-hover)",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course List */}
      {courses.length === 0 && !showAddForm ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--bento-text-tertiary)" }}>
          No courses found. Add a manual course above or connect Canvas.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {courses.map((course) => {
            const isSelected = selected.includes(course.id);
            const isManual = typeof course.id === 'string' && course.id.startsWith('manual_');
            return (
              <div key={course.id} style={{
                padding: "16px",
                border: "0.5px solid var(--bento-border)",
                borderRadius: 12,
                background: "var(--bento-surface)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bento-text-primary)" }}>
                      {course.name}
                      {isManual && (
                        <span style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginLeft: 8, background: "rgba(99,102,241,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                          Manual
                        </span>
                      )}
                    </div>
                    {course.code && (
                      <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)" }}>
                        {course.code}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => {
                        const newSelected = isSelected
                          ? selected.filter(id => id !== course.id)
                          : [...selected, course.id];
                        updateSelection(newSelected);
                      }}
                      disabled={saving}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "6px 12px",
                        background: isSelected ? "rgba(99,102,241,0.12)" : "var(--bento-surface)",
                        color: isSelected ? "#a5b4fc" : "var(--bento-text-secondary)",
                        border: `0.5px solid ${isSelected ? "rgba(99,102,241,0.5)" : "var(--bento-border-hover)"}`,
                        borderRadius: 8,
                        cursor: saving ? "not-allowed" : "pointer",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {isSelected ? "Remove from Dashboard" : "Add to Dashboard"}
                    </button>
                    <button
                      onClick={() => resetProgress(course.id)}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "6px 12px",
                        background: "rgba(220,38,38,0.07)",
                        color: "#f87171",
                        border: "0.5px solid rgba(220,38,38,0.25)",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Reset Progress
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotificationsPanel() {
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [evolutionAlerts, setEvolutionAlerts] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(false);

  return (
    <div>
      <SectionHeader title="Alerts" description="Choose what StudiBudd notifies you about." />

      <SettingRow label="Assignment reminders" description="Notify when an assignment is due soon.">
        <Toggle on={assignmentReminders} onToggle={() => setAssignmentReminders(v => !v)} />
      </SettingRow>

      <SettingRow label="Evolution alerts" description="Get notified when a creature is ready to evolve.">
        <Toggle on={evolutionAlerts} onToggle={() => setEvolutionAlerts(v => !v)} />
      </SettingRow>

      <SettingRow label="Weekly recap" description="A Sunday summary of XP earned and assignments completed.">
        <Toggle on={weeklyRecap} onToggle={() => setWeeklyRecap(v => !v)} />
      </SettingRow>
    </div>
  );
}

function DangerPanel() {
  const [confirm, setConfirm] = useState("");

  return (
    <div>
      <SectionHeader title="Danger zone" description="These actions are permanent and cannot be undone." />

      <SettingRow label="Reset creature progress" description="Clears all XP and evolution state across every course.">
        <button
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "6px 14px",
            background: "rgba(220,38,38,0.07)",
            color: "#f87171",
            border: "0.5px solid rgba(220,38,38,0.25)",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Reset progress
        </button>
      </SettingRow>

      <SettingRow label="Clear calendar events" description="Removes all manually added events from your calendar.">
        <button
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "6px 14px",
            background: "rgba(220,38,38,0.07)",
            color: "#f87171",
            border: "0.5px solid rgba(220,38,38,0.25)",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Clear events
        </button>
      </SettingRow>

      <div
        style={{
          marginTop: 28,
          padding: "18px 20px",
          borderRadius: 12,
          background: "rgba(220,38,38,0.05)",
          border: "0.5px solid rgba(220,38,38,0.2)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 6 }}>
          Delete account
        </div>
        <div style={{ fontSize: 11, color: "var(--bento-text-tertiary)", marginBottom: 14, lineHeight: 1.6 }}>
          This permanently deletes your StudiBudd account, all creatures, Canvas connections, and preferences. Type <strong style={{ color: "var(--bento-text-secondary)" }}>delete my account</strong> to confirm.
        </div>
        <input
          type="text"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="delete my account"
          style={{
            width: "100%",
            fontSize: 12,
            padding: "8px 11px",
            borderRadius: 9,
            border: "0.5px solid rgba(220,38,38,0.3)",
            background: "var(--bento-surface)",
            color: "var(--bento-text-primary)",
            outline: "none",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />
        <button
          disabled={confirm !== "delete my account"}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "8px 18px",
            background: confirm === "delete my account" ? "#dc2626" : "var(--bento-surface)",
            color: confirm === "delete my account" ? "#fff" : "var(--bento-text-tertiary)",
            border: "none",
            borderRadius: 9,
            cursor: confirm === "delete my account" ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}

// ─── Main settings page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const tabs: TabItem[] = [
    { id: "account",       label: "Account",       icon: <IconAccount /> },
    { id: "appearance",    label: "Appearance",    icon: <IconAppearance /> },
    { id: "canvas",        label: "Canvas",        icon: <IconCanvas /> },
    { id: "courses",       label: "Courses",       icon: <IconCourses /> },
    { id: "notifications", label: "Notifications", icon: <IconNotifications /> },
    { id: "danger",        label: "Danger zone",   icon: <IconDanger /> },
  ];

  return (
    <>
      <style>{`
        :root {
          --bento-bg: #1a1f2e;
          --bento-surface: #111624;
          --bento-border: rgba(255,255,255,0.08);
          --bento-border-hover: rgba(255,255,255,0.16);
          --bento-text-primary: #f0f0f0;
          --bento-text-secondary: #94a3b8;
          --bento-text-tertiary: #64748b;
          --bento-radius: 16px;
        }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d1117 100%)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Top bar ── */}
        <div style={{ maxWidth: 860, margin: "0 auto 24px" }}>
          <a
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--bento-text-tertiary)",
              textDecoration: "none",
              marginBottom: 20,
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--bento-text-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--bento-text-tertiary)")}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to dashboard
          </a>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--bento-text-primary)" }}>Settings</div>
          <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)", marginTop: 3 }}>
            Manage your account, integrations, and preferences.
          </div>
        </div>

        {/* ── Layout ── */}
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "188px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* ── Sidebar tabs ── */}
          <div
            style={{
              background: "var(--bento-bg)",
              border: "0.5px solid var(--bento-border)",
              borderRadius: "var(--bento-radius)",
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              const isDanger = tab.id === "danger";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "9px 11px",
                    borderRadius: 10,
                    border: "none",
                    background: active
                      ? isDanger
                        ? "rgba(220,38,38,0.1)"
                        : "rgba(99,102,241,0.12)"
                      : "transparent",
                    color: active
                      ? isDanger ? "#f87171" : "#a5b4fc"
                      : isDanger ? "rgba(248,113,113,0.55)" : "var(--bento-text-secondary)",
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = "var(--bento-surface)";
                      e.currentTarget.style.color = isDanger ? "#f87171" : "var(--bento-text-primary)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = isDanger ? "rgba(248,113,113,0.55)" : "var(--bento-text-secondary)";
                    }
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{tab.icon}</span>
                  {tab.label}
                  {active && (
                    <span style={{
                      marginLeft: "auto",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: isDanger ? "#f87171" : "#6366f1",
                      flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Content panel ── */}
          <div
            style={{
              background: "var(--bento-bg)",
              border: "0.5px solid var(--bento-border)",
              borderRadius: "var(--bento-radius)",
              padding: "24px 28px",
            }}
          >
            {activeTab === "account"       && <AccountPanel session={session} />}
            {activeTab === "appearance"    && <AppearancePanel />}
            {activeTab === "canvas"        && <CanvasPanel />}
            {activeTab === "courses"       && <CoursesPanel />}
            {activeTab === "notifications" && <NotificationsPanel />}
            {activeTab === "danger"        && <DangerPanel />}
          </div>
        </div>
      </div>
    </>
  );
}