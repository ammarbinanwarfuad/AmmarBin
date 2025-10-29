import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

/**
 * Health check endpoint
 * Useful for monitoring and load balancer health checks
 */
export async function GET() {
  const start = Date.now();
  
  try {
    // Check database connection
    await connectDB();
    
    const duration = Date.now() - start;
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
      },
      responseTime: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - start;
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "disconnected",
        },
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${duration}ms`,
      },
      { status: 503 }
    );
  }
}

