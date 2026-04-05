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
  const subject = user?.subject ?? "science";

  return NextResponse.json({
    progress: {
      subject,
      progress: user?.subjectProgress?.[subject] ?? 0,
      xp: user?.xp ?? 0,
      eggCount: user?.egg_count ?? 0,
      streak: user?.streak ?? 0,
    },
  });
}
