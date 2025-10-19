/**
 * Production-safe logger utility
 * Logs to console in development, can be extended to log to external services in production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context));
    }
    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    // this.sendToMonitoring('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment || this.isProduction) {
      console.warn(this.formatMessage('warn', message, context));
    }
    // In production, send to monitoring service
    // this.sendToMonitoring('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = error instanceof Error 
      ? { ...context, error: error.message, stack: error.stack }
      : { ...context, error };

    console.error(this.formatMessage('error', message, errorContext));
    
    // In production, send to monitoring service
    // this.sendToMonitoring('error', message, errorContext);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Performance monitoring helper
  performance(label: string, durationMs: number, threshold: number = 100): void {
    if (durationMs > threshold) {
      this.warn(`Slow operation: ${label}`, { durationMs, threshold });
    } else if (this.isDevelopment) {
      this.debug(`${label}`, { durationMs });
    }
  }

  // Future: Add method to send logs to external monitoring service
  // private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
  //   if (this.isProduction && process.env.SENTRY_DSN) {
  //     // Send to Sentry or other monitoring service
  //   }
  // }
}

export const logger = new Logger();
