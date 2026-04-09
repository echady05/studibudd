import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData, getUserData } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getUserData(session.user.email);
  if (!user?.canvasUrl || !user?.canvasToken) {
    // Return manual courses only
    const manualCourses = (user?.manualCourses || []).map((course, index) => ({
      id: `manual_${index}`,
      name: course.name,
      code: course.code,
    }));
    const selected = user?.selectedCourseIds || [];
    return NextResponse.json({ courses: manualCourses, selected });
  }

  try {
    const res = await fetch(
      `${user.canvasUrl}/api/v1/courses?enrollment_state=active&per_page=50`,
      { headers: { Authorization: `Bearer ${user.canvasToken}`, Accept: "application/json" } }
    );
    if (!res.ok) {
      // Return manual courses only
      const manualCourses = (user?.manualCourses || []).map((course, index) => ({
        id: `manual_${index}`,
        name: course.name,
        code: course.code,
      }));
      const selected = user?.selectedCourseIds || [];
      return NextResponse.json({ courses: manualCourses, selected });
    }
    const raw = await res.json();
    const canvasCourses = Array.isArray(raw)
      ? raw
          .filter((c) => c.name && c.workflow_state !== "deleted")
          .map((c) => ({ id: c.id, name: c.name, code: c.course_code }))
      : [];
    
    // Add manual courses
    const manualCourses = (user?.manualCourses || []).map((course, index) => ({
      id: `manual_${index}`,
      name: course.name,
      code: course.code,
    }));
    
    const allCourses = [...canvasCourses, ...manualCourses];
    const selected = user?.selectedCourseIds || [];
    return NextResponse.json({ courses: allCourses, selected });
  } catch {
    // Return manual courses only
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

  const { selectedCourseIds, manualCourse } = body;
  
  await updateUserData(session.user.email, (user) => {
    if (Array.isArray(selectedCourseIds)) {
      user.selectedCourseIds = selectedCourseIds;
    }
    if (manualCourse && manualCourse.name) {
      user.manualCourses = user.manualCourses || [];
      user.manualCourses.push({
        name: manualCourse.name,
        code: manualCourse.code || "",
      });
    }
  });

  return NextResponse.json({ success: true });
}