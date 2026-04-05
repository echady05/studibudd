"use client";

import { useEffect, useState } from "react";

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

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setBoard(d.board); })
      .catch(() => setError("Could not load leaderboard"));
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d1117 100%)",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#fff",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0,
        background: "rgba(13,13,26,0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{
            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999, padding: "7px 16px",
          }}>← Home</a>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>Leaderboard</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Updated as you complete assignments</div>
          </div>
        </div>
        {board && (
          <span style={{
            fontSize: 12, color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "4px 12px", borderRadius: 20,
          }}>
            {board.length} player{board.length !== 1 ? "s" : ""}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Loading skeletons */}
        {!board && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                height: 72, borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                animation: "pulse 1.5s ease-in-out infinite",
                opacity: 1 - i * 0.12,
              }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>{error}</div>
            <a href="/" style={{ display: "inline-block", marginTop: 20, color: "#a78bfa", fontSize: 13, textDecoration: "none" }}>← Back to dashboard</a>
          </div>
        )}

        {/* Empty */}
        {board && board.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 52, marginBottom: 14, filter: "drop-shadow(0 0 20px rgba(168,85,247,0.4))" }}>🥚</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No players yet</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Complete assignments to be the first on the board.</div>
          </div>
        )}

        {board && board.length > 0 && (
          <>
            {/* Podium - top 3 */}
            {board.length >= 3 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 10, marginBottom: 24, alignItems: "end" }}>
                {([1, 0, 2] as const).map(rank => {
                  const entry = board[rank];
                  const isCenter = rank === 0;
                  return (
                    <div key={rank} style={{
                      background: entry.isYou ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${entry.isYou ? "rgba(167,139,250,0.3)" : MEDAL_COLORS[rank] + "33"}`,
                      borderRadius: 18,
                      padding: isCenter ? "24px 16px 20px" : "18px 14px 16px",
                      textAlign: "center",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ fontSize: isCenter ? 32 : 26 }}>{MEDALS[rank]}</span>
                      <div style={{
                        width: isCenter ? 52 : 42, height: isCenter ? 52 : 42,
                        borderRadius: "50%",
                        background: `${MEDAL_COLORS[rank]}22`,
                        border: `2px solid ${MEDAL_COLORS[rank]}66`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: isCenter ? 16 : 14, fontWeight: 700, color: MEDAL_COLORS[rank],
                        overflow: "hidden", flexShrink: 0,
                      }}>
                        {entry.image
                          ? <img src={entry.image} width={isCenter ? 52 : 42} height={isCenter ? 52 : 42} style={{ borderRadius: "50%", objectFit: "cover" }} alt={entry.name} />
                          : getInitials(entry.name)
                        }
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: entry.isYou ? "#c4b5fd" : "#fff" }}>
                        {entry.isYou ? "You" : entry.name.split(" ")[0]}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        Lv.{entry.level} · {entry.xp} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {board.map((entry, idx) => (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px",
                  borderRadius: 16,
                  background: entry.isYou ? "rgba(167,139,250,0.07)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${entry.isYou ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.07)"}`,
                }}>
                  {/* Rank */}
                  <div style={{ width: 28, textAlign: "center", flexShrink: 0 }}>
                    {idx < 3
                      ? <span style={{ fontSize: 18 }}>{MEDALS[idx]}</span>
                      : <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>#{idx + 1}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#a78bfa",
                    flexShrink: 0, overflow: "hidden",
                  }}>
                    {entry.image
                      ? <img src={entry.image} width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} alt={entry.name} />
                      : getInitials(entry.name)
                    }
                  </div>

                  {/* Name + XP bar */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: entry.isYou ? "#c4b5fd" : "#f0f0f0", marginBottom: 5 }}>
                      {entry.name}{entry.isYou ? " (you)" : ""}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>Lv.{entry.level}</span>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)", maxWidth: 120, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          background: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : entry.isYou ? "#a78bfa" : "rgba(255,255,255,0.2)",
                          width: `${Math.min(100, ((entry.xp % 120) / 120) * 100)}%`,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{entry.xp} XP</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{entry.eggCount}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>eggs</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: entry.streak > 0 ? "#fb923c" : undefined }}>{entry.streak}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>streak</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              Scores update as you complete Canvas assignments.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
