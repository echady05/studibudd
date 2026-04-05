import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData } from "@/lib/db";

// Called when a user marks a Canvas assignment as done
// Awards XP based on urgency
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { assignmentId, urgent } = body;
  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId required" }, { status: 400 });
  }

  const xpGain = urgent ? 50 : 30;

  let result;
  await updateUserData(session.user.email, (user) => {
    const p = user.progress;
    p.xp = Math.min((p.xp ?? 0) + xpGain, 999999);
    p.streak = (p.streak ?? 0) + 1;

    // Also tick subject progress toward next hatch
    const subject = p.subject ?? "science";
    if (!p.subjectProgress) p.subjectProgress = {};
    p.subjectProgress[subject] = Math.min((p.subjectProgress[subject] ?? 0) + (urgent ? 25 : 15), 100);

    result = {
      xp: p.xp,
      streak: p.streak,
      eggCount: p.eggCount ?? user.egg_count ?? 0,
      subjectProgress: p.subjectProgress[subject],
      xpGain,
    };
  });

  return NextResponse.json({ ok: true, progress: result });
}
