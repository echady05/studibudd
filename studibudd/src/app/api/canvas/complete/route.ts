import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData } from "@/lib/db";
import { validateCsrfToken } from "@/lib/csrf";

const CanvasCompleteSchema = z.object({
  assignmentId: z.union([z.string(), z.number()]),
  urgent: z.boolean().optional().default(false),
});

// Called when a user marks a Canvas assignment as done
// Awards XP based on urgency
export async function POST(req: NextRequest) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CanvasCompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  }

  const { urgent } = parsed.data;
  const xpGain = urgent ? 50 : 30;

  let result;
  await updateUserData(session.user.email, (user: any) => {
    const p = user.progress;
    p.xp = Math.min((p.xp ?? 0) + xpGain, 999999);
    p.streak = (p.streak ?? 0) + 1;

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