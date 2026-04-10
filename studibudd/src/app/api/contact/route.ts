import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import supabase from "@/lib/db";
import sgMail from "@sendgrid/mail";
import { validateCsrfToken } from "@/lib/csrf";
import { normalizeEmail } from "@/lib/db";

const ContactSchema = z.object({
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is required");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sanitizeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

type ContactSession = {
  user?: {
    email?: string;
  };
} | null;

export async function POST(req: NextRequest) {
  if (!validateCsrfToken(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const session = (await getServerSession(authOptions as any)) as ContactSession;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((issue) => issue.message).join(" ") },
      { status: 400 }
    );
  }

  const message = parsed.data.message;
  const userId = normalizeEmail(session.user.email);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISOString = today.toISOString();

  const { data: lastSubmission, error: fetchError } = await supabase
    .from("contact_submissions")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", todayISOString)
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Contact rate limit lookup failed:", fetchError);
  }

  if (lastSubmission) {
    return NextResponse.json(
      { error: "You can only send one message per day. Please try again tomorrow." },
      { status: 429 }
    );
  }

  const emailMessage = {
    to: "studibuddcontact@gmail.com",
    from: {
      email: "studibuddcontact@gmail.com",
      name: "StudiBudd Contact",
    },
    subject: `StudiBudd Contact Form: ${userId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New StudiBudd Contact Form Submission</h2>
        <p><strong>From:</strong> ${sanitizeHtml(userId)}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <p style="white-space: pre-wrap; color: #555;">${sanitizeHtml(message)}</p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(emailMessage);
  } catch (emailError) {
    console.error("Email sending error:", emailError);
    return NextResponse.json(
      { error: "Email service error" },
      { status: 500 }
    );
  }

  const { error: insertError } = await supabase.from("contact_submissions").insert([
    {
      user_id: userId,
      message,
      created_at: new Date().toISOString(),
    },
  ]);

  if (insertError) {
    console.error("Failed to log contact submission:", insertError);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
