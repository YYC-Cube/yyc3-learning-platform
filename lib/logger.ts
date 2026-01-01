export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  context?: string;
}

export class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.INFO,
      enableTimestamp: true,
      ...config
    };
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = this.config.enableTimestamp ? `[${new Date().toISOString()}] ` : '';
    const context = this.config.context ? `[${this.config.context}] ` : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    
    return `${timestamp}${context}${level}: ${message}${dataStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorData = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error;
      console.error(this.formatMessage('ERROR', message, errorData));
    }
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setContext(context: string): void {
    this.config.context = context;
  }
}

export const createLogger = (context?: string): Logger => {
  return new Logger({ context });
};

export const logger = new Logger();
