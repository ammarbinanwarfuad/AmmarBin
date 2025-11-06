'use server';

import { z } from 'zod';
import { contactSchema } from '@/lib/validations';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';

export async function submitContactForm(data: z.infer<typeof contactSchema>) {
  try {
    // Validate input
    const validatedData = contactSchema.parse(data);
    
    await connectDB();
    
    // Create contact message
    const message = new Message({
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject || 'No subject',
      message: validatedData.message,
      read: false,
    });
    
    await message.save();
    
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

