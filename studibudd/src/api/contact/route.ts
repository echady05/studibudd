import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ error: "Missing message or userId" }, { status: 400 });
    }

    // Rate limiting: Check if user has sent a message today
    // For now, we'll use a simple in-memory store (in production, use Redis or database)
    const lastSentKey = `contact_last_sent_${userId}`;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // TODO: Implement proper rate limiting with database/Redis
    // For MVP, just check if a message has been sent (you'd store this in a database)

    // Send email using your email service (nodemailer, SendGrid, etc.)
    // TODO: Configure your email service
    // For now, just log it
    console.log(`Contact form submission from ${userId}:`, message);

    // This is a placeholder - you'll need to integrate with an actual email service
    // Example with nodemailer:
    /*
    import nodemailer from "nodemailer";
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "studibuddcontact@gmail.com",
      subject: `Contact Form: User ${userId}`,
      text: message,
    });
    */

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
