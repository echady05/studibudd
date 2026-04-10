import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData } from "@/lib/db";
import { validateCsrfToken } from "@/lib/csrf";

const ProgressHatchSchema = z.object({
  subject: z.string().min(1),
});

export async function POST(req) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ProgressHatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  }

  let result;
  await updateUserData(session.user.email, (user) => {
    if (!user.progress) user.progress = { xp: 0, streak: 0, eggCount: 0, subject: "science", subjectProgress: {} };
    const p = user.progress;
    if (!p.subjectProgress) p.subjectProgress = {};

    if ((p.subjectProgress[parsed.data.subject] ?? 0) < 100) {
      result = { subject: parsed.data.subject, progress: p.subjectProgress[parsed.data.subject] ?? 0, xp: p.xp ?? 0, eggCount: p.eggCount ?? 0, streak: p.streak ?? 0 };
      return;
    }

    p.subjectProgress[parsed.data.subject] = 0;
    p.eggCount = (p.eggCount ?? 0) + 1;
    p.streak = (p.streak ?? 0) + 1;
    p.xp = (p.xp ?? 0) + 60;

    result = { subject: parsed.data.subject, progress: 0, xp: p.xp, eggCount: p.eggCount, streak: p.streak };
  });

  return NextResponse.json({ progress: result });
}
