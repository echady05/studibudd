import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData } from "@/lib/db";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subject } = body;
  if (typeof subject !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let result;
  await updateUserData(session.user.email, (user) => {
    if (!user.progress) user.progress = { xp: 0, streak: 0, eggCount: 0, subject: "science", subjectProgress: {} };
    const p = user.progress;
    if (!p.subjectProgress) p.subjectProgress = {};

    if ((p.subjectProgress[subject] ?? 0) < 100) {
      result = { subject, progress: p.subjectProgress[subject] ?? 0, xp: p.xp ?? 0, eggCount: p.eggCount ?? 0, streak: p.streak ?? 0 };
      return;
    }

    p.subjectProgress[subject] = 0;
    p.eggCount = (p.eggCount ?? 0) + 1;
    p.streak = (p.streak ?? 0) + 1;
    p.xp = (p.xp ?? 0) + 60;

    result = { subject, progress: 0, xp: p.xp, eggCount: p.eggCount, streak: p.streak };
  });

  return NextResponse.json({ progress: result });
}
