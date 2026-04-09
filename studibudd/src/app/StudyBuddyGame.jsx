"use client";

import { useEffect, useMemo, useState } from "react";

const HARDCODED_SUBJECTS = [
  { key: "science", name: "Science", accent: "#14b8a6", accent2: "#0ea5e9", eggLabel: "Science Egg" },
  { key: "math",    name: "Math",    accent: "#c084fc", accent2: "#fb7185", eggLabel: "Math Egg" },
  { key: "main",    name: "Mainly StudiBudd", accent: "#f59e0b", accent2: "#fbbf24", eggLabel: "Buddy Egg" },
];

const COURSE_PALETTE = [
  { accent: "#14b8a6", accent2: "#0ea5e9" },
  { accent: "#c084fc", accent2: "#fb7185" },
  { accent: "#f59e0b", accent2: "#fbbf24" },
  { accent: "#10b981", accent2: "#34d399" },
  { accent: "#ef4444", accent2: "#f97316" },
  { accent: "#6366f1", accent2: "#8b5cf6" },
  { accent: "#ec4899", accent2: "#f43f5e" },
  { accent: "#0284c7", accent2: "#38bdf8" },
];

function courseColor(courseId) {
  const n = typeof courseId === "number" ? courseId : parseInt(String(courseId), 10) || 0;
  return COURSE_PALETTE[n % COURSE_PALETTE.length];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const STUDY_HABIT_QUESTIONS = [
  { prompt: "What's the best way to start a study session?", options: ["Jump straight in", "Make a small plan first", "Check social media", "Wait for motivation"], answerIndex: 1, explain: "A tiny plan removes friction and keeps you focused." },
  { prompt: "True or False: Short focused sessions beat long distracted ones.", options: ["True", "False", "Depends", "Not sure"], answerIndex: 0, explain: "Focus quality matters far more than raw time." },
  { prompt: "Which study technique is most effective for long-term retention?", options: ["Re-reading notes", "Spaced repetition", "Cramming the night before", "Highlighting everything"], answerIndex: 1, explain: "Spaced repetition is one of the most well-researched study methods." },
  { prompt: "When is the best time to review material?", options: ["Right before the exam", "Shortly after learning, then again later", "Only once", "Never - just re-read"], answerIndex: 1, explain: "Reviewing soon after learning, then spacing reviews, builds lasting memory." },
  { prompt: "What should you do when you feel stuck on a problem?", options: ["Give up immediately", "Take a short break and return", "Skip it forever", "Panic"], answerIndex: 1, explain: "A short break lets your brain process the problem in the background." },
  { prompt: "Which habit builds the most consistent studying?", options: ["Study a little every day", "Only study when motivated", "Save everything for the weekend", "Skip easy topics"], answerIndex: 0, explain: "Daily consistency compounds into big results over a semester." },
];

function buildQuestion(subjectKey) {
  if (subjectKey === "math") {
    const a = Math.floor(Math.random() * 18) + 8;
    const b = Math.floor(Math.random() * 18) + 4;
    const isAdd = Math.random() < 0.6;
    const answer = isAdd ? a + b : a - b;
    const correct = answer;
    const distractors = new Set([correct]);
    while (distractors.size < 4) {
      const delta = Math.floor(Math.random() * 9) - 4;
      if (delta === 0) continue;
      distractors.add(correct + delta);
    }
    const shuffled = Array.from(distractors).slice(0, 4).map((v) => ({ v, r: Math.random() })).sort((x, y) => x.r - y.r).map((x) => x.v);
    return { prompt: `Solve: ${a} ${isAdd ? "+" : "-"} ${b}`, options: shuffled, answerIndex: shuffled.indexOf(correct), explain: "Math practice keeps your brain sharp!" };
  }
  if (subjectKey === "science") {
    return pick([
      { prompt: "Plants make food using…", options: ["Respiration", "Photosynthesis", "Fermentation", "Combustion"], answerIndex: 1, explain: "Plants use photosynthesis to make sugar." },
      { prompt: "Water freezes at… (°C)", options: ["0°C", "50°C", "100°C", "-10°C"], answerIndex: 0, explain: "At 0°C, water freezes." },
      { prompt: "Which is a physical change?", options: ["Cutting paper", "Burning wood", "Rust forming", "Milk to cheese"], answerIndex: 0, explain: "Cutting paper changes shape, not the substance." },
      { prompt: "What part of a cell contains DNA?", options: ["Nucleus", "Ribosome", "Cell wall", "Mitochondria"], answerIndex: 0, explain: "The nucleus stores DNA." },
    ]);
  }
  // Canvas courses and "main" use study habit questions.
  return pick(STUDY_HABIT_QUESTIONS);
}

function Character({ accent, accent2 }) {
  return (
    <div className="char" aria-hidden="true" style={{ ["--charA"]: accent, ["--charB"]: accent2 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--charA)" />
            <stop offset="100%" stopColor="var(--charB)" />
          </linearGradient>
        </defs>
        <g transform="translate(10,6)">
          <ellipse cx="80" cy="68" rx="44" ry="56" fill="url(#g)" opacity="0.15" />
          <path d="M80 18 C55 18 36 40 36 66 C36 112 52 146 80 146 C108 146 124 112 124 66 C124 40 105 18 80 18Z" fill="url(#g)" opacity="0.9" />
          <ellipse cx="80" cy="66" rx="28" ry="36" fill="rgba(255,255,255,0.35)" />
          <circle cx="66" cy="68" r="7" fill="rgba(15,23,42,0.75)" />
          <circle cx="94" cy="68" r="7" fill="rgba(15,23,42,0.75)" />
          <path d="M70 88 C76 95, 84 95, 90 88" stroke="rgba(15,23,42,0.7)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M48 52 C36 56, 26 66, 24 76" stroke="rgba(255,255,255,0.55)" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M112 52 C124 56, 134 66, 136 76" stroke="rgba(255,255,255,0.55)" strokeWidth="8" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

export default function StudyBuddyGame() {
  const [subject, setSubject] = useState("science");
  const [progress, setProgress] = useState(0);
  const [xp, setXp] = useState(0);
  const [eggCount, setEggCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [isHatching, setIsHatching] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [canvasCourses, setCanvasCourses] = useState(null);

  const [mission, setMission] = useState(() => buildQuestion("science"));
  const [missionKey, setMissionKey] = useState(0);

  const level = useMemo(() => Math.floor(xp / 120) + 1, [xp]);

  const subjects = useMemo(() => {
    if (canvasCourses && canvasCourses.length > 0) {
      return canvasCourses.map((c) => ({
        key: typeof c.id === 'string' && c.id.startsWith('manual_') ? c.id : `canvas_${c.id}`,
        name: c.name,
        courseCode: c.code,
        eggLabel: c.code ? `${c.code} Egg` : `${c.name} Egg`,
        ...courseColor(typeof c.id === 'string' && c.id.startsWith('manual_') ? c.id : c.id),
      }));
    }
    return HARDCODED_SUBJECTS;
  }, [canvasCourses]);

  const subjCfg = subjects.find((s) => s.key === subject) || subjects[0];

  async function fetchProgress() {
    try {
      const res = await fetch("/api/progress/state");
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.progress) return;
      const p = data.progress;
      setSubject((cur) => p.subject || cur);
      setProgress(Number(p.progress ?? 0));
      setXp(Number(p.xp ?? 0));
      setEggCount(Number(p.eggCount ?? 0));
      setCorrectStreak(Number(p.streak ?? 0));
    } catch { /* offline - stay local */ }
  }

  async function fetchCanvasCourses() {
    try {
      const res = await fetch("/api/canvas/courses");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.courses) && data.courses.length > 0) {
        setCanvasCourses(data.courses);
        const firstKey = data.courses[0].id.toString().startsWith('manual_') 
          ? data.courses[0].id.toString() 
          : `canvas_${data.courses[0].id}`;
        setSubject(firstKey);
        setMission(buildQuestion(firstKey));
        setMissionKey((k) => k + 1);
      }
    } catch { /* no canvas */ }
  }

  useEffect(() => {
    // Check if we have a session by hitting the progress API.
    fetchProgress().then(() => setIsLoggedIn(true)).catch(() => {});
    fetchCanvasCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeSubject = (next) => {
    setSubject(next);
    setLastResult(null);
    setMission(buildQuestion(next));
    setMissionKey((k) => k + 1);
  };

  const onAnswer = (idx) => {
    if (isHatching) return;
    const ok = idx === mission.answerIndex;
    setLastResult(ok ? { ok: true, text: "Correct! Your egg is learning." } : { ok: false, text: "Almost. Try the next mission!" });

    (async () => {
      try {
        const res = await fetch("/api/progress/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, ok }),
        });
        if (res.ok) { await fetchProgress(); return; }
      } catch { /* fallback */ }
      setXp((prev) => clamp(prev + (ok ? 28 : -6), 0, 999999));
      setCorrectStreak((prev) => (ok ? prev + 1 : 0));
      setProgress((prev) => clamp(prev + (ok ? 18 : -10), 0, 100));
    })();
  };

  const canHatch = progress >= 100 && !isHatching;

  const onHatch = () => {
    if (!canHatch) return;
    setIsHatching(true);
    setLastResult({ ok: true, text: "Hatching... amazing work!" });
    window.setTimeout(async () => {
      try {
        const res = await fetch("/api/progress/hatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject }),
        });
        if (res.ok) { await fetchProgress(); }
        else { setEggCount((c) => c + 1); setProgress(0); setCorrectStreak((s) => s + 1); setXp((p) => p + 60); }
      } catch {
        setEggCount((c) => c + 1); setProgress(0); setCorrectStreak((s) => s + 1); setXp((p) => p + 60);
      }
      setIsHatching(false);
      setMission(buildQuestion(subject));
      setMissionKey((k) => k + 1);
      setLastResult({ ok: true, text: "Egg hatched! New mission unlocked." });
    }, 1200);
  };

  const headerAccentStyle = { ["--acc"]: subjCfg?.accent, ["--acc2"]: subjCfg?.accent2 };

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
              <div className="stats">
                <div className="stat"><div className="stat-num">{level}</div><div className="stat-label">Level</div></div>
                <div className="stat"><div className="stat-num">{eggCount}</div><div className="stat-label">Eggs</div></div>
                <div className="stat"><div className="stat-num">{correctStreak}</div><div className="stat-label">Streak</div></div>
              </div>
            </div>

            {canvasCourses && canvasCourses.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: "0.8rem", background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>
                  Canvas connected - {canvasCourses.length} courses loaded
                </span>
              </div>
            )}

            <div className="egg-area">
              <div className="egg-shell" aria-label="Egg progress">
                <div className="egg-top" />
                <div className="egg-mid">
                  <div className="egg-label">{subjCfg?.eggLabel}</div>
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
                {canHatch && <div className="egg-ready">Ready</div>}
                {isHatching && <div className="egg-hatching" aria-hidden="true" />}
              </div>
              <Character accent={subjCfg?.accent ?? "#f59e0b"} accent2={subjCfg?.accent2 ?? "#fbbf24"} />
            </div>

            <div className="subject-row" role="group" aria-label="Choose subject" style={{ overflowX: "auto", flexWrap: "nowrap" }}>
              {subjects.map((s) => (
                <button
                  key={s.key}
                  className={`subject-btn ${subject === s.key ? "active" : ""}`}
                  onClick={() => changeSubject(s.key)}
                  type="button"
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {s.courseCode || s.name}
                </button>
              ))}
            </div>

            <div className="mission">
              <div className="mission-head">
                <div className="mission-title">
                  Mission
                  {subjCfg?.courseCode && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", background: "rgba(15,23,42,0.06)", borderRadius: 6, padding: "1px 7px", marginLeft: 8, verticalAlign: "middle" }}>
                      {subjCfg.name}
                    </span>
                  )}
                </div>
                <button className="mini-link" type="button" onClick={() => { setLastResult(null); setMission(buildQuestion(subject)); setMissionKey((k) => k + 1); }} disabled={isHatching}>
                  New mission
                </button>
              </div>
              <div key={missionKey} className="question-box">
                <div className="question">{mission.prompt}</div>
                <div className="options" role="group">
                  {mission.options.map((opt, idx) => (
                    <button key={`${idx}-${String(opt)}`} type="button" className="option-btn" onClick={() => onAnswer(idx)} disabled={isHatching}>
                      {opt}
                    </button>
                  ))}
                </div>
                {lastResult && (
                  <div className={`result ${lastResult.ok ? "ok" : "bad"}`} role="status" aria-live="polite">
                    <div className="result-title">{lastResult.ok ? "Nice!" : "Keep going!"}</div>
                    <div className="result-text">{lastResult.text}</div>
                    <div className="result-explain">{mission.explain}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="actions-row">
              <button className={`btn-main ${canHatch ? "" : "disabled"}`} type="button" onClick={onHatch} disabled={!canHatch}>
                {isHatching ? "Hatching..." : "Hatch egg"}
              </button>
              <div className="hint">Correct answers push progress up. Wrong answers pull it back.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
