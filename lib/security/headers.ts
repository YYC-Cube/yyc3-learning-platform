/**
 * @fileoverview Security headers middleware
 * @description Adds security headers to HTTP responses
 * @author YYC³ Team
 * @version 1.0.0
 */

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  /** Enable Content Security Policy */
  enableCSP?: boolean;
  /** Enable Strict Transport Security */
  enableHSTS?: boolean;
  /** Custom CSP directives */
  cspDirectives?: string;
}

/**
 * Default security headers
 */
const DEFAULT_SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), interest-cohort=(), fullscreen=(), payment=()',

  // Feature policy (legacy, for older browsers)
  'Feature-Policy':
    'geolocation \'none\'; microphone \'none\'; camera \'none\'; payment \'none\'',

  // Cache control
  'Cache-Control': 'no-cache, no-store, must-revalidate',

  // Pragma (legacy)
  'Pragma': 'no-cache',

  // Expires (legacy)
  'Expires': '0',

  // X-Permitted-Cross-Domain-Policies
  'X-Permitted-Cross-Domain-Policies': 'none',

  // X-Download-Options
  'X-Download-Options': 'noopen',

  // X-DNS-Prefetch-Control
  'X-DNS-Prefetch-Control': 'off',
};

/**
 * Get security headers for response
 */
export function getSecurityHeaders(
  config: SecurityHeadersConfig = {}
): Record<string, string> {
  const headers = { ...DEFAULT_SECURITY_HEADERS };

  // Add HSTS (HTTP Strict Transport Security)
  if (config.enableHSTS !== false) {
    headers['Strict-Transport-Security'] =
      'max-age=31536000; includeSubDomains; preload';
  }

  // Add CSP (Content Security Policy)
  if (config.enableCSP !== false) {
    const csp =
      config.cspDirectives ||
      "default-src 'self'; " +
      "script-src 'self' 'strict-dynamic' 'unsafe-inline' https:; " +
      "script-src-elem 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https: wss:; " +
      "media-src 'self' data: https:; " +
      "object-src 'none'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "frame-src 'self' https:; " +
      "worker-src 'self' blob:; " +
      "manifest-src 'self';";

    headers['Content-Security-Policy'] = csp;
  }

  return headers;
}

/**
 * Apply security headers to a Response object
 */
export function applySecurityHeaders(
  response: Response,
  config?: SecurityHeadersConfig
): Response {
  const headers = getSecurityHeaders(config);

  // Create new Response with headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      ...headers,
    },
  });

  return newResponse;
}

/**
 * Apply security headers to NextResponse
 */
export function applySecurityHeadersToNextResponse(
  response: Response,
  config?: SecurityHeadersConfig
): Response {
  const headers = getSecurityHeaders(config);

  // Set headers on the NextResponse
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * nonce for CSP
 */
export function generateNonce(): string {
  return crypto.randomUUID();
}

/**
 * CSP with nonce for dynamic content
 */
export function getCSPWithNonce(nonce: string): string {
  return `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-inline'; style-src 'self' 'nonce-${nonce}' 'unsafe-inline';`;
}
