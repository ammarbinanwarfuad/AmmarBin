import mongoose from "mongoose";

// Lazy evaluation - only check when connectDB is called, not at module load time
// This allows tests to set MONGODB_URI before importing
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI || "";
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }
  
  // Enhance connection string with optimized query parameters if not already present
  try {
    const url = new URL(uri);
    
    // Add query parameters if they don't exist
    if (!url.searchParams.has('retryWrites')) {
      url.searchParams.set('retryWrites', 'true');
    }
    if (!url.searchParams.has('w')) {
      url.searchParams.set('w', 'majority');
    }
    if (!url.searchParams.has('appName')) {
      url.searchParams.set('appName', 'PortfolioApp');
    }
    // Ensure directConnection is false for Atlas (default for mongodb+srv)
    if (uri.startsWith('mongodb+srv://') && !url.searchParams.has('directConnection')) {
      url.searchParams.set('directConnection', 'false');
    }
    
    return url.toString();
  } catch {
    // If URI parsing fails, return original (might be a connection string format)
    return uri;
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  const start = Date.now();
  
  // Get URI when function is called, not at module load time
  const MONGODB_URI = getMongoUri();
  
  if (cached.conn) {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`DB: Using cached connection (${duration}ms)`);
    }
    return cached.conn;
  }

  if (!cached.promise) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Creating new connection...');
    }
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Start with 2 connections for faster response (increased from 1)
      serverSelectionTimeoutMS: 2000, // Reduced from 3000ms for faster TTFB
      socketTimeoutMS: 4000, // Reduced from 5000ms for faster response
      connectTimeoutMS: 2000, // Reduced from 3000ms for faster connection
      heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
      // Enable connection retry with exponential backoff
      retryWrites: true,
      retryReads: true,
      // Optimize for performance
      compressors: ['zlib'] as ('zlib' | 'none' | 'snappy' | 'zstd')[], // Enable compression for faster data transfer
      // Connection pool monitoring
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      // Optimize for serverless/edge
      directConnection: false, // Use connection pool (not direct)
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`DB: Connected (${duration}ms)`);
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    const totalDuration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && totalDuration > 100) {
      console.warn(`DB: Slow connection (${totalDuration}ms)`);
    }
  } catch (e) {
    cached.promise = null;
    const duration = Date.now() - start;
    console.error(`DB: Connection failed after ${duration}ms`, e);
    throw e;
  }

  return cached.conn;
}

/**
 * Pre-warm database connection in production
 * Call this early in your application lifecycle to establish connection before first request
 * This is optional but recommended for production environments
 */
export async function preWarmConnection(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    try {
      await connectDB();
      console.log('DB: Pre-warmed connection successfully');
    } catch (error) {
      // Fail silently - connection will be established on first request
      console.warn('DB: Pre-warm failed, will connect on first request:', error);
    }
  }
}

