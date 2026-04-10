import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCsrfToken } from "@/lib/csrf";
import { normalizeCanvasUrl, buildCanvasHeaders } from "@/lib/canvas";

const CanvasVerifySchema = z.object({
  canvasUrl: z.string().trim().min(10, "Canvas URL is required"),
  canvasToken: z.string().trim().min(10, "Canvas token is required"),
});

export async function POST(req: NextRequest) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CanvasVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  }

  const canvasUrl = normalizeCanvasUrl(parsed.data.canvasUrl);
  const canvasToken = parsed.data.canvasToken;

  try {
    const profileRes = await fetch(`${canvasUrl}/api/v1/users/self/profile`, {
      headers: buildCanvasHeaders(canvasToken),
      redirect: "error",
    });

    if (!profileRes.ok) {
      if (profileRes.status === 401) {
        return NextResponse.json({ error: "Token is invalid or expired — make sure you copied it fully." }, { status: 401 });
      }
      if (profileRes.status === 404) {
        return NextResponse.json({ error: "Canvas URL not found — check the school URL is correct." }, { status: 404 });
      }
      return NextResponse.json({ error: `Canvas returned an error (${profileRes.status}).` }, { status: 400 });
    }

    const profile = await profileRes.json();

    const coursesRes = await fetch(
      `${canvasUrl}/api/v1/courses?enrollment_state=active&per_page=50`,
      {
        headers: buildCanvasHeaders(canvasToken),
        redirect: "error",
      }
    );

    const courses = coursesRes.ok ? await coursesRes.json() : [];
    const activeCourses = Array.isArray(courses)
      ? courses.filter((c: { name?: string }) => c.name)
      : [];

    return NextResponse.json({
      valid: true,
      userName: profile.short_name ?? profile.name ?? "Student",
      courseCount: activeCourses.length,
      courses: activeCourses.map((c: { id: number; name?: string; course_code?: string }) => ({
        id: c.id,
        name: c.name ?? "",
        courseCode: c.course_code ?? "",
      })),
    });
  } catch (err) {
    console.error("Canvas verify error:", err);
    return NextResponse.json({ error: "Something went wrong — check your URL and token." }, { status: 500 });
  }
}
