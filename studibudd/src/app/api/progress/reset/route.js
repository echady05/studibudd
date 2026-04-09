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
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { courseId } = body;
  if (typeof courseId !== "string" && typeof courseId !== "number") {
    return NextResponse.json({ error: "courseId must be a string or number" }, { status: 400 });
  }

  const subject = typeof courseId === 'string' && courseId.startsWith('manual_') 
    ? courseId 
    : `canvas_${courseId}`;

  await updateUserData(session.user.email, (user) => {
    if (!user.progress) user.progress = { xp: 0, streak: 0, eggCount: 0, subject: "science", subjectProgress: {} };
    const p = user.progress;
    if (!p.subjectProgress) p.subjectProgress = {};
    p.subjectProgress[subject] = 0; // Reset progress for this course
  });

  return NextResponse.json({ success: true });
}