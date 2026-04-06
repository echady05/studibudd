import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { updateUserData, saveUserProfile, normalizeEmail } from "@/lib/db";

function normalizeCanvasUrl(raw) {
  let url = String(raw || "").trim().replace(/\/+$/, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
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

  const { canvasUrl, canvasToken, selectedCourseIds, courseEggs } = body;
  if (!canvasUrl || !canvasToken) {
    return NextResponse.json({ error: "canvasUrl and canvasToken are required" }, { status: 400 });
  }

  const baseUrl = normalizeCanvasUrl(canvasUrl);

  // Validate by hitting Canvas - if it works the token is good.
  let courses;
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/courses?enrollment_state=active&per_page=50`,
      { headers: { Authorization: `Bearer ${canvasToken}`, Accept: "application/json" } }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `Canvas rejected the token (status ${res.status}). Check your URL and token.` },
        { status: 400 }
      );
    }
    courses = await res.json();
  } catch {
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
    user.selectedCourseIds = Array.isArray(selectedCourseIds) ? selectedCourseIds : null;
    user.courseEggs = courseEggs ?? {};
  });

  const filtered = Array.isArray(courses)
    ? courses
        .filter((c) => c.name && c.workflow_state !== "deleted")
        .map((c) => ({ id: c.id, name: c.name, courseCode: c.course_code }))
    : [];

  return NextResponse.json({ connected: true, courses: filtered });
}

export async function DELETE(req) {
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
