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
      level: LogLevel.INFO,
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

  debug(message: string, data?: any): void {
    if (this.config.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.config.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.config.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.config.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, data));
    }
  }
}

export const createLogger = (context?: string): Logger => {
  return new Logger({ context });
};