import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ error: "Missing message or userId" }, { status: 400 });
    }

    // Check rate limit - one message per user per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: lastSubmission, error: fetchError } = await supabase
      .from("contact_submissions")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", today.toISOString())
      .single();

    if (lastSubmission) {
      return NextResponse.json(
        { error: "You can only send one message per day. Please try again tomorrow." },
        { status: 429 }
      );
    }

    // Send email
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER!,
      to: "studibuddcontact@gmail.com",
      subject: `StudiBudd Contact Form: ${userId}`,
      text: `User: ${userId}\n\nMessage:\n${message}`,
      html: `<p><strong>User:</strong> ${userId}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br />")}</p>`,
    });

    // Log submission in database
    const { error: insertError } = await supabase
      .from("contact_submissions")
      .insert([
        {
          user_id: userId,
          message: message,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error("Failed to log contact submission:", insertError);
      // Still return success to user even if logging fails
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
