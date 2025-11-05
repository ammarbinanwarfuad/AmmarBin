import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebVital } from '@/models/WebVital';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType?: string;
  url?: string;
}

// ⚡ Performance: Fire and forget - don't block response
export const dynamic = 'force-dynamic';
export const maxDuration = 5; // Max 5 seconds for edge cases

export async function POST(request: Request) {
  try {
    // Handle both JSON and Blob (from sendBeacon) requests
    let metric: WebVitalMetric;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      metric = await request.json();
    } else {
      // Handle Blob from sendBeacon
      const blob = await request.blob();
      const text = await blob.text();
      metric = JSON.parse(text);
    }
    
    const url = metric.url || request.headers.get('referer') || 'unknown';
    const userAgent = request.headers.get('user-agent');
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        metric: metric.name,
        value: `${metric.value.toFixed(2)}ms`,
        rating: metric.rating,
        url,
      });
    }
    
    // ⚡ CRITICAL: Return immediately, store in DB asynchronously
    // This prevents blocking the response
    // Use Promise.resolve().then() for serverless compatibility
    Promise.resolve().then(async () => {
      try {
        await connectDB();
        await WebVital.create({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          url,
          userAgent,
          timestamp: new Date(),
        });
      } catch (dbError) {
        // Silently fail - analytics shouldn't break the app
        if (process.env.NODE_ENV === 'development') {
          console.error('Error storing Web Vital:', dbError);
        }
      }
    }).catch(() => {
      // Ignore any errors in the background task
    });
    
    // Return immediately without waiting for DB
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    // Return success even on error to not break analytics
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}


