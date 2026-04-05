"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LeaderboardEntry {
  name: string;
  image: string | null;
  xp: number;
  level: number;
  eggCount: number;
  streak: number;
  isYou: boolean;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_LABELS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setBoard(d.board);
      })
      .catch(() => setError("Could not load leaderboard"));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#f0f0f0",
      padding: "0 0 80px",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ color: "#666", textDecoration: "none", fontSize: 22, lineHeight: 1 }}>←</Link>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.4px" }}>Leaderboard</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 1 }}>Top StudiBudd players</div>
          </div>
        </div>
        {board && (
          <span style={{ fontSize: 12, color: "#555", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "4px 12px", borderRadius: 20 }}>
            {board.length} player{board.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>

        {/* Loading */}
        {!board && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: 72, borderRadius: 16, background: "#161616", border: "1px solid rgba(255,255,255,0.05)", animation: "pulse 1.5s ease-in-out infinite", opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 15, color: "#888" }}>{error}</div>
            <Link href="/" style={{ display: "inline-block", marginTop: 16, color: "#a78bfa", fontSize: 13, textDecoration: "none" }}>← Back to dashboard</Link>
          </div>
        )}

        {/* Empty state */}
        {board && board.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥚</div>
            <div style={{ fontSize: 15, color: "#888" }}>No players yet — be the first!</div>
          </div>
        )}

        {/* Top 3 podium */}
        {board && board.length > 0 && (
          <>
            {board.length >= 3 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20, alignItems: "end" }}>
                {[board[1], board[0], board[2]].map((entry, visualIdx) => {
                  const rank = visualIdx === 1 ? 0 : visualIdx === 0 ? 1 : 2;
                  const heights = ["88px", "110px", "76px"];
                  return (
                    <div
                      key={rank}
                      style={{
                        background: entry.isYou ? "rgba(167,139,250,0.08)" : "#161616",
                        border: `1px solid ${entry.isYou ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 16,
                        padding: "16px 12px 14px",
                        textAlign: "center",
                        minHeight: heights[visualIdx],
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 6,
                      }}
                    >
                      <div style={{ fontSize: 22 }}>{RANK_LABELS[rank]}</div>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: entry.image ? "transparent" : `${RANK_COLORS[rank]}22`,
                        border: `2px solid ${RANK_COLORS[rank]}55`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: RANK_COLORS[rank],
                        overflow: "hidden", flexShrink: 0,
                      }}>
                        {entry.image
                          ? <img src={entry.image} width={40} height={40} style={{ borderRadius: "50%" }} />
                          : getInitials(entry.name)
                        }
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f0f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                        {entry.isYou ? "You" : entry.name.split(" ")[0]}
                      </div>
                      <div style={{ fontSize: 11, color: "#666" }}>Lv.{entry.level} · {entry.xp} XP</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full ranked list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {board.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderRadius: 16,
                    background: entry.isYou ? "rgba(167,139,250,0.07)" : "#161616",
                    border: `1px solid ${entry.isYou ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.06)"}`,
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Rank */}
                  <div style={{ width: 28, textAlign: "center", flexShrink: 0 }}>
                    {idx < 3
                      ? <span style={{ fontSize: 18 }}>{RANK_LABELS[idx]}</span>
                      : <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>#{idx + 1}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: entry.image ? "transparent" : "rgba(167,139,250,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#a78bfa",
                    flexShrink: 0, overflow: "hidden",
                  }}>
                    {entry.image
                      ? <img src={entry.image} width={38} height={38} style={{ borderRadius: "50%" }} />
                      : getInitials(entry.name)
                    }
                  </div>

                  {/* Name + level */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: entry.isYou ? "#c4b5fd" : "#f0f0f0", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {entry.name}{entry.isYou ? " (you)" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: "#555" }}>Lv.{entry.level}</span>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", maxWidth: 100, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          background: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : entry.isYou ? "#a78bfa" : "#444",
                          width: `${Math.min(100, ((entry.xp % 120) / 120) * 100)}%`,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#555" }}>{entry.xp} XP</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{entry.eggCount}</div>
                      <div style={{ fontSize: 10, color: "#555" }}>eggs</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: entry.streak > 0 ? "#fb923c" : "#f0f0f0" }}>{entry.streak}</div>
                      <div style={{ fontSize: 10, color: "#555" }}>streak</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#333" }}>
              Scores update as you complete Canvas assignments and hatch eggs.
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
