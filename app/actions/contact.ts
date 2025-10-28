'use server';

import { z } from 'zod';
import { contactSchema } from '@/lib/validations';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import { sendContactNotification, sendContactConfirmation } from '@/lib/email';

export async function submitContactForm(data: z.infer<typeof contactSchema>) {
  try {
    // Validate input
    const validatedData = contactSchema.parse(data);
    
    // Connect to database
    await connectDB();
    
    // Create contact message
    const message = new Message({
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject || 'No subject',
      message: validatedData.message,
      read: false,
      replied: false,
    });
    
    await message.save();
    
    // Try to send email notifications (non-blocking)
    const isEmailConfigured = 
      process.env.EMAIL_HOST && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASSWORD && 
      process.env.EMAIL_PASSWORD !== "your-app-specific-password";

    if (isEmailConfigured) {
      try {
        await Promise.all([
          sendContactNotification(validatedData),
          sendContactConfirmation(validatedData.email, validatedData.name),
        ]);
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log('Email not configured - message saved to database only');
    }
    
    return { success: true, message: 'Message sent successfully!' };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    };
  }
}

