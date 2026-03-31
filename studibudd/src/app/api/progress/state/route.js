import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserData } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getUserData(session.user.email);
  const prog = user?.progress ?? { xp: 0, streak: 0, eggCount: 0, subject: "science", subjectProgress: {} };
  const subject = prog.subject || "science";

  return NextResponse.json({
    progress: {
      subject,
      progress: prog.subjectProgress?.[subject] ?? 0,
      xp: prog.xp ?? 0,
      eggCount: prog.eggCount ?? 0,
      streak: prog.streak ?? 0,
    },
  });
}
