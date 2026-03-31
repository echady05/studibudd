import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData } from "@/lib/db";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subject, ok } = body;
  if (typeof subject !== "string" || typeof ok !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let result;
  await updateUserData(session.user.email, (user) => {
    if (!user.progress) user.progress = { xp: 0, streak: 0, eggCount: 0, subject: "science", subjectProgress: {} };
    const p = user.progress;
    if (!p.subjectProgress) p.subjectProgress = {};

    p.subject = subject;
    p.xp = clamp((p.xp ?? 0) + (ok ? 28 : -6), 0, 999999);
    p.streak = ok ? (p.streak ?? 0) + 1 : 0;
    p.subjectProgress[subject] = clamp((p.subjectProgress[subject] ?? 0) + (ok ? 18 : -10), 0, 100);

    result = { subject, progress: p.subjectProgress[subject], xp: p.xp, eggCount: p.eggCount ?? 0, streak: p.streak };
  });

  return NextResponse.json({ progress: result });
}
