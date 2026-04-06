import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserData } from "@/lib/db";

function formatDue(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Past due";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getUserData(session.user.email);
  if (!user?.canvasUrl || !user?.canvasToken) {
    return NextResponse.json({ assignments: null, connected: false });
  }

  try {
    // Fetch active courses first.
    const coursesRes = await fetch(
      `${user.canvasUrl}/api/v1/courses?enrollment_state=active&per_page=20`,
      { headers: { Authorization: `Bearer ${user.canvasToken}`, Accept: "application/json" } }
    );
    if (!coursesRes.ok) {
      return NextResponse.json({ assignments: null, connected: false, error: "Canvas token may be expired" });
    }
    const courses = await coursesRes.json();
    const allowedIds = Array.isArray(user.selectedCourseIds) && user.selectedCourseIds.length > 0
    ? new Set(user.selectedCourseIds.map(Number))
    : null;
    console.log("allowedIds:", allowedIds);
console.log("user.selectedCourseIds:", user.selectedCourseIds);

  const activeCourses = Array.isArray(courses)
    ? courses
        .filter((c) => c.name && c.workflow_state !== "deleted")
        .filter((c) => !allowedIds || allowedIds.has(Number(c.id)))
        .slice(0, 8)
    : [];

    // Fetch upcoming assignments for each course in parallel.
    const now = new Date().toISOString();
    const assignmentLists = await Promise.all(
      activeCourses.map(async (course) => {
        try {
          const r = await fetch(
            `${user.canvasUrl}/api/v1/courses/${course.id}/assignments?bucket=upcoming&per_page=10&order_by=due_at`,
            { headers: { Authorization: `Bearer ${user.canvasToken}`, Accept: "application/json" } }
          );
          if (!r.ok) return [];
          const items = await r.json();
          return Array.isArray(items)
            ? items
                .filter((a) => a.due_at)
                .map((a) => ({
                  id: a.id,
                  name: a.name,
                  courseName: course.name,
                  courseCode: course.course_code,
                  dueAt: a.due_at,
                  dueLabel: formatDue(a.due_at),
                  urgent: new Date(a.due_at) - new Date() < 1000 * 60 * 60 * 48, // within 48h
                  htmlUrl: a.html_url,
                }))
            : [];
        } catch {
          return [];
        }
      })
    );

    const all = assignmentLists
      .flat()
      .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
      .slice(0, 15);

    return NextResponse.json({ assignments: all, connected: true });
  } catch {
    return NextResponse.json({ assignments: null, connected: false, error: "Could not reach Canvas" });
  }
}
