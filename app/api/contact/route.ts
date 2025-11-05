import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";
import { contactSchema } from "@/lib/validations";

export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find()
      .select('name email subject message read replied createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(500);
    
    return NextResponse.json(
      { messages },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch messages";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate data
    const validatedData = contactSchema.parse(data);

    await connectDB();

    // Save message to database
    const message = await Message.create(validatedData);

    // Send email notifications only if email is configured
    const isEmailConfigured = 
      process.env.EMAIL_HOST && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASSWORD && 
      process.env.EMAIL_PASSWORD !== "your-app-specific-password";

    if (isEmailConfigured) {
      try {
        await sendContactNotification(validatedData);
        await sendContactConfirmation(validatedData.email, validatedData.name);
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("Email not configured - message saved to database only");
    }

    return NextResponse.json(
      { message: "Message sent successfully", data: message },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    
    // Provide more detailed error info
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

