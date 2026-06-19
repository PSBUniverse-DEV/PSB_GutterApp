/**
 * CORS Utilities for PSBUniverse
 * Reads allowed origins from environment variable for flexible configuration
 */

/**
 * Get allowed CORS origins from environment variable
 * @returns {string[]}
 */
function getAllowedOrigins() {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  
  if (!envOrigins) {
    // Default origins if env var not set
    return [
      'https://gutter.psbuniverse.com',
      'https://www.psbuniverse.com',
      'https://psbuniverse.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
  }
  
  // Split comma-separated origins and trim whitespace
  return envOrigins.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * Build CORS headers based on request origin
 * @param {Request} request 
 * @param {Object} options - Additional CORS options
 * @returns {Record<string, string>}
 */
export function getCORSHeaders(request, options = {}) {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  const {
    methods = 'GET, POST, OPTIONS, PUT, DELETE',
    allowHeaders = 'Content-Type, Authorization, X-Requested-With',
    allowCredentials = true,
    maxAge = '86400',
  } = options;
  
  const headers = {
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': allowHeaders,
    'Access-Control-Max-Age': maxAge,
  };
  
  // Use specific origin if allowed, otherwise wildcard
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    if (allowCredentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  return headers;
}

/**
 * Check if origin is allowed
 * @param {string} origin 
 * @returns {boolean}
 */
export function isOriginAllowed(origin) {
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}