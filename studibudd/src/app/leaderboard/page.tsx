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
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setBoard(d.board);
      })
      .catch(() => setError("Could not load leaderboard"));
  }, []);

  return (
    <main className="page-shell page-dark">
      <nav className="page-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/">← Home</a>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>Leaderboard</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
              Updated as you complete assignments
            </div>
          </div>
        </div>
        {board && (
          <span className="page-pill">
            {board.length} player{board.length !== 1 ? "s" : ""}
          </span>
        )}
      </nav>

      <div className="page-container">
        {!board && !error && (
          <div className="leaderboard-loading">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="leaderboard-skeleton" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        )}

        {error && (
          <div className="page-status">
            <div className="page-status-icon">🔒</div>
            <div className="page-status-text">{error}</div>
            <a href="/" className="page-link">← Back to dashboard</a>
          </div>
        )}

        {board && board.length === 0 && (
          <div className="page-status">
            <div className="page-status-icon">🥚</div>
            <div className="page-status-title">No players yet</div>
            <div className="page-status-text">Complete assignments to be the first on the board.</div>
          </div>
        )}

        {board && board.length > 0 && (
          <>
            {board.length >= 3 && (
              <div className="leaderboard-podium">
                {([1, 0, 2] as const).map((rank) => {
                  const entry = board[rank];
                  const isCenter = rank === 0;
                  return (
                    <div
                      key={rank}
                      className="leaderboard-podium-card"
                      style={{ borderColor: entry.isYou ? "rgba(167,139,250,0.3)" : `${MEDAL_COLORS[rank]}33` }}
                    >
                      <span className="leaderboard-podium-medal">{MEDALS[rank]}</span>
                      <div
                        className="leaderboard-avatar"
                        style={{
                          background: `${MEDAL_COLORS[rank]}22`,
                          borderColor: `${MEDAL_COLORS[rank]}66`,
                          color: MEDAL_COLORS[rank],
                          width: isCenter ? 52 : 42,
                          height: isCenter ? 52 : 42,
                          fontSize: isCenter ? 16 : 14,
                        }}
                      >
                        {entry.image ? (
                          <img
                            src={entry.image}
                            width={isCenter ? 52 : 42}
                            height={isCenter ? 52 : 42}
                            alt={entry.name}
                            className="leaderboard-avatar-img"
                          />
                        ) : (
                          getInitials(entry.name)
                        )}
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

            <div className="leaderboard-list">
              {board.map((entry, idx) => (
                <div
                  key={idx}
                  className="leaderboard-item"
                  style={{
                    borderColor: entry.isYou ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.07)",
                    background: entry.isYou ? "rgba(167,139,250,0.07)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="leaderboard-rank">
                    {idx < 3 ? (
                      <span>{MEDALS[idx]}</span>
                    ) : (
                      <span className="leaderboard-rank-number">#{idx + 1}</span>
                    )}
                  </div>
                  <div className="leaderboard-avatar leaderboard-item-avatar">
                    {entry.image ? (
                      <img src={entry.image} width={40} height={40} alt={entry.name} className="leaderboard-avatar-img" />
                    ) : (
                      getInitials(entry.name)
                    )}
                  </div>
                  <div className="leaderboard-item-meta">
                    <div className="leaderboard-item-name" style={{ color: entry.isYou ? "#c4b5fd" : "#f0f0f0" }}>
                      {entry.name}
                      {entry.isYou ? " (you)" : ""}
                    </div>
                    <div className="leaderboard-progress-row">
                      <span>Lv.{entry.level}</span>
                      <div className="leaderboard-progress-bar">
                        <div
                          className="leaderboard-progress-fill"
                          style={{
                            width: `${Math.min(100, ((entry.xp % 120) / 120) * 100)}%`,
                            background:
                              idx === 0
                                ? "#FFD700"
                                : idx === 1
                                ? "#C0C0C0"
                                : idx === 2
                                ? "#CD7F32"
                                : entry.isYou
                                ? "#a78bfa"
                                : "rgba(255,255,255,0.2)",
                          }}
                        />
                      </div>
                      <span>{entry.xp} XP</span>
                    </div>
                  </div>
                  <div className="leaderboard-item-stats">
                    <div>
                      <div>{entry.eggCount}</div>
                      <div>eggs</div>
                    </div>
                    <div>
                      <div style={{ color: entry.streak > 0 ? "#fb923c" : "inherit" }}>{entry.streak}</div>
                      <div>streak</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
