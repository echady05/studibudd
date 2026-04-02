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

function CanvasConnect() {
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
  const [preview, setPreview] = useState<{ name: string; courseCount: number } | null>(null);

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
      setPreview({ name: d.userName, courseCount: d.courseCount });
    } catch { setError("Network error — check your connection."); }
    finally { setVerifying(false); }
  }

  async function connect() {
    setError("");
    setSaving(true);
    const cleanUrl = cleanCanvasUrl(url); // [cite: 7, 14]
  
    try {
      const res = await fetch("/api/canvas/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasUrl: cleanUrl, canvasToken: token.trim() }), // 
      });
  
      const d = await res.json().catch(() => ({}));
  
      if (!res.ok) { 
        // If you still see the 500 error here, the backend route logic itself 
        // needs to be changed to stop calling 'mkdir'.
        setError(d.error || "Server storage error. Backend cannot write files."); 
        return;
      }
  
      // Update local state so the UI works even if the server is read-only [cite: 17]
      setStatus("connected");
      setCourseCount(d.courses?.length ?? preview?.courseCount ?? 0);
      setConnectedName(preview?.name ?? "");
      
      setShowModal(false); // [cite: 17]
      setPreview(null); // [cite: 17]
      router.refresh(); // [cite: 17]
  
    } catch (err) { 
      setError("Network error — check your connection."); // 
    } finally { 
      setSaving(false); // 
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
      {/* ── Backdrop + Modal ── */}
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
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
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

            {/* ── Step 1 ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#111827", color: "#fff",
                  fontSize: 11, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>1</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Enter your school's Canvas URL</span>
              </div>
              <img
                src="/pictures/canvashelp/url.png"
                alt="Canvas URL example"
                style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }}
              />
              <input
                type="text"
                placeholder="https://yourschool.instructure.com"
                value={url}
                onChange={e => { setUrl(e.target.value); setPreview(null); }}
                style={{
                  width: "100%", fontSize: 12, padding: "8px 12px",
                  borderRadius: 10, border: "0.5px solid var(--bento-border-hover)",
                  background: "var(--bento-surface)", color: "var(--bento-text-primary)",
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 4 }}>
                Paste anything — we'll clean up the URL automatically.
              </div>
            </div>

            {/* ── Step 2 ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#111827", color: "#fff",
                  fontSize: 11, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>2</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Go to your Canvas token page</span>
              </div>
              <img
                src="/pictures/canvashelp/gentokenbutton.png"
                alt="How to generate a Canvas token"
                style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }}
              />
              <a
                href={tokenPageUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: 12, padding: "8px 12px", borderRadius: 10,
                  border: "0.5px solid var(--bento-border-hover)",
                  background: "var(--bento-surface)", color: "var(--bento-text-primary)",
                  textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <span>Open Canvas Token Page</span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>opens in new tab ↗</span>
              </a>
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 4 }}>
                Account → Settings → scroll to <em>Approved Integrations</em> → click <strong>+ New Access Token</strong>.
              </div>
            </div>

            {/* ── Step 3 ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#111827", color: "#fff",
                  fontSize: 11, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>3</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Fill out the form</span>
              </div>
              <img
                src="/pictures/canvashelp/fillout.png"
                alt="Copy your Canvas token"
                style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }}
              />
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>
                Set your experation date and click generate
              </div>
            </div>

            {/* ── Step 4 ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#111827", color: "#fff",
                  fontSize: 11, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>4</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>Copy and paste your token here</span>
              </div>
              <img
                src="/pictures/canvashelp/copytoken.png"
                alt="Paste token into StudiBudd"
                style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 10 }}
              />
              <input
                type="password"
                placeholder="Paste token here"
                value={token}
                onChange={e => { setToken(e.target.value); setPreview(null); }}
                style={{
                  width: "100%", fontSize: 12, padding: "8px 12px",
                  borderRadius: 10, border: "0.5px solid var(--bento-border-hover)",
                  background: "var(--bento-surface)", color: "var(--bento-text-primary)",
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 4 }}>
                Paste the token you just copied from Canvas.
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 11, color: "#dc2626", background: "rgba(220,38,38,0.07)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                {error}
              </div>
            )}

            {/* Preview success */}
            {preview && (
              <div style={{ fontSize: 11, color: "#1D9E75", background: "rgba(29,158,117,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>✓</span>
                <span>Found <strong>{preview.courseCount} courses</strong> for <strong>{preview.name}</strong> — looks good!</span>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {!preview ? (
                <button
                  onClick={verify}
                  disabled={verifying || !token.trim()}
                  style={{
                    fontSize: 12, padding: "8px 14px",
                    background: "var(--bento-surface)", color: "var(--bento-text-primary)",
                    border: "0.5px solid var(--bento-border-hover)",
                    borderRadius: 10, cursor: verifying || !token.trim() ? "not-allowed" : "pointer",
                    flex: 1, opacity: !token.trim() ? 0.5 : 1,
                  }}
                >
                  {verifying ? "Verifying..." : "Verify Token"}
                </button>
              ) : (
                <button
                  onClick={connect}
                  disabled={saving}
                  style={{
                    fontSize: 12, padding: "8px 14px",
                    background: "#111827", color: "#fff",
                    border: "none", borderRadius: 10, cursor: "pointer", flex: 1,
                  }}
                >
                  {saving ? "Connecting..." : "Save & Connect"}
                </button>
              )}
              <button
                onClick={() => { setShowModal(false); setPreview(null); setError(""); }}
                style={{
                  fontSize: 12, padding: "8px 14px",
                  background: "none", border: "0.5px solid var(--bento-border)",
                  borderRadius: 10, cursor: "pointer", color: "var(--bento-text-secondary)",
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Card trigger ── */}
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
          <button
            onClick={() => setShowModal(true)}
            style={{ width: "100%", textAlign: "left", background: "none", border: "0.5px dashed var(--bento-border-hover)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", color: "var(--bento-text-secondary)", fontSize: 12 }}
          >
            + Connect Canvas to see real assignments &amp; courses
          </button>
        )}
      </div>
    </>
  );
}
// ─── Assignments ──────────────────────────────────────────────────────────────

function Assignments() {
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
  }, []);

  const toggleDone = (id: number) =>
    setLocalDone(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

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
                onClick={() => toggleDone(a.id)}
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

// ─── Single Image / Creature Slot ─────────────────────────────────────────────

function ImageSlot({ slotKey, data, onChange }: {
  slotKey: string;
  data: SlotData;
  onChange: (key: string, data: SlotData) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const slotNumber = slotKey.split("-").map(Number);
  const displayNum = slotNumber[0] * 2 + slotNumber[1];

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      onChange(slotKey, { src: reader.result as string, label: file.name.replace(/\.[^.]+$/, "") });
    reader.readAsDataURL(file);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(slotKey, { src: null, label: `Slot ${displayNum}` });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* Image / creature area */}
      <div style={{
        minHeight: 280, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bento-surface)",
      }}>
        {data.src ? (
          <img
            src={data.src}
            alt={data.label}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {/* Egg / creature placeholder */}
            <div style={{
              width: 54, height: 64,
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              background: "var(--bento-bg)",
              border: "0.5px solid var(--bento-border-hover)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bento-text-tertiary)", display: "block" }} />
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bento-text-tertiary)", display: "block" }} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: "var(--bento-text-tertiary)" }}>Creature slot {displayNum}</span>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                fontSize: 11, color: "var(--bento-text-secondary)",
                background: "var(--bento-bg)",
                border: "0.5px solid var(--bento-border-hover)",
                borderRadius: 6, padding: "4px 12px", cursor: "pointer",
              }}
            >Upload image</button>
          </div>
        )}
        {data.src && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 1 }}
          />
        )}
      </div>

      {/* Caption */}
      <div style={{
        padding: "10px 14px",
        borderTop: "0.5px solid var(--bento-border)",
        background: "var(--bento-bg)",
        position: "relative", zIndex: 2,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--bento-text-primary)" }}>{data.label}</div>
          <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 1 }}>
            {data.src ? "Click to replace" : "Drop or upload"}
          </div>
        </div>
        {data.src && (
          <button onClick={clear} style={{
            fontSize: 10, color: "var(--bento-text-tertiary)",
            background: "none", border: "0.5px solid var(--bento-border)",
            borderRadius: 6, padding: "3px 8px", cursor: "pointer",
          }}>Clear</button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={onInput} style={{ display: "none" }} />
    </div>
  );
}

