import nodemailer from "nodemailer";

// Only create transporter if email is configured
const isEmailConfigured = 
  process.env.EMAIL_HOST && 
  process.env.EMAIL_USER && 
  process.env.EMAIL_PASSWORD && 
  process.env.EMAIL_PASSWORD !== "your-app-specific-password";

const transporter = isEmailConfigured ? nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!transporter) {
    console.log("Email not configured - skipping email send");
    return { success: false, error: "Email not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...options,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Subject:</strong> ${data.subject || "No subject"}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message}</p>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "",
    subject: `New Contact: ${data.subject || "No subject"}`,
    html,
  });
}

export async function sendContactConfirmation(email: string, name: string) {
  const html = `
    <h2>Thank you for contacting me!</h2>
    <p>Hi ${name},</p>
    <p>I've received your message and will get back to you as soon as possible.</p>
    <p>Best regards,<br>Ammar Bin Anwar Fuad</p>
  `;

  return sendEmail({
    to: email,
    subject: "Thank you for your message",
    html,
  });
}

