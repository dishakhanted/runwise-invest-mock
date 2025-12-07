/**
 * Debug logging utility for the application
 * Provides structured logging with environment-based configuration
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isDebugEnabled: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    // Enable debug logs in development or if explicitly enabled via env var
    this.isDebugEnabled = 
      this.isDevelopment || 
      import.meta.env.VITE_DEBUG_LOGGING === 'true' ||
      localStorage.getItem('growwise_debug') === 'true';
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} | Context: ${JSON.stringify(context)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === 'error') return true; // Always log errors
    if (level === 'warn') return true; // Always log warnings
    if (level === 'info') return this.isDevelopment || this.isDebugEnabled;
    if (level === 'debug') return this.isDebugEnabled;
    return false;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    
    const logContext = error 
      ? { ...context, error: { message: error.message, stack: error.stack } }
      : context;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, logContext || '');
        break;
      case 'info':
        console.info(formattedMessage, logContext || '');
        break;
      case 'warn':
        console.warn(formattedMessage, logContext || '');
        break;
      case 'error':
        console.error(formattedMessage, logContext || '', error || '');
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  /**
   * Logs route navigation events
   */
  route(path: string, context?: LogContext): void {
    this.debug(`Route navigation: ${path}`, { path, ...context });
  }

  /**
   * Logs authentication events
   */
  auth(event: string, context?: LogContext): void {
    this.info(`Auth event: ${event}`, { event, ...context });
  }

  /**
   * Logs API/edge function calls
   */
  api(method: string, endpoint: string, context?: LogContext): void {
    this.debug(`API call: ${method} ${endpoint}`, { method, endpoint, ...context });
  }

  /**
   * Logs financial data operations
   */
  financial(operation: string, context?: LogContext): void {
    this.debug(`Financial operation: ${operation}`, { operation, ...context });
  }

  /**
   * Logs chat/AI interactions
   */
  chat(event: string, context?: LogContext): void {
    this.debug(`Chat event: ${event}`, { event, ...context });
  }

  /**
   * Logs session state changes
   */
  session(event: string, context?: LogContext): void {
    this.info(`Session event: ${event}`, { event, ...context });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogContext };

