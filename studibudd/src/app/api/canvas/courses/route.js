import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserData, normalizeEmail } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getUserData(session.user.email);
  if (!user?.canvasUrl || !user?.canvasToken) {
    return NextResponse.json({ courses: null, connected: false });
  }

  try {
    const res = await fetch(
      `${user.canvasUrl}/api/v1/courses?enrollment_state=active&per_page=50`,
      { headers: { Authorization: `Bearer ${user.canvasToken}`, Accept: "application/json" } }
    );
    if (!res.ok) {
      return NextResponse.json({ courses: null, connected: false, error: "Canvas token may be expired" });
    }
    const raw = await res.json();
    const courses = Array.isArray(raw)
      ? raw
          .filter((c) => c.name && c.workflow_state !== "deleted")
          .map((c) => ({ id: c.id, name: c.name, courseCode: c.course_code }))
      : [];
    return NextResponse.json({ courses, connected: true });
  } catch {
    return NextResponse.json({ courses: null, connected: false, error: "Could not reach Canvas" });
  }
}
