/**
 * ARX IT CLUB OF SJS — Input Sanitization Utilities
 *
 * Provides XSS defence for user-supplied strings that will be stored in the
 * in-memory database and subsequently returned in API responses / rendered in
 * the browser.
 *
 * Strategy: allowlist-based HTML entity encoding.
 * We do NOT use a heavy DOM parser — the app runs in Node.js (no DOM), and all
 * values are stored as plain text / returned as JSON (not as raw HTML), so
 * escaping the five dangerous HTML characters is sufficient to neutralise
 * reflected and stored XSS vectors when content is later rendered in templates.
 */

/**
 * Escapes the five characters that can break out of HTML contexts:
 *   &  →  &amp;
 *   <  →  &lt;
 *   >  →  &gt;
 *   "  →  &quot;
 *   '  →  &#x27;
 *
 * @param {unknown} value - Any value; non-strings are returned as-is.
 * @returns {string|unknown} - Escaped string, or original value if not a string.
 */
export function escapeHtml(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Strips all HTML tags from a string, leaving only text content.
 * Useful for fields that should never contain markup (names, bio, etc.).
 *
 * @param {unknown} value
 * @returns {string|unknown}
 */
export function stripTags(value) {
  if (typeof value !== 'string') return value;
  // Remove everything that looks like an HTML tag
  return value.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitizes a plain-text field: strips tags then trims whitespace.
 * Use this for names, bio text, descriptions, and any field that will be
 * stored and returned as plain text.
 *
 * @param {unknown} value
 * @returns {string|unknown}
 */
export function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return stripTags(value).replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes a URL string.
 * - Strips surrounding whitespace.
 * - Rejects javascript: and data: URI schemes which can execute code.
 * - Returns an empty string if the value is unsafe.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeUrl(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  // Block dangerous URI schemes
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}

/**
 * Sanitizes an object's string fields recursively (one level deep).
 * Applies sanitizeText to every string property.
 * Useful for sanitizing entire request body objects at controller entry points.
 *
 * @param {Record<string, unknown>} obj
 * @returns {Record<string, unknown>}
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      result[key] = sanitizeText(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}
