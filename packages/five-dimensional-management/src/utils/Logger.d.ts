export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    component: string;
    message: string;
    metadata?: any;
    error?: Error;
}
/**
 * Simple logging utility for the Five-Dimensional Management System
 */
export declare class Logger {
    private component;
    private minLevel;
    constructor(component: string, minLevel?: LogLevel);
    private shouldLog;
    private formatMessage;
    private log;
    debug(message: string, metadata?: any): void;
    info(message: string, metadata?: any): void;
    warn(message: string, metadata?: any): void;
    error(message: string, error?: Error, metadata?: any): void;
    fatal(message: string, error?: Error, metadata?: any): void;
}
//# sourceMappingURL=Logger.d.ts.map