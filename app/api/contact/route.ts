import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";
import { contactSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, logRequest } from "@/lib/request-logger";
import { errorResponse, successResponse } from "@/lib/api-response";
import { withTimeout, TIMEOUTS } from "@/lib/api-timeout";
import { cursorPaginate } from "@/lib/cursor-pagination";
import { getCached, getCacheKey, CACHE_TTL, invalidateCache } from "@/lib/redis-cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Support both offset and cursor-based pagination
    const useCursor = searchParams.get("useCursor") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const cursor = searchParams.get("cursor") || undefined;
    
    // ✅ OPTIMIZED: Redis caching for 2-minute cache
    const cacheKey = useCursor 
      ? getCacheKey('messages', 'cursor', cursor || 'first', limit)
      : getCacheKey('messages', 'page', page, limit);
    
    const cachedData = await getCached(
      cacheKey,
      async () => {
        await connectDB();
        
        if (useCursor) {
          // Cursor-based pagination
          const result = await cursorPaginate(Message, {}, {
            cursor,
            limit,
            sortField: 'createdAt',
            sortOrder: 'desc',
          });
          
          return {
            messages: result.data,
            pageInfo: result.pageInfo,
            useCursor: true,
          };
        } else {
          // Offset-based pagination
          const skip = (page - 1) * limit;
          
          const [messages, total] = await Promise.all([
            Message.find()
              .select('name email subject message read replied createdAt')
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .lean()
              .maxTimeMS(500),
            Message.countDocuments()
          ]);
          
          return {
            messages,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit)
            },
            useCursor: false,
          };
        }
      },
      CACHE_TTL.MESSAGES
    );
    
    return NextResponse.json(cachedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
        'X-Cache-Status': 'HIT',
      },
    });
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
  const start = Date.now();
  const clientIp = getClientIp(request);
  
  try {
    // Check request size limit (100KB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100000) {
      const duration = Date.now() - start;
      logRequest('POST', '/api/contact', 413, duration, { ip: clientIp });
      return errorResponse("Request too large. Maximum size is 100KB", 413);
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`contact:${clientIp}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      lockoutDurationMs: 30 * 60 * 1000, // 30 minutes
    });

    if (!rateLimitResult.allowed) {
      const duration = Date.now() - start;
      logRequest('POST', '/api/contact', 429, duration, { ip: clientIp });
      return errorResponse(
        "Too many requests. Please try again later.",
        429
      );
    }

    // Parse and validate with timeout
    const data = await withTimeout(
      request.json(),
      TIMEOUTS.API,
      'Request parsing timeout'
    );

    // Validate data
    const validatedData = contactSchema.parse(data);

    // Connect to database with timeout
    await withTimeout(
      connectDB(),
      TIMEOUTS.DATABASE,
      'Database connection timeout'
    );

    // Save message to database with timeout
    const message = await withTimeout(
      Message.create(validatedData),
      TIMEOUTS.DATABASE,
      'Database operation timeout'
    );

    // Send email notifications only if email is configured
    const isEmailConfigured = 
      process.env.EMAIL_HOST && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASSWORD && 
      process.env.EMAIL_PASSWORD !== "your-app-specific-password";

    if (isEmailConfigured) {
      try {
        // Send emails with timeout (non-blocking)
        await withTimeout(
          Promise.all([
            sendContactNotification(validatedData),
            sendContactConfirmation(validatedData.email, validatedData.name),
          ]),
          TIMEOUTS.EXTERNAL,
          'Email sending timeout'
        );
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("Email not configured - message saved to database only");
    }

    // ✅ OPTIMIZED: Invalidate messages cache after new message
    await invalidateCache('messages:*');
    
    const duration = Date.now() - start;
    logRequest('POST', '/api/contact', 201, duration, { ip: clientIp });
    
    return successResponse(message, 201, "Message sent successfully");
  } catch (error) {
    const duration = Date.now() - start;
    const status = error instanceof Error && error.message.includes('timeout') ? 504 : 500;
    
    console.error("Error processing contact form:", error);
    logRequest('POST', '/api/contact', status, duration, { ip: clientIp });
    
    const errorMessage = error instanceof Error ? error.message : "Failed to send message";
    return errorResponse(errorMessage, status, error instanceof Error ? { name: error.name } : undefined);
  }
}

