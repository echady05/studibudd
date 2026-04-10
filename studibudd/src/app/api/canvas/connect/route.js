import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { updateUserData, saveUserProfile } from "@/lib/db";
import { validateCsrfToken } from "@/lib/csrf";
import { normalizeCanvasUrl, buildCanvasHeaders } from "@/lib/canvas";

const CanvasConnectSchema = z.object({
  canvasUrl: z.string().trim().min(10, "Canvas URL is required"),
  canvasToken: z.string().trim().min(10, "Canvas token is required"),
  selectedCourseIds: z.array(z.union([z.string(), z.number()])).optional(),
  courseEggs: z.record(z.string(), z.any()).optional(),
});

export async function POST(req) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

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

  const parsed = CanvasConnectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  }

  const baseUrl = normalizeCanvasUrl(parsed.data.canvasUrl);
  const canvasToken = parsed.data.canvasToken;

  let courses;
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/courses?enrollment_state=active&per_page=50`,
      {
        headers: buildCanvasHeaders(canvasToken),
        redirect: "error",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Canvas rejected the token (status ${res.status}). Check your URL and token.` },
        { status: 400 }
      );
    }
    courses = await res.json();
  } catch (error) {
    console.error("Canvas connect error:", error);
    return NextResponse.json(
      { error: `Could not reach Canvas at ${baseUrl}. Double-check the URL.` },
      { status: 400 }
    );
  }

  await saveUserProfile(session.user.email, {
    name: session.user.name ?? null,
    avatar_url: session.user.image ?? null,
  });

  await updateUserData(session.user.email, (user) => {
    user.canvasUrl = baseUrl;
    user.canvasToken = canvasToken;
    user.selectedCourseIds = parsed.data.selectedCourseIds ?? null;
    user.courseEggs = parsed.data.courseEggs ?? {};
  });

  const filtered = Array.isArray(courses)
    ? courses
        .filter((c) => c.name && c.workflow_state !== "deleted")
        .map((c) => ({ id: c.id, name: c.name, courseCode: c.course_code }))
    : [];

  return NextResponse.json({ connected: true, courses: filtered });
}

export async function DELETE(req) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await updateUserData(session.user.email, (user) => {
    user.canvasUrl = null;
    user.canvasToken = null;
  });

  return NextResponse.json({ connected: false });
}
