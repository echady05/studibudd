import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData } from "@/lib/db";
import { validateCsrfToken } from "@/lib/csrf";

const ProgressResetSchema = z.object({
  courseId: z.union([z.string(), z.number()]),
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
  const parsed = ProgressResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  }

  const subject = typeof parsed.data.courseId === 'string' && parsed.data.courseId.startsWith('manual_')
    ? parsed.data.courseId
    : `canvas_${parsed.data.courseId}`;

  await updateUserData(session.user.email, (user) => {
    if (!user.progress) user.progress = { xp: 0, streak: 0, eggCount: 0, subject: "science", subjectProgress: {} };
    const p = user.progress;
    if (!p.subjectProgress) p.subjectProgress = {};
    p.subjectProgress[subject] = 0;
  });

  return NextResponse.json({ success: true });
}
