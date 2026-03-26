"use client";

import { useEffect, useMemo, useState } from "react";

const SUBJECTS = {
  science: {
    key: "science",
    name: "Science",
    accent: "#14b8a6",
    accent2: "#0ea5e9",
    eggLabel: "Science Egg",
  },
  math: {
    key: "math",
    name: "Math",
    accent: "#c084fc",
    accent2: "#fb7185",
    eggLabel: "Math Egg",
  },
  main: {
    key: "main",
    name: "Mainly StudiBudd",
    accent: "#f59e0b",
    accent2: "#fbbf24",
    eggLabel: "Buddy Egg",
  },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildQuestion(subjectKey) {
  // Keep this deterministic enough to feel fair, but still random for variety.
  if (subjectKey === "math") {
    const a = Math.floor(Math.random() * 18) + 8; // 8..25
    const b = Math.floor(Math.random() * 18) + 4; // 4..21
    const isAdd = Math.random() < 0.6;
    const answer = isAdd ? a + b : a - b;
    const expr = isAdd ? `${a} + ${b}` : `${a} - ${b}`;
    const correct = answer;
    const distractors = new Set([correct]);
    while (distractors.size < 4) {
      const delta = Math.floor(Math.random() * 9) - 4; // -4..4
      if (delta === 0) continue;
      distractors.add(correct + delta);
    }
    const options = Array.from(distractors).slice(0, 4);
    // Ensure correct is included (it is), but shuffle.
    const shuffled = options
      .map((v) => ({ v, r: Math.random() }))
      .sort((x, y) => x.r - y.r)
      .map((x) => x.v);
    const answerIndex = shuffled.indexOf(correct);
    return {
      prompt: `Solve: ${expr}`,
      options: shuffled,
      answerIndex,
      explain: isAdd ? "Nice. Addition builds momentum!" : "Good. Subtraction is still study power!",
    };
  }

  if (subjectKey === "science") {
    const prompts = [
      {
        prompt: "Plants make food using…",
        options: ["Respiration", "Photosynthesis", "Fermentation", "Combustion"],
        answerIndex: 1,
        explain: "Correct: plants use photosynthesis to make sugar.",
      },
      {
        prompt: "Water freezes at… (°C)",
        options: ["0°C", "50°C", "100°C", "-10°C"],
        answerIndex: 0,
        explain: "At 0°C, water freezes.",
      },
      {
        prompt: "Which is an example of a physical change?",
        options: [
          "Cutting paper",
          "Burning wood",
          "Rust forming",
          "Milk turning into cheese",
        ],
        answerIndex: 0,
        explain: "Cutting paper changes shape, not the substance.",
      },
      {
        prompt: "What part of a cell contains genetic information?",
        options: ["Nucleus", "Ribosome", "Cell wall", "Mitochondria"],
        answerIndex: 0,
        explain: "The nucleus stores DNA.",
      },
    ];
    return pick(prompts);
  }

  // main
  const mainQs = [
    {
      prompt: "True or False: 10 minutes of focused studying beats 60 minutes of distraction.",
      options: ["True", "False"],
      answerIndex: 0,
      explain: "True. Focus beats time-wasting every time.",
    },
    {
      prompt: "Which goal is best for staying consistent?",
      options: ["Do it perfectly", "Do a little every day", "Wait for motivation", "Skip easy tasks"],
      answerIndex: 1,
      explain: "Consistency grows from small daily wins.",
    },
    {
      prompt: "Pick the study habit you should do first.",
      options: ["Start with a random topic", "Make a tiny plan", "Check social media", "Multitask"],
      answerIndex: 1,
      explain: "A tiny plan helps you start and keeps you moving.",
    },
  ];
  const q = pick(mainQs);
  // Normalize to 4 options for consistent UI.
  if (q.options.length === 2) {
    const more = ["Maybe", "Not sure"];
    const options = [...q.options, ...more].slice(0, 4);
    // Put answerIndex appropriately if we appended.
    // Here we keep it simple: the first option remains answer when original answerIndex=0.
    return { ...q, options, answerIndex: q.answerIndex };
  }
  return q;
}

function Character({ subjectKey }) {
  const cfg = SUBJECTS[subjectKey];
  const accent = cfg?.accent ?? "#f59e0b";
  const accent2 = cfg?.accent2 ?? "#fbbf24";

  return (
    <div className="char" aria-hidden="true" style={{ ["--charA"]: accent, ["--charB"]: accent2 }}>
      <svg width="180" height="180" viewBox="0 0 180 180" role="img">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--charA)" />
            <stop offset="100%" stopColor="var(--charB)" />
          </linearGradient>
        </defs>
        <g transform="translate(10,6)">
          <ellipse cx="80" cy="68" rx="44" ry="56" fill="url(#g)" opacity="0.15" />
          <path
            d="M80 18
               C55 18 36 40 36 66
               C36 112 52 146 80 146
               C108 146 124 112 124 66
               C124 40 105 18 80 18Z"
            fill="url(#g)"
            opacity="0.9"
          />
          <ellipse cx="80" cy="66" rx="28" ry="36" fill="rgba(255,255,255,0.35)" />
          <circle cx="66" cy="68" r="7" fill="rgba(15,23,42,0.75)" />
          <circle cx="94" cy="68" r="7" fill="rgba(15,23,42,0.75)" />
          <path
            d="M70 88 C76 95, 84 95, 90 88"
            stroke="rgba(15,23,42,0.7)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M48 52 C36 56, 26 66, 24 76"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M112 52 C124 56, 134 66, 136 76"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

export default function StudyBuddyGame() {
  const [subject, setSubject] = useState("science");
  const [progress, setProgress] = useState(0); // 0..100
  const [xp, setXp] = useState(0);
  const [eggCount, setEggCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [lastResult, setLastResult] = useState(null); // { ok, text }
  const [isHatching, setIsHatching] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const level = useMemo(() => {
    return Math.floor(xp / 120) + 1;
  }, [xp]);

  // Local state: keep answer choices stable per question.
  const [mission, setMission] = useState(() => buildQuestion("science"));
  const [missionKey, setMissionKey] = useState(0);

  async function fetchServerProgress(nextSubjectMaybe, tokenOverride) {
    const tokenToUse = tokenOverride || authToken;
    if (!tokenToUse) return;
    const res = await fetch("/api/progress/state", {
      headers: { Authorization: `Bearer ${tokenToUse}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.progress) return;

    const prog = data.progress;
    if (nextSubjectMaybe) {
      setSubject(nextSubjectMaybe);
    } else if (prog.subject) {
      setSubject(prog.subject);
    }
    setProgress(Number(prog.progress ?? 0));
    setXp(Number(prog.xp ?? 0));
    setEggCount(Number(prog.eggCount ?? 0));
    setCorrectStreak(Number(prog.streak ?? 0));
  }

  useEffect(() => {
    try {
      const token = localStorage.getItem("studiBuddToken");
      if (!token) return;
      setAuthToken(token);
      fetchServerProgress(undefined, token);
    } catch {
      // ignore (no localStorage / blocked)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When subject changes, create a fresh mission.
  // (We use missionKey to force a stable reset.)
  const changeSubject = (next) => {
    setSubject(next);
    setLastResult(null);
    setMission(buildQuestion(next));
    setMissionKey((k) => k + 1);
  };

  const onNewMission = () => {
    setLastResult(null);
    setMission(buildQuestion(subject));
    setMissionKey((k) => k + 1);
  };

  const onAnswer = (idx) => {
    if (isHatching) return;

    const ok = idx === mission.answerIndex;

    setLastResult(
      ok
        ? { ok: true, text: "Correct! Your egg is learning." }
        : { ok: false, text: "Almost. Try the next mission!" }
    );

    // If logged in, persist to backend and sync state from it.
    if (authToken) {
      (async () => {
        try {
          await fetch("/api/progress/answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ subject, ok }),
          });
          await fetchServerProgress();
        } catch {
          // fallback to local updates
          setXp((prev) => clamp(prev + (ok ? 28 : -6), 0, 999999));
          setCorrectStreak((prev) => (ok ? prev + 1 : 0));
          setProgress((prev) => clamp(prev + (ok ? 18 : -10), 0, 100));
        }
      })();
      return;
    }

    setXp((prev) => clamp(prev + (ok ? 28 : -6), 0, 999999));
    setCorrectStreak((prev) => (ok ? prev + 1 : 0));
    setProgress((prev) => clamp(prev + (ok ? 18 : -10), 0, 100));
  };

  const canHatch = progress >= 100 && !isHatching;

  const onHatch = () => {
    if (!canHatch) return;
    setIsHatching(true);
    setLastResult({ ok: true, text: "Hatching… amazing work!" });

    // Small delay for animation feel.
    window.setTimeout(() => {
      (async () => {
        if (authToken) {
          try {
            await fetch("/api/progress/hatch", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ subject }),
            });
            await fetchServerProgress();
          } catch {
            // fallback to local
            setEggCount((c) => c + 1);
            setProgress(0);
            setCorrectStreak((s) => s + 1);
            setXp((prev) => prev + 60);
          }
        } else {
          setEggCount((c) => c + 1);
          setProgress(0);
          setCorrectStreak((s) => s + 1); // reward momentum
          setXp((prev) => prev + 60);
        }

        setIsHatching(false);
        setMission(buildQuestion(subject));
        setMissionKey((k) => k + 1);
        setLastResult({ ok: true, text: "Egg hatched! New mission unlocked." });
      })();
    }, 1200);
  };

  const subjCfg = SUBJECTS[subject];
  const headerAccentStyle = {
    ["--acc"]: subjCfg.accent,
    ["--acc2"]: subjCfg.accent2,
  };

  return (
    <section className="game" style={headerAccentStyle} aria-label="Study Buddy game">
      <div className="game-grid">
        <div className="game-left">
          <div className="game-card">
            <div className="game-title-row">
              <div>
                <div className="pill">Study Buddy Game</div>
                <h2 className="game-h2">Hatch your way to better studying</h2>
              </div>
              <div className="stats" aria-label="Player stats">
                <div className="stat">
                  <div className="stat-num">{level}</div>
                  <div className="stat-label">Level</div>
                </div>
                <div className="stat">
                  <div className="stat-num">{eggCount}</div>
                  <div className="stat-label">Eggs</div>
                </div>
                <div className="stat">
                  <div className="stat-num">{correctStreak}</div>
                  <div className="stat-label">Streak</div>
                </div>
              </div>
            </div>

            <div className="egg-area">
              <div className="egg-shell" aria-label="Egg progress">
                <div className="egg-top" />
                <div className="egg-mid">
                  <div className="egg-label">{subjCfg.eggLabel}</div>
                  <div className="progress-wrap">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="progress-meta">
                      <span>{Math.round(progress)}%</span>
                      <span>XP: {xp}</span>
                    </div>
                  </div>
                </div>
                {canHatch ? <div className="egg-ready">Ready</div> : null}
                {isHatching ? <div className="egg-hatching" aria-hidden="true" /> : null}
              </div>

              <Character subjectKey={subject} />
            </div>

            <div className="subject-row" role="group" aria-label="Choose subject">
              <button
                className={`subject-btn ${subject === "science" ? "active" : ""}`}
                onClick={() => changeSubject("science")}
                type="button"
              >
                Science Egg
              </button>
              <button
                className={`subject-btn ${subject === "math" ? "active" : ""}`}
                onClick={() => changeSubject("math")}
                type="button"
              >
                Math Egg
              </button>
              <button
                className={`subject-btn ${subject === "main" ? "active" : ""}`}
                onClick={() => changeSubject("main")}
                type="button"
              >
                Main Buddy
              </button>
            </div>

            <div className="mission">
              <div className="mission-head">
                <div className="mission-title">Mission</div>
                <button className="mini-link" type="button" onClick={onNewMission} disabled={isHatching}>
                  New mission
                </button>
              </div>

              <div key={missionKey} className="question-box">
                <div className="question">{mission.prompt}</div>

                <div className="options" role="group" aria-label="Answer options">
                  {mission.options.map((opt, idx) => (
                    <button
                      key={`${idx}-${String(opt)}`}
                      type="button"
                      className="option-btn"
                      onClick={() => onAnswer(idx)}
                      disabled={isHatching}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {lastResult ? (
                  <div className={`result ${lastResult.ok ? "ok" : "bad"}`} role="status" aria-live="polite">
                    <div className="result-title">{lastResult.ok ? "Nice!" : "Keep going!"}</div>
                    <div className="result-text">{lastResult.text}</div>
                    <div className="result-explain">{mission.explain}</div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="actions-row">
              <button className={`btn-main ${canHatch ? "" : "disabled"}`} type="button" onClick={onHatch} disabled={!canHatch}>
                {isHatching ? "Hatching..." : "Hatch egg"}
              </button>
              <div className="hint">
                Correct answers push progress up. Wrong answers pull it back.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

