import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData, getUserData } from "@/lib/db";
import { normalizeCanvasUrl, buildCanvasHeaders } from "@/lib/canvas";
import { validateCsrfToken } from "@/lib/csrf";

const CourseManageSchema = z.object({
  selectedCourseIds: z.array(z.union([z.string(), z.number()])).optional(),
  manualCourse: z.object({
    name: z.string().min(1),
    code: z.string().optional(),
  }).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getUserData(session.user.email);
  if (!user?.canvasUrl || !user?.canvasToken) {
    const manualCourses = (user?.manualCourses || []).map((course, index) => ({
      id: `manual_${index}`,
      name: course.name,
      code: course.code,
    }));
    const selected = user?.selectedCourseIds || [];
    return NextResponse.json({ courses: manualCourses, selected });
  }

  try {
    const canvasUrl = normalizeCanvasUrl(user.canvasUrl);
    const res = await fetch(
      `${canvasUrl}/api/v1/courses?enrollment_state=active&per_page=50`,
      { headers: buildCanvasHeaders(user.canvasToken), redirect: "error" }
    );

    if (!res.ok) {
      throw new Error("Canvas fetch failed");
    }

    const raw = await res.json();
    const canvasCourses = Array.isArray(raw)
      ? raw
          .filter((c) => c.name && c.workflow_state !== "deleted")
          .map((c) => ({ id: c.id, name: c.name, code: c.course_code }))
      : [];

    const manualCourses = (user?.manualCourses || []).map((course, index) => ({
      id: `manual_${index}`,
      name: course.name,
      code: course.code,
    }));

    const allCourses = [...canvasCourses, ...manualCourses];
    const selected = user?.selectedCourseIds || [];
    return NextResponse.json({ courses: allCourses, selected });
  } catch {
    const manualCourses = (user?.manualCourses || []).map((course, index) => ({
      id: `manual_${index}`,
      name: course.name,
      code: course.code,
    }));
    const selected = user?.selectedCourseIds || [];
    return NextResponse.json({ courses: manualCourses, selected });
  }
}

export async function POST(req) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CourseManageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  }

  await updateUserData(session.user.email, (user) => {
    if (Array.isArray(parsed.data.selectedCourseIds)) {
      user.selectedCourseIds = parsed.data.selectedCourseIds;
    }
    if (parsed.data.manualCourse) {
      user.manualCourses = user.manualCourses || [];
      user.manualCourses.push({
        name: parsed.data.manualCourse.name,
        code: parsed.data.manualCourse.code || "",
      });
    }
  });

  return NextResponse.json({ success: true });
}
