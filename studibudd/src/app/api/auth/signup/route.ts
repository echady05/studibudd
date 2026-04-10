import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import supabase, { normalizeEmail } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { validateCsrfToken } from "@/lib/csrf";

const SignupSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters").max(50),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function POST(req: NextRequest) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((e) => e.message).join(" ") },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const displayName = parsed.data.displayName;
  const passwordHash = await hashPassword(parsed.data.password);

  const { data: existingUser, error: findError } = await supabase
    .from("user_connections")
    .select("email")
    .eq("email", email)
    .single();

  if (findError && findError.code !== "PGRST116") {
    console.error("Signup lookup error:", findError);
    return NextResponse.json({ error: "Unable to create account right now" }, { status: 500 });
  }

  if (existingUser) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const { error: insertError } = await supabase.from("user_connections").insert([
    {
      email,
      password_hash: passwordHash,
      name: displayName,
      created_at: new Date().toISOString(),
    },
  ]);

  if (insertError) {
    console.error("Signup insert error:", insertError);
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