// ─── Focus Board ──────────────────────────────────────────────────────────────
function FocusBoard() {
  const [page, setPage] = useState(0);
  const [canvasAssignments, setCanvasAssignments] = useState<CanvasAssignment[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string; code: string }[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const EGG_IMAGES = [
    { src: "pictures/buddies/beige/beige-egg.png", label: "Beige Egg" },
    { src: "pictures/buddies/blue/blue-egg.png",   label: "Blue Egg"  },
    { src: "pictures/buddies/green/green-egg.png", label: "Green Egg" },
    { src: "pictures/buddies/grey/grey-egg.png",   label: "Grey Egg"  },
    { src: "pictures/buddies/pink/pink-egg.png",   label: "Pink Egg"  },
    { src: "pictures/buddies/red/red-egg.png",     label: "Red Egg"   },
  ];

  useEffect(() => {
    fetch("/api/canvas/courses")
      .then(r => r.json())
      .then(d => {
        if (d.connected && Array.isArray(d.courses)) {
          setCourses(d.courses);
          setOrder(d.courses.map((_: any, i: number) => i));
        }
      })
      .catch(() => {});

    fetch("/api/canvas/assignments")
      .then(r => r.json())
      .then(d => {
        if (d.connected && Array.isArray(d.assignments)) setCanvasAssignments(d.assignments);
      })
      .catch(() => {});
  }, []);

  const slots = order.map((originalIdx) => ({
    src: EGG_IMAGES[originalIdx % EGG_IMAGES.length].src,
    label: EGG_IMAGES[originalIdx % EGG_IMAGES.length].label,
    course: courses[originalIdx]?.name ?? "",
    courseCode: courses[originalIdx]?.code ?? "",
  }));

  const pages: typeof slots[] = [];
  for (let i = 0; i < slots.length; i += 2) pages.push(slots.slice(i, i + 2));
  const totalPages = Math.max(pages.length, 1);

  const assignmentsForCourse = (courseName: string) =>
    canvasAssignments.filter(a =>
      a.courseName?.toLowerCase().includes(courseName.toLowerCase()) ||
      courseName.toLowerCase().includes(a.courseName?.toLowerCase() ?? "____")
    ).slice(0, 3);

  // Drag handlers
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

  // Swipe / drag for main slide track
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

  if (courses.length === 0) {
    return (
      <div className="bento-card" style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)", marginBottom: 6 }}>Courses</div>
        <div style={{ fontSize: 12, color: "var(--bento-text-tertiary)" }}>Connect Canvas to see your courses here</div>
      </div>
    );
  }

  return (
    <div className="bento-card" style={{ overflow: "hidden" }}>
      {/* ── HEADER WITH INTEGRATED THUMBNAILS ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 18px",
        borderBottom: "0.5px solid var(--bento-border)",
        background: "var(--bento-bg)",
      }}>
        {/* Left Side: Title & Page Count */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: "fit-content" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--bento-text-primary)" }}>Courses</span>
          <span style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>{page + 1} / {totalPages}</span>
        </div>

        {/* Center: THE DRAGGABLE THUMBNAILS */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          overflowX: "auto", flex: 1, margin: "0 15px",
          scrollbarWidth: "none",
        }}>
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

        {/* Right Side: Navigation Arrows */}
        <div style={{ display: "flex", gap: 6 }}>
          {["‹", "›"].map((arrow, i) => {
            const disabled = i === 0 ? page === 0 : page === totalPages - 1;
            return (
              <button 
                key={arrow} 
                onClick={() => goTo(page + (i === 0 ? -1 : 1))} 
                disabled={disabled} 
                style={{
                  background: "none", border: "0.5px solid var(--bento-border)",
                  borderRadius: 6, width: 24, height: 24,
                  cursor: disabled ? "not-allowed" : "pointer",
                  color: disabled ? "var(--bento-text-tertiary)" : "var(--bento-text-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: disabled ? 0.4 : 1,
                }}
              >
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
                const courseAssignments = assignmentsForCourse(slot.course);
                return (
                  <div key={si} style={{
                    borderLeft: si === 1 ? "0.5px solid var(--bento-border)" : "none",
                    display: "flex", flexDirection: "column",
                  }}>
                    {/* Top: course name */}
                    <div style={{
                      padding: "10px 14px 8px",
                      borderBottom: "0.5px solid var(--bento-border)",
                      background: "var(--bento-bg)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--bento-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {slot.course}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {slot.courseCode}
                      </div>
                    </div>

                    {/* Image */}
                    <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bento-surface)" }}>
                      <img
                        src={slot.src} alt={slot.label} draggable={false}
                        onDragStart={e => e.preventDefault()}
                        style={{ width: "100%", height: 220, objectFit: "contain" }}
                      />
                    </div>

                    {/* Bottom: Coming Soon + assignments */}
                    <div style={{ padding: "10px 14px", borderTop: "0.5px solid var(--bento-border)", background: "var(--bento-bg)", flex: 1 }}>
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
  );
}
// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function BentoDashboard({ session }: BentoDashboardProps) {
  const [showGame, setShowGame] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const year = new Date().getFullYear();
  const initials = getInitials(session.user?.name);
  

  return (
    <>
      <style>{`
        :root {
          --bento-bg: #ffffff;
          --bento-surface: #f8f8f7;
          --bento-border: rgba(0,0,0,0.1);
          --bento-border-hover: rgba(0,0,0,0.22);
          --bento-text-primary: #111827;
          --bento-text-secondary: #6b7280;
          --bento-text-tertiary: #9ca3af;
          --bento-radius: 16px;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bento-bg: #1c1c1e;
            --bento-surface: #2c2c2e;
            --bento-border: rgba(255,255,255,0.1);
            --bento-border-hover: rgba(255,255,255,0.22);
            --bento-text-primary: #f5f5f5;
            --bento-text-secondary: #a1a1aa;
            --bento-text-tertiary: #71717a;
          }
        }
        .bento-card {
          background: var(--bento-bg);
          border: 0.5px solid var(--bento-border);
          border-radius: var(--bento-radius);
          overflow: hidden;
        }
        .bento-nav-link {
          font-size: 13px;
          color: var(--bento-text-secondary);
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .bento-nav-link:hover { background: var(--bento-surface); }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "var(--bento-surface)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: 20,
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 12,
          alignItems: "start",
        }}>

          {/* ══ LEFT COLUMN ══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Logo */}
            <div className="bento-card" style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#DAE0ED", gap: 12 }}>
              <img 
              src="/pictures/studibuddlogo/studibuddeggbooks.png"
              alt="StudiBudd Logo" 
              width={169} height={80} style={{ borderRadius: 10, flexShrink: 0, objectFit: "contain"}} />
              <div>
              </div>
            </div>

            {/* Canvas Connect */}
            <CanvasConnect />

            {/* Calendar */}
            <div className="bento-card">
              <Calendar />
            </div>

            {/* Assignments */}
            <div className="bento-card">
              <Assignments />
            </div>

          </div>

{/* ══ RIGHT COLUMN ══ */}
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

{/* Top bar */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div style={{ display: "flex", gap: 4 }}>
    <a href="#features" className="bento-nav-link">How it works</a>
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
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, color: "#412402", flexShrink: 0,
        }}>{initials}</div>
      )}
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--bento-text-primary)" }}>{session.user?.name ?? "Student"}</div>
        <div style={{ fontSize: 10, color: "var(--bento-text-tertiary)" }}>Student</div>
      </div>
      <div style={{ marginLeft: 6 }}>
        <LoginButton />
      </div>
    </div>

    {/* Invisible bridge — fills the gap so mouse doesn't leave hover zone */}
    {showDropdown && (
      <div style={{
        position: "absolute",
        top: "100%",
        right: 0,
        width: "100%",
        height: 12,
        zIndex: 99,
      }} />
    )}

    {/* Dropdown */}
    {showDropdown && (
      <div style={{
        position: "absolute", top: "calc(100% + 4px)", right: 0,
        background: "var(--bento-bg)",
        border: "0.5px solid var(--bento-border)",
        borderRadius: 12, padding: "6px",
        minWidth: 160, zIndex: 100,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>
        {([
          { label: "⚙️  Settings", href: "/settings" },
        ] as { label: string; href: string }[]).map(item => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: "block", fontSize: 12,
              color: "var(--bento-text-primary)",
              textDecoration: "none", padding: "8px 12px",
              borderRadius: 8, transition: "background 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bento-surface)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >{item.label}</a>
        ))}
      </div>
    )}
  </div>
</div>

{/* ── Focus Board ── */}
<FocusBoard />

{/* Game */}
{showGame && (
  <div className="bento-card" id="game">
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px 12px", borderBottom: "0.5px solid var(--bento-border)",
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bento-text-primary)" }}>StudiBudd Game</span>
      <button onClick={() => setShowGame(false)} style={{
        fontSize: 11, color: "var(--bento-text-secondary)",
        background: "none", border: "0.5px solid var(--bento-border)",
        borderRadius: 6, padding: "3px 10px", cursor: "pointer",
      }}>Close</button>
    </div>
    <div style={{ padding: 20 }}>
      <StudyBuddyGame />
    </div>
  </div>
)}

{/* Features */}
<div className="bento-card" id="features" style={{ padding: "20px 24px" }}>
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--bento-text-primary)", margin: 0 }}>How it works</h2>
    <p style={{ fontSize: 12, color: "var(--bento-text-secondary)", marginTop: 4 }}>Find the motivation to stay on track by growing with a buddy.</p>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
    {[
      { dot: "#1D9E75", title: "Choose an egg", text: "Pick the creatures you want to represent your courses" },
      { dot: "#378ADD", title: "Complete assignments", text: "Completing assignments produces XP for your egg." },
      { dot: "#BA7517", title: "Hatch & level up", text: "XP → levels → streak keeps going." },
    ].map(f => (
      <div key={f.title} style={{ background: "var(--bento-surface)", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.dot, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--bento-text-primary)" }}>{f.title}</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--bento-text-secondary)", margin: 0, lineHeight: 1.5 }}>{f.text}</p>
      </div>
    ))}
  </div>
</div>

{/* Contact */}
<div className="bento-card" id="contact" style={{ padding: "20px 24px" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--bento-text-primary)", margin: 0 }}>Contact</h2>
      <p style={{ fontSize: 12, color: "var(--bento-text-secondary)", marginTop: 4, maxWidth: 380 }}>
        Want StudiBudd for your school? Email us and we'll build new subjects with you.
      </p>
    </div>
    <a href="mailto:studibuddcontact@gmail.com" style={{
      display: "inline-block", background: "#111827", color: "#fff",
      fontSize: 12, fontWeight: 500, padding: "8px 18px", borderRadius: 10, textDecoration: "none",
    }}>Email StudiBudd</a>
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