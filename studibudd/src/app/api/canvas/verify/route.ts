import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { canvasUrl, canvasToken } = await req.json();

    if (!canvasUrl || !canvasToken) {
      return NextResponse.json({ error: "Missing Canvas URL or token." }, { status: 400 });
    }

    // Test the token by fetching the user's own profile
    const profileRes = await fetch(`${canvasUrl}/api/v1/users/self/profile`, {
      headers: {
        Authorization: `Bearer ${canvasToken}`,
        "Content-Type": "application/json",
      },
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

    // Also fetch courses so we can show a count in the preview
    const coursesRes = await fetch(
      `${canvasUrl}/api/v1/courses?enrollment_state=active&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${canvasToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const courses = coursesRes.ok ? await coursesRes.json() : [];
    const activeCourses = Array.isArray(courses)
      ? courses.filter((c: { name?: string }) => c.name)
      : [];

      console.log("Sample course:", JSON.stringify(activeCourses[0], null, 2));

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