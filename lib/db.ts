import mongoose from "mongoose";
import { logger } from "./logger";

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
      logger.debug('DB: Using cached connection', { duration });
    }
    return cached.conn;
  }

  if (!cached.promise) {
    if (process.env.NODE_ENV === 'development') {
      logger.info('DB: Creating new connection');
    }
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 3, // Lower for serverless to avoid connection exhaustion
      minPoolSize: 0, // No minimum for serverless (reduce overhead)
      serverSelectionTimeoutMS: 10000, // Increased for cold starts
      socketTimeoutMS: 30000, // Increased for network latency
      connectTimeoutMS: 10000, // Increased for cold start connections
      heartbeatFrequencyMS: 30000, // Less frequent checks to reduce overhead
      // Enable connection retry with exponential backoff
      retryWrites: true,
      retryReads: true,
      // Optimize for performance
      compressors: ['zlib'] as ('zlib' | 'none' | 'snappy' | 'zstd')[], // Enable compression for faster data transfer
      // Connection pool monitoring
      maxIdleTimeMS: 60000, // Keep connections alive longer for serverless
      // Optimize for serverless/edge
      directConnection: false, // Use connection pool (not direct)
      waitQueueTimeoutMS: 10000, // Increased timeout for serverless cold starts
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        logger.info('DB: Connected', { duration });
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    const totalDuration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && totalDuration > 100) {
      logger.warn('DB: Slow connection', { duration: totalDuration });
    }
  } catch (e) {
    cached.promise = null;
    const duration = Date.now() - start;
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    logger.error('DB: Connection failed', e, { duration, errorMessage });
    
    // Provide more helpful error message
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ETIMEDOUT')) {
      throw new Error('Unable to reach database server. Please check your network connection.');
    } else if (errorMessage.includes('Authentication failed')) {
      throw new Error('Database authentication failed. Please check credentials.');
    }
    
    throw new Error(`Database connection failed: ${errorMessage}`);
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
      logger.info('DB: Pre-warmed connection successfully');
    } catch (error) {
      // Fail silently - connection will be established on first request
      logger.warn('DB: Pre-warm failed, will connect on first request', { error });
    }
  }
}

