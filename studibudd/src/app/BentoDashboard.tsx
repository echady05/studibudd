"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import LoginButton from "./LoginButton";
import StudyBuddyGame from "./StudyBuddyGame";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assignment {
  id: number;
  name: string;
  subject: string;
  due: string;
  done: boolean;
  urgent: boolean;
}

interface CalendarEvent {
  id: number;
  day: number;
  month: number;
  year: number;
  title: string;
  color: string;
}

interface SlotData {
  src: string | null;
  label: string;
}

interface BentoDashboardProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const logoSrc =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><rect width="44" height="44" rx="10" fill="#111827"/><text x="22" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">S</text></svg>'
  );

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DOW = ["S","M","T","W","T","F","S"];
const EVENT_COLORS = ["#BA7517","#1D9E75","#378ADD","#993556","#533AB7","#993C1D"];
const FOCUS_PAGES = 3;
const CREATURE_FOLDERS = ["beige", "blue", "green", "grey", "pink", "red"];
const STAGE_FILES = ["egg", "1", "2"];
const MAX_STAGE = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 1, day: 30, month: 2, year: 2026, title: "Chapter 4 Review due", color: "#BA7517" },
    { id: 2, day: 1,  month: 3, year: 2026, title: "Algebra Problem Set due", color: "#993C1D" },
    { id: 3, day: 3,  month: 3, year: 2026, title: "Egg Hatch milestone", color: "#1D9E75" },
  ]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0]);
  const [nextId, setNextId] = useState(10);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; type: "prev" | "curr" | "next" }[] = [];
  for (let i = 0; i < firstDow; i++)
    cells.push({ day: prevMonthDays - firstDow + 1 + i, type: "prev" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: "curr" });
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 1; i <= remaining; i++)
    cells.push({ day: i, type: "next" });

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const eventsOnDay = (d: number) =>
    events.filter(e => e.day === d && e.month === month && e.year === year);

  const selectedEvents = selectedDay !== null ? eventsOnDay(selectedDay) : [];

  const addEvent = () => {
    if (!newEventTitle.trim() || selectedDay === null) return;
    setEvents(prev => [...prev, {
      id: nextId,
      day: selectedDay,
      month,
      year,
      title: newEventTitle.trim(),
      color: newEventColor,
    }]);
    setNextId(n => n + 1);
    setNewEventTitle("");
  };

  const deleteEvent = (id: number) =>
    setEvents(prev => prev.filter(e => e.id !== id));

  return (
    <div style={{ padding: "18px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>
          {MONTHS[month]} {year}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {["‹", "›"].map((arrow, i) => (
            <button
              key={arrow}
              onClick={i === 0 ? prev : next}
              style={{
                background: "none", border: "0.5px solid var(--bento-border)",
                borderRadius: 6, width: 22, height: 22, cursor: "pointer",
                color: "var(--bento-text-secondary)", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >{arrow}</button>
          ))}
        </div>
      </div>

      {/* Day-of-week labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {DOW.map((d, i) => (
          <span key={i} style={{ textAlign: "center", fontSize: 10, color: "var(--bento-text-tertiary)", fontWeight: 500 }}>{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((cell, i) => {
          const faded = cell.type !== "curr";
          const isT = !faded && isToday(cell.day);
          const isSelected = !faded && selectedDay === cell.day;
          const dayEvents = !faded ? eventsOnDay(cell.day) : [];
          return (
            <div
              key={i}
              onClick={() => !faded && setSelectedDay(prev => prev === cell.day ? null : cell.day)}
              style={{
                aspectRatio: "1",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11,
                color: faded
                  ? "var(--bento-text-tertiary)"
                  : isT ? "#fff"
                  : isSelected ? "#111827"
                  : "var(--bento-text-secondary)",
                opacity: faded ? 0.35 : 1,
                borderRadius: "50%",
                background: isT ? "#111827" : isSelected ? "#FAEEDA" : "transparent",
                fontWeight: isT || isSelected ? 500 : 400,
                position: "relative",
                cursor: faded ? "default" : "pointer",
                transition: "background 0.12s",
              }}
            >
              {cell.day}
              {dayEvents.length > 0 && (
                <span style={{
                  position: "absolute", bottom: 1, left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex", gap: 2,
                }}>
                  {dayEvents.slice(0, 3).map((ev, di) => (
                    <span key={di} style={{
                      width: 3, height: 3, borderRadius: "50%",
                      background: ev.color, display: "block",
                    }} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day panel */}
      {selectedDay !== null && (
        <div style={{ marginTop: 14, borderTop: "0.5px solid var(--bento-border)", paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--bento-text-primary)", marginBottom: 8 }}>
            {MONTHS[month]} {selectedDay}
          </div>

          {selectedEvents.length === 0 && (
            <div style={{ fontSize: 11, color: "var(--bento-text-tertiary)", marginBottom: 8 }}>
              No events — add one below.
            </div>
          )}
          {selectedEvents.map(ev => (
            <div key={ev.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              marginBottom: 6, padding: "5px 8px",
              background: "var(--bento-surface)", borderRadius: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--bento-text-primary)", flex: 1 }}>{ev.title}</span>
              <button
                onClick={() => deleteEvent(ev.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--bento-text-tertiary)", fontSize: 14, lineHeight: 1, padding: "0 2px",
                }}
              >×</button>
            </div>
          ))}

          {/* Color picker row */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 8 }}>
            {EVENT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewEventColor(c)}
                style={{
                  width: 13, height: 13, borderRadius: "50%",
                  background: c,
                  border: newEventColor === c
                    ? "2px solid var(--bento-text-primary)"
                    : "1.5px solid transparent",
                  cursor: "pointer", padding: 0, flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Add event input */}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input
              type="text"
              value={newEventTitle}
              onChange={e => setNewEventTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addEvent()}
              placeholder="Add event..."
              style={{
                flex: 1, fontSize: 11, padding: "5px 8px",
                background: "var(--bento-surface)",
                border: "0.5px solid var(--bento-border-hover)",
                borderRadius: 7, color: "var(--bento-text-primary)",
                outline: "none",
              }}
            />
            <button
              onClick={addEvent}
              style={{
                fontSize: 11, padding: "5px 10px",
                background: "#111827", color: "#fff",
                border: "none", borderRadius: 7, cursor: "pointer",
              }}
            >Add</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#BA7517", display: "inline-block" }} />
        <span style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>Tap a day to add events</span>
      </div>
    </div>
  );
}

// ─── Canvas Connect ───────────────────────────────────────────────────────────
import { useRouter } from "next/navigation";
interface CanvasAssignment {
  id: number;
  name: string;
  courseName: string;
  courseCode: string;
  dueAt: string;
  dueLabel: string;
  urgent: boolean;
  htmlUrl: string;
}

function CanvasConnect({ onConnected }: { onConnected: () => void }) {
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [courseCount, setCourseCount] = useState(0);
  const [connectedName, setConnectedName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("https://canvas.newhaven.edu");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ name: string; courseCount: number; courses: { id: number; name: string; courseCode: string }[] } | null>(null);
  const [step, setStep] = useState<"credentials" | "customize">("credentials");
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());
  const [courseEggs, setCourseEggs] = useState<Record<number, string>>({});
const [eggPickerStep, setEggPickerStep] = useState<"courses" | "eggs">("courses");

  useEffect(() => {
    fetch("/api/canvas/courses")
      .then(r => r.json())
      .then(d => {
        if (d.connected && Array.isArray(d.courses)) {
          setStatus("connected");
          setCourseCount(d.courses.length);
          setConnectedName(d.userName ?? "");
        } else {
          setStatus("disconnected");
        }
      })
      .catch(() => setStatus("disconnected"));
  }, []);

  function cleanCanvasUrl(raw: string) {
    try {
      const u = new URL(raw.trim().replace(/\/+$/, "").split("/courses")[0].split("/profile")[0]);
      return `${u.protocol}//${u.host}`;
    } catch {
      return raw.trim();
    }
  }

  async function verify() {
    setError("");
    setPreview(null);
    const cleanUrl = cleanCanvasUrl(url);
    if (!cleanUrl || !token.trim()) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/canvas/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasUrl: cleanUrl, canvasToken: token.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || "Couldn't verify token — double-check it was copied fully."); return; }
      const courses = d.courses ?? [];
setPreview({ name: d.userName, courseCount: courses.length, courses });
setSelectedCourseIds(new Set(courses.map((c: { id: number }) => c.id)));
setStep("customize");
    } catch { setError("Network error — check your connection."); }
    finally { setVerifying(false); }
  }

  async function connect() {
    setError("");
    setSaving(true);
    const cleanUrl = cleanCanvasUrl(url);
    try {
      const res = await fetch("/api/canvas/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasUrl: cleanUrl,
          canvasToken: token.trim(),
          selectedCourseIds: Array.from(selectedCourseIds),
          courseEggs,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error || "Server storage error. Backend cannot write files.");
        return;
      }
      setStatus("connected");
      setCourseCount(d.courses?.length ?? preview?.courseCount ?? 0);
      setConnectedName(preview?.name ?? "");
      setShowModal(false);
      setPreview(null);
      setStep("credentials");
      setEggPickerStep("courses");
      onConnected();
      router.refresh();
    } catch (err) {
      setError("Network error — check your connection.");
    } finally {
      setSaving(false);
    }
  }

  async function disconnect() {
    await fetch("/api/canvas/connect", { method: "DELETE" });
    setStatus("disconnected");
    setCourseCount(0);
    setConnectedName("");
    router.refresh();
  }

  if (status === "loading") return null;

  const tokenPageUrl = `${cleanCanvasUrl(url)}/profile/settings#access_tokens_holder`;

  return (
    <>
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bento-bg)",
              borderRadius: 20,
              border: "0.5px solid var(--bento-border)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px 28px 24px",
              position: "relative",
            }}
          >
            <button
              onClick={() => { setShowModal(false); setStep("credentials"); setPreview(null); setError(""); }}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "var(--bento-surface)",
                border: "0.5px solid var(--bento-border)",
                borderRadius: 8, width: 28, height: 28,
                cursor: "pointer", fontSize: 14,
                color: "var(--bento-text-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>

            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--bento-text-primary)", marginBottom: 4 }}>
              Connect Canvas
            </div>
            <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)", marginBottom: 24 }}>
              Follow the steps below — takes about 60 seconds.
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Enter your school's Canvas URL</span>
              </div>
              <img src="/pictures/canvashelp/url.png" alt="Canvas URL example" style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }} />
              <input
                type="text"
                placeholder="https://yourschool.instructure.com"
                value={url}
                onChange={e => { setUrl(e.target.value); setPreview(null); }}
                style={{ width: "100%", fontSize: 12, padding: "8px 12px", borderRadius: 10, border: "0.5px solid var(--bento-border-hover)", background: "var(--bento-surface)", color: "var(--bento-text-primary)", outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 4 }}>Paste anything — we'll clean up the URL automatically.</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Go to your Canvas token page</span>
              </div>
              <img src="/pictures/canvashelp/gentokenbutton.png" alt="How to generate a Canvas token" style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }} />
              <a href={tokenPageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "8px 12px", borderRadius: 10, border: "0.5px solid var(--bento-border-hover)", background: "var(--bento-surface)", color: "var(--bento-text-primary)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Open Canvas Token Page</span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>opens in new tab ↗</span>
              </a>
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 4 }}>Account → Settings → scroll to <em>Approved Integrations</em> → click <strong>+ New Access Token</strong>.</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>3</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Fill out the form</span>
              </div>
              <img src="/pictures/canvashelp/fillout.png" alt="Copy your Canvas token" style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }} />
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>Set your experation date and click generate</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>4</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Copy and paste your token here</span>
              </div>
              <img src="/pictures/canvashelp/copytoken.png" alt="Paste token into StudiBudd" style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }} />
              <input
                type="password"
                placeholder="Paste token here"
                value={token}
                onChange={e => { setToken(e.target.value); setPreview(null); }}
                style={{ width: "100%", fontSize: 12, padding: "8px 12px", borderRadius: 10, border: "0.5px solid var(--bento-border-hover)", background: "var(--bento-surface)", color: "var(--bento-text-primary)", outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 4 }}>Paste the token you just copied from Canvas.</div>
            </div>

            {error && (
              <div style={{ fontSize: 11, color: "#dc2626", background: "rgba(220,38,38,0.07)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{error}</div>
            )}

<div style={{ display: "flex", gap: 8 }}>
              <button onClick={verify} disabled={verifying || !token.trim()} style={{ fontSize: 12, padding: "8px 14px", background: "var(--bento-surface)", color: "var(--bento-text-primary)", border: "0.5px solid var(--bento-border-hover)", borderRadius: 10, cursor: verifying || !token.trim() ? "not-allowed" : "pointer", flex: 1, opacity: !token.trim() ? 0.5 : 1 }}>
                {verifying ? "Verifying..." : "Verify Token"}
              </button>
              <button onClick={() => { setShowModal(false); setStep("credentials"); setPreview(null); setError(""); }} style={{ fontSize: 12, padding: "8px 14px", background: "none", border: "0.5px solid var(--bento-border)", borderRadius: 10, cursor: "pointer", color: "var(--bento-text-secondary)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

{/* ── Step 2: Customize modal ── */}
{step === "customize" && preview && (
        <div
          onClick={() => { setStep("credentials"); setEggPickerStep("courses"); }}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--bento-bg)", borderRadius: 20, border: "0.5px solid var(--bento-border)", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: "28px 28px 24px", position: "relative" }}
          >
            {/* Back / close buttons */}
            <button
              onClick={() => {
                if (eggPickerStep === "eggs") setEggPickerStep("courses");
                else setStep("credentials");
              }}
              style={{ position: "absolute", top: 16, left: 16, background: "var(--bento-surface)", border: "0.5px solid var(--bento-border)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "var(--bento-text-secondary)" }}
            >← Back</button>
            <button
              onClick={() => { setStep("credentials"); setShowModal(false); setPreview(null); setError(""); setEggPickerStep("courses"); }}
              style={{ position: "absolute", top: 16, right: 16, background: "var(--bento-surface)", border: "0.5px solid var(--bento-border)", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "var(--bento-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>

            {/* Step indicator */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20, marginTop: 8 }}>
              {["Select Courses", "Pick Eggs"].map((label, i) => {
                const active = (i === 0 && eggPickerStep === "courses") || (i === 1 && eggPickerStep === "eggs");
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: active ? "#6366f1" : "var(--bento-surface)", border: `1px solid ${active ? "#6366f1" : "var(--bento-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: active ? "#fff" : "var(--bento-text-tertiary)" }}>{i + 1}</div>
                    <span style={{ fontSize: 11, color: active ? "var(--bento-text-primary)" : "var(--bento-text-tertiary)", fontWeight: active ? 600 : 400 }}>{label}</span>
                    {i === 0 && <span style={{ fontSize: 11, color: "var(--bento-text-tertiary)" }}>→</span>}
                  </div>
                );
              })}
            </div>

            {/* ── STEP 1: Course selection ── */}
            {eggPickerStep === "courses" && (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--bento-text-primary)", marginBottom: 4 }}>Select courses to track</div>
                <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)", marginBottom: 16 }}>
                  Found <strong style={{ color: "var(--bento-text-primary)" }}>{preview.courseCount} courses</strong> for <strong style={{ color: "var(--bento-text-primary)" }}>{preview.name}</strong>. Uncheck any you don't want.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  {preview.courses.map(course => {
                    const checked = selectedCourseIds.has(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourseIds(prev => {
                          const s = new Set(prev);
                          if (s.has(course.id)) s.delete(course.id); else s.add(course.id);
                          return s;
                        })}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: checked ? "rgba(99,102,241,0.1)" : "var(--bento-surface)", border: `0.5px solid ${checked ? "rgba(99,102,241,0.4)" : "var(--bento-border)"}`, cursor: "pointer", transition: "all 0.15s" }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: checked ? "none" : "1.5px solid var(--bento-border-hover)", background: checked ? "#6366f1" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--bento-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{course.name}</div>
                          {course.courseCode && <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>{course.courseCode}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginBottom: 16 }}>
                  {selectedCourseIds.size} of {preview.courses.length} selected
                </div>
                <button
                  onClick={() => {
                    // Initialize eggs for selected courses that don't have one yet
                    setCourseEggs(prev => {
                      const next = { ...prev };
                      selectedCourseIds.forEach(id => { if (!next[id]) next[id] = "beige"; });
                      return next;
                    });
                    setEggPickerStep("eggs");
                  }}
                  disabled={selectedCourseIds.size === 0}
                  style={{ width: "100%", fontSize: 13, fontWeight: 600, padding: "12px", background: selectedCourseIds.size === 0 ? "var(--bento-surface)" : "#111827", color: selectedCourseIds.size === 0 ? "var(--bento-text-tertiary)" : "#fff", border: "none", borderRadius: 12, cursor: selectedCourseIds.size === 0 ? "not-allowed" : "pointer" }}
                >
                  Next: Pick Eggs →
                </button>
              </>
            )}

            {/* ── STEP 2: Egg per course ── */}
            {eggPickerStep === "eggs" && (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--bento-text-primary)", marginBottom: 4 }}>Pick an egg for each course</div>
                <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)", marginBottom: 20 }}>
                  Each course gets its own creature that grows as you complete assignments.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
                  {preview.courses.filter(c => selectedCourseIds.has(c.id)).map(course => (
                    <div key={course.id}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--bento-text-primary)", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {course.name}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                        {CREATURE_FOLDERS.map(color => {
                          const selected = courseEggs[course.id] === color;
                          return (
                            <div
                              key={color}
                              onClick={() => setCourseEggs(prev => ({ ...prev, [course.id]: color }))}
                              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 10, background: selected ? "rgba(99,102,241,0.1)" : "var(--bento-surface)", border: `1px solid ${selected ? "rgba(99,102,241,0.5)" : "var(--bento-border)"}`, cursor: "pointer", transition: "all 0.15s" }}
                            >
                              <img
                                src={`/pictures/buddies/${color}/egg.png`}
                                alt={`${color} egg`}
                                style={{ width: 40, height: 40, objectFit: "contain", imageRendering: "pixelated" }}
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                              <span style={{ fontSize: 10, fontWeight: 500, color: selected ? "#a5b4fc" : "var(--bento-text-secondary)", textTransform: "capitalize" }}>{color}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ fontSize: 11, color: "#dc2626", background: "rgba(220,38,38,0.07)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{error}</div>
                )}

                <button
                  onClick={connect}
                  disabled={saving}
                  style={{ width: "100%", fontSize: 13, fontWeight: 600, padding: "12px", background: "#111827", color: "#fff", border: "none", borderRadius: 12, cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Connecting..." : `Start with ${selectedCourseIds.size} course${selectedCourseIds.size !== 1 ? "s" : ""} →`}
                </button>
                </>
            )}
          </div>
        </div>
      )}

      <div className="bento-card" style={{ padding: "14px 18px" }}>
        {status === "connected" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--bento-text-primary)" }}>Canvas connected</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--bento-text-tertiary)" }}>
                {connectedName && `${connectedName} · `}{courseCount} course{courseCount !== 1 ? "s" : ""} loaded
              </div>
            </div>
            <button onClick={disconnect} style={{ fontSize: 11, color: "var(--bento-text-tertiary)", background: "none", border: "0.5px solid var(--bento-border)", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={() => setShowModal(true)} style={{
            width: "100%", textAlign: "left", cursor: "pointer",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.12))",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 14, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 28, lineHeight: 1, filter: "drop-shadow(0 0 8px rgba(99,102,241,0.6))" }}>🔗</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Connect Canvas</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>Link your school account to load real assignments and start earning XP</div>
            </div>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>→</span>
          </button>
        )}
      </div>
    </>
  );
}
function Assignments({ refreshKey }: { refreshKey: number }) {
  const [canvasItems, setCanvasItems] = useState<CanvasAssignment[] | null>(null);
  const [localDone, setLocalDone] = useState<Set<number>>(new Set());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/canvas/assignments")
      .then(r => r.json())
      .then(d => {
        setConnected(d.connected);
        if (d.connected && Array.isArray(d.assignments)) setCanvasItems(d.assignments);
      })
      .catch(() => {});
  }, [refreshKey]);

  const toggleDone = (id: number, urgent: boolean) => {
    setLocalDone(prev => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); return s; }
      s.add(id);
      // Award XP when marking done
      fetch("/api/canvas/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: id, urgent }),
      }).catch(() => {});
      return s;
    });
  };

  const pending = canvasItems ? canvasItems.filter(a => !localDone.has(a.id)).length : 0;

  return (
    <div style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Assignments</span>
        {canvasItems && (
          <span style={{ fontSize: 10, background: "#FAEEDA", color: "#854F0B", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
            {pending} pending
          </span>
        )}
      </div>

      {!connected && (
        <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)", textAlign: "center", padding: "16px 0" }}>
          Connect Canvas above to see your real assignments
        </div>
      )}

      {connected && canvasItems && canvasItems.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)", textAlign: "center", padding: "16px 0" }}>
          No upcoming assignments
        </div>
      )}

      {connected && canvasItems && canvasItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {canvasItems.map(a => {
            const done = localDone.has(a.id);
            return (
              <div
                key={a.id}
                onClick={() => toggleDone(a.id, a.urgent)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--bento-surface)", border: "0.5px solid transparent", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--bento-border-hover)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
              >
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: done ? "none" : "1.5px solid var(--bento-border-hover)", background: done ? "#111827" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {done && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: done ? "var(--bento-text-tertiary)" : "var(--bento-text-primary)", textDecoration: done ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 1 }}>{a.courseCode || a.courseName}</div>
                </div>
                <div style={{ fontSize: 10, flexShrink: 0, color: a.urgent && !done ? "#993C1D" : "var(--bento-text-tertiary)" }}>
                  {a.dueLabel}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Focus Board ──────────────────────────────────────────────────────────────

const XP_PER_LEVEL = 100;

interface CreatureState {
  stage: number;
  xp: number;
}

function XpBar({ xp, max }: { xp: number; max: number }) {
  const pct = Math.min((xp / max) * 100, 100);
  return (
    <div style={{ width: "100%", padding: "8px 14px 6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: "var(--bento-text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>XP</span>
        <span style={{ fontSize: 9, color: "var(--bento-text-tertiary)" }}>{xp} / {max}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "var(--bento-border)", overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 99,
          background: "linear-gradient(90deg, #1D9E75, #378ADD)",
          transition: "width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            animation: "xp-shimmer 1.8s infinite",
          }} />
        </div>
      </div>
    </div>
  );
}

function FocusBoard({ refreshKey }: { refreshKey: number }) {
  const [page, setPage] = useState(0);
  const [canvasAssignments, setCanvasAssignments] = useState<CanvasAssignment[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string; code: string }[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Per-slot creature state: keyed by original slot index
  const [creatures, setCreatures] = useState<Record<number, CreatureState>>({});
  // Flash effect type per slot
  const [flash, setFlash] = useState<Record<number, "evolve" | "devolve" | "xp" | null>>({});

  // Debounced save to DB whenever order or creatures change
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (order.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/focusboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseOrder: order, creatureState: creatures }),
      }).catch(() => {});
    }, 800); // debounce — wait 800ms after last change before saving
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [order, creatures]);

  useEffect(() => {
    // Load courses + saved focusboard state in parallel
    Promise.all([
      fetch("/api/canvas/courses").then(r => r.json()),
      fetch("/api/focusboard").then(r => r.json()),
    ])
      .then(([coursesData, savedData]) => {
        if (coursesData.connected && Array.isArray(coursesData.courses)) {
          setCourses(coursesData.courses);
          const indices = coursesData.courses.map((_: any, i: number) => i);

          const savedOrder: number[] | null = savedData.courseOrder ?? null;
          const rawCreatures = savedData.creatureState ?? null;
const savedCreatures: Record<number, CreatureState> | null = rawCreatures
  ? Object.fromEntries(
      Object.entries(rawCreatures).map(([k, v]) => [Number(k), v as CreatureState])
    )
  : null;

          // Only restore order if it still matches current course count
          const validOrder =
            Array.isArray(savedOrder) &&
            savedOrder.length === indices.length &&
            savedOrder.every((v: unknown) => typeof v === "number" && v >= 0 && v < indices.length)
              ? savedOrder
              : indices;

          setOrder(validOrder);
          setCreatures(
            savedCreatures ??
            Object.fromEntries(indices.map((i: number) => [i, { stage: 0, xp: 0 }]))
          );
        }
      })
      .catch(() => {});

    fetch("/api/canvas/assignments")
      .then(r => r.json())
      .then(d => {
        if (d.connected && Array.isArray(d.assignments)) setCanvasAssignments(d.assignments);
      })
      .catch(() => {});
  }, [refreshKey]);

  // ── Creature helpers ──────────────────────────────────────────────────────

  function triggerFlash(slotIdx: number, type: "evolve" | "devolve" | "xp") {
    setFlash(f => ({ ...f, [slotIdx]: type }));
    setTimeout(() => setFlash(f => ({ ...f, [slotIdx]: null })), 650);
  }

  function evolveCreature(e: React.MouseEvent, slotIdx: number) {
    e.stopPropagation();
    setCreatures(prev => {
      const cur = prev[slotIdx] ?? { stage: 0, xp: 0 };
      if (cur.stage >= MAX_STAGE) return prev;
      triggerFlash(slotIdx, "evolve");
      return { ...prev, [slotIdx]: { stage: cur.stage + 1, xp: 0 } };
    });
  }

  function devolveCreature(e: React.MouseEvent, slotIdx: number) {
    e.stopPropagation();
    setCreatures(prev => {
      const cur = prev[slotIdx] ?? { stage: 0, xp: 0 };
      if (cur.stage <= 0) return prev;
      triggerFlash(slotIdx, "devolve");
      return { ...prev, [slotIdx]: { stage: cur.stage - 1, xp: 0 } };
    });
  }

  function addXp(e: React.MouseEvent, slotIdx: number, amount = 25) {
    e.stopPropagation();
    setCreatures(prev => {
      const cur = prev[slotIdx] ?? { stage: 0, xp: 0 };
      const newXp = cur.xp + amount;
      if (newXp >= XP_PER_LEVEL && cur.stage < MAX_STAGE) {
        // Auto-evolve when bar fills
        triggerFlash(slotIdx, "evolve");
        return { ...prev, [slotIdx]: { stage: cur.stage + 1, xp: 0 } };
      }
      triggerFlash(slotIdx, "xp");
      return { ...prev, [slotIdx]: { ...cur, xp: Math.min(newXp, XP_PER_LEVEL) } };
    });
  }

  function getImageSrc(originalIdx: number): string {
    const folder = CREATURE_FOLDERS[originalIdx % CREATURE_FOLDERS.length];
    const stage = creatures[originalIdx]?.stage ?? 0;
    const file = STAGE_FILES[stage];
    return `pictures/buddies/${folder}/${file}.png`;
  }

  // ── Build slot data ───────────────────────────────────────────────────────

  const slots = order.map((originalIdx) => ({
    src: getImageSrc(originalIdx),
    folder: CREATURE_FOLDERS[originalIdx % CREATURE_FOLDERS.length],
    course: courses[originalIdx]?.name ?? "",
    courseCode: courses[originalIdx]?.code ?? "",
    originalIdx,
  }));

  const pages: typeof slots[] = [];
  for (let i = 0; i < slots.length; i += 2) pages.push(slots.slice(i, i + 2));
  const totalPages = Math.max(pages.length, 1);

  const assignmentsForCourse = (courseName: string) =>
    canvasAssignments.filter(a =>
      a.courseName?.toLowerCase().includes(courseName.toLowerCase()) ||
      courseName.toLowerCase().includes(a.courseName?.toLowerCase() ?? "____")
    ).slice(0, 3);

  // ── Drag (thumbnails) ─────────────────────────────────────────────────────

  const onThumbDragStart = (i: number) => setDragIdx(i);
  const onThumbDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIdx(i); };
  const onThumbDrop      = (i: number) => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return; }
    const next = [...order];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    setOrder(next);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  // ── Swipe / drag (slides) ─────────────────────────────────────────────────

  const touchStartX = useRef<number | null>(null);
  const dragStartX  = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const goTo = useCallback((p: number) => {
    setPage(Math.max(0, Math.min(totalPages - 1, p)));
    setDragOffset(0);
  }, [totalPages]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchMove  = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    setDragOffset(e.touches[0].clientX - touchStartX.current);
  };
  const onTouchEnd = () => {
    if (dragOffset < -60 && page < totalPages - 1) goTo(page + 1);
    else if (dragOffset > 60 && page > 0) goTo(page - 1);
    else setDragOffset(0);
    touchStartX.current = null;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStartX.current === null) return;
    setDragOffset(e.clientX - dragStartX.current);
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const dx = dragStartX.current !== null ? e.clientX - dragStartX.current : 0;
    if (dx < -60 && page < totalPages - 1) goTo(page + 1);
    else if (dx > 60 && page > 0) goTo(page - 1);
    else setDragOffset(0);
    dragStartX.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [page, goTo, handleMouseMove, totalPages]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // ── Empty state ───────────────────────────────────────────────────────────

  if (courses.length === 0) {
    return (
      <div className="bento-card" style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)", marginBottom: 6 }}>Courses</div>
        <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)" }}>Connect Canvas to see your courses here</div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes xp-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes flash-evolve {
          0%   { opacity: 0; transform: scale(0.8); }
          40%  { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes flash-xp {
          0%   { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes flash-devolve {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <div className="bento-card" style={{ overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 18px",
          borderBottom: "0.5px solid var(--bento-border)",
          background: "var(--bento-bg)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: "fit-content" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--bento-text-primary)" }}>Courses</span>
            <span style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>{page + 1} / {totalPages}</span>
          </div>

          {/* Thumbnails */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, overflowX: "auto", flex: 1, margin: "0 15px", scrollbarWidth: "none" }}>
            {slots.map((slot, i) => {
              const isOnCurrentPage = Math.floor(i / 2) === page;
              const isDragging = dragIdx === i;
              const isTarget = dragOverIdx === i && dragIdx !== i;
              return (
                <div
                  key={i}
                  draggable
                  onDragStart={() => onThumbDragStart(i)}
                  onDragOver={e => onThumbDragOver(e, i)}
                  onDrop={() => onThumbDrop(i)}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  onClick={() => goTo(Math.floor(i / 2))}
                  style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 6,
                    background: "var(--bento-surface)",
                    border: isTarget ? "2px solid #111827" : isOnCurrentPage ? "1.5px solid var(--bento-text-primary)" : "0.5px solid var(--bento-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "grab", opacity: isDragging ? 0.3 : 1,
                    transform: isTarget ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <img src={slot.src} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} draggable={false} />
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {["‹", "›"].map((arrow, i) => {
              const disabled = i === 0 ? page === 0 : page === totalPages - 1;
              return (
                <button key={arrow} onClick={() => goTo(page + (i === 0 ? -1 : 1))} disabled={disabled} style={{ background: "none", border: "0.5px solid var(--bento-border)", borderRadius: 6, width: 24, height: 24, cursor: disabled ? "not-allowed" : "pointer", color: disabled ? "var(--bento-text-tertiary)" : "var(--bento-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 }}>
                  {arrow}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Slide track ── */}
        <div
          style={{ overflow: "hidden", cursor: "grab", userSelect: "none" }}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div style={{
            display: "flex",
            width: `${totalPages * 100}%`,
            transform: `translateX(calc(${(-page / totalPages) * 100}% + ${dragOffset / totalPages}px))`,
            transition: dragOffset === 0 ? "transform 0.28s cubic-bezier(0.4,0,0.2,1)" : "none",
            willChange: "transform",
          }}>
            {pages.map((pair, pageIdx) => (
              <div key={pageIdx} style={{ width: `${100 / totalPages}%`, display: "grid", gridTemplateColumns: pair.length === 1 ? "1fr" : "1fr 1fr" }}>
                {pair.map((slot, si) => {
                  const oi = slot.originalIdx;
                  const creature = creatures[oi] ?? { stage: 0, xp: 0 };
                  const flashType = flash[oi];
                  const isMaxStage = creature.stage >= MAX_STAGE;
                  const isMinStage = creature.stage <= 0;
                  const stageLabel = creature.stage === 0 ? "Egg" : `Form ${creature.stage}`;
                  const courseAssignments = assignmentsForCourse(slot.course);

                  return (
                    <div key={si} style={{ borderLeft: si === 1 ? "0.5px solid var(--bento-border)" : "none", display: "flex", flexDirection: "column" }}>

                      {/* Course name */}
                      <div style={{ padding: "10px 14px 8px", borderBottom: "0.5px solid var(--bento-border)", background: "var(--bento-bg)", textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 500,  color: "var(--bento-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{slot.courseCode}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--bento-text-tertiary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{slot.course}</div>
                      </div>

                      {/* Creature image */}
                      <div style={{ height: 180, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bento-surface)", overflow: "hidden" }}>
                        <img
                          src={slot.src}
                          alt={stageLabel}
                          draggable={false}
                          onDragStart={e => e.preventDefault()}
                          style={{
                            width: "100%", height: 180, objectFit: "contain",
                            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                            transform: flashType === "evolve" ? "scale(1.1)" : "scale(1)",
                          }}
                        />

                        {/* Flash overlays */}
                        {flashType === "evolve" && (
                          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(255,210,80,0.6) 0%, transparent 70%)", animation: "flash-evolve 0.65s ease-out forwards", pointerEvents: "none" }} />
                        )}
                        {flashType === "devolve" && (
                          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(160,160,200,0.45) 0%, transparent 70%)", animation: "flash-devolve 0.65s ease-out forwards", pointerEvents: "none" }} />
                        )}
                        {flashType === "xp" && (
                          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(29,158,117,0.35) 0%, transparent 65%)", animation: "flash-xp 0.5s ease-out forwards", pointerEvents: "none" }} />
                        )}

                        {/* Stage badge */}
                        <div style={{ position: "absolute", top: 8, left: 8, background: "var(--bento-bg)", border: "0.5px solid var(--bento-border)", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 600, color: "var(--bento-text-secondary)", letterSpacing: "0.05em", pointerEvents: "none" }}>
                          {stageLabel}
                        </div>
                      </div>

                      {/* XP Bar */}
                      <div style={{ background: "var(--bento-bg)" }}>
                        <XpBar xp={creature.xp} max={XP_PER_LEVEL} />
                      </div>

                      {/* Control buttons */}
                      <div style={{ display: "flex", gap: 5, padding: "0 14px 10px", background: "var(--bento-bg)" }}>
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => evolveCreature(e, oi)}
                          disabled={isMaxStage}
                          style={{
                            flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0",
                            background: isMaxStage ? "var(--bento-surface)" : "#111827",
                            color: isMaxStage ? "var(--bento-text-tertiary)" : "#fff",
                            border: "none", borderRadius: 7,
                            cursor: isMaxStage ? "not-allowed" : "pointer",
                            opacity: isMaxStage ? 0.45 : 1,
                            transition: "opacity 0.15s",
                          }}
                        >▲ Evolve</button>
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => devolveCreature(e, oi)}
                          disabled={isMinStage}
                          style={{
                            flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0",
                            background: "var(--bento-surface)",
                            color: isMinStage ? "var(--bento-text-tertiary)" : "var(--bento-text-secondary)",
                            border: "0.5px solid var(--bento-border)",
                            borderRadius: 7,
                            cursor: isMinStage ? "not-allowed" : "pointer",
                            opacity: isMinStage ? 0.45 : 1,
                            transition: "opacity 0.15s",
                          }}
                        >▼ Devolve</button>
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => addXp(e, oi, 25)}
                          style={{
                            flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0",
                            background: "rgba(29,158,117,0.1)",
                            color: "#1D9E75",
                            border: "0.5px solid rgba(29,158,117,0.3)",
                            borderRadius: 7,
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(29,158,117,0.2)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(29,158,117,0.1)")}
                        >+XP</button>
                      </div>

                      {/* Coming Soon / assignments */}
                      <div style={{ padding: "10px 14px 12px", borderTop: "0.5px solid var(--bento-border)", background: "var(--bento-bg)", flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--bento-text-secondary)", marginBottom: 6 }}>Coming Soon</div>
                        {courseAssignments.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {courseAssignments.map(a => (
                              <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 5, padding: "5px 7px", background: "var(--bento-surface)", borderRadius: 7 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: a.urgent ? "#993C1D" : "#378ADD", flexShrink: 0, marginTop: 3 }} />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 10, fontWeight: 500, color: "var(--bento-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                                  <div style={{ fontSize: 9, color: a.urgent ? "#993C1D" : "var(--bento-text-tertiary)", marginTop: 1 }}>{a.dueLabel}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>No upcoming assignments</div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function BentoDashboard({ session }: BentoDashboardProps) {
  const [showGame, setShowGame] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const year = new Date().getFullYear();
  const initials = getInitials(session.user?.name);

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
        .bento-card {
          background: var(--bento-bg);
          border: 1px solid var(--bento-border);
          border-radius: var(--bento-radius);
          overflow: hidden;
        }
        .bento-nav-link {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.15s, color 0.15s;
        }
        .bento-nav-link:hover { background: rgba(255,255,255,0.12); color: #fff; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d1117 100%)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: 20,
        boxSizing: "border-box",
        overflow: "hidden",
        maxWidth: "100vw",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr)",
          gap: 12,
          alignItems: "start",
        }}>

          {/* ══ LEFT COLUMN ══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Logo */}
            <div className="bento-card" style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.03)" }}>
              <img
                src="/pictures/studibuddlogo/studibuddeggbooks_whitetext.png"
                alt="StudiBudd Logo"
                style={{ width: "100%", maxWidth: 180, height: "auto", objectFit: "contain" }}
              />
            </div>

            {/* Canvas Connect */}
            <CanvasConnect onConnected={() => setRefreshKey(k => k + 1)} />

            {/* Calendar */}
            <div className="bento-card">
              <Calendar />
            </div>

            {/* Assignments */}
            <div className="bento-card">
              <Assignments refreshKey={refreshKey} />
            </div>

          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 4 }}>
                <a href="/how-it-works" className="bento-nav-link">How it works</a>
              </div>
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div style={{
                  background: "var(--bento-bg)",
                  border: "0.5px solid var(--bento-border)",
                  borderRadius: 40, padding: "6px 14px 6px 6px",
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "default",
                }}>
                  {session.user?.image ? (
                    <img src={session.user.image} alt={session.user.name ?? "Profile"} width={32} height={32} style={{ borderRadius: "50%", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#412402", flexShrink: 0 }}>{initials}</div>
                  )}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--bento-text-primary)" }}>{session.user?.name ?? "Student"}</div>
                    <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>Student</div>
                  </div>
                  {/* Dropdown chevron */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      color: "var(--bento-text-tertiary)",
                      transition: "transform 0.2s ease, color 0.2s ease",
                      transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  >
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>

                  <div style={{ marginLeft: 6 }}>
                    <LoginButton />
                  </div>
                </div>

                {showDropdown && (
                  <div style={{ position: "absolute", top: "100%", right: 0, width: "100%", height: 12, zIndex: 99 }} />
                )}

                {showDropdown && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0,
                    background: "var(--bento-bg)",
                    border: "0.5px solid var(--bento-border)",
                    borderRadius: 12, padding: "6px",
                    minWidth: 160, zIndex: 100,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}>
                    {([{ label: "⚙️  Settings", href: "/settings" }] as { label: string; href: string }[]).map(item => (
                      <a
                        key={item.href}
                        href={item.href}
                        style={{ display: "block", fontSize: 12, color: "var(--bento-text-primary)", textDecoration: "none", padding: "8px 12px", borderRadius: 8, transition: "background 0.12s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bento-surface)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >{item.label}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Focus Board */}
            <FocusBoard refreshKey={refreshKey} />

            {/* Game */}
            {showGame && (
              <div className="bento-card" id="game">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 12px", borderBottom: "0.5px solid var(--bento-border)" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>StudiBudd Game</span>
                  <button onClick={() => setShowGame(false)} style={{ fontSize: 11, color: "var(--bento-text-secondary)", background: "none", border: "0.5px solid var(--bento-border)", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Close</button>
                </div>
                <div style={{ padding: 20 }}>
                  <StudyBuddyGame />
                </div>
              </div>
            )}

            {/* Features */}
            {/* Contact */}
            <div className="bento-card" id="contact" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--bento-text-primary)", margin: 0 }}>Contact</h2>
                  <p style={{ fontSize: 12, color: "var(--bento-text-secondary)", marginTop: 4, maxWidth: 380 }}>
                    Want StudiBudd for your school? Email us and we'll build new subjects with you.
                  </p>
                </div>
                <a href="mailto:studibuddcontact@gmail.com" style={{ display: "inline-block", background: "#111827", color: "#fff", fontSize: 12, fontWeight: 500, padding: "8px 18px", borderRadius: 10, textDecoration: "none" }}>Email StudiBudd</a>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", paddingBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--bento-text-tertiary)" }}>© {year} StudiBudd</span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}