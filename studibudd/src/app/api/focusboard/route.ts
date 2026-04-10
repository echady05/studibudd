import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getFocusboardState, saveFocusboardState } from "@/lib/db";
import { validateCsrfToken } from "@/lib/csrf";

const FocusboardSchema = z.object({
  courseOrder: z.array(z.union([z.string(), z.number()])).optional(),
  creatureState: z.record(z.any()).optional(),
}).refine((value) => value.courseOrder !== undefined || value.creatureState !== undefined, {
  message: "At least one state field is required",
});

// GET — load saved order + creature state for this user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const state = await getFocusboardState(session.user.email);
  return NextResponse.json(state);
}

// PATCH — save order + creature state for this user
export async function PATCH(req: NextRequest) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = FocusboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  }

  try {
    await saveFocusboardState(session.user.email, {
      courseOrder: parsed.data.courseOrder,
      creatureState: parsed.data.creatureState,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
