import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure Member ID in the official ARX format:
 * Format: ARX-XXXX_XXXX  (hex characters, uppercase)
 * e.g., ARX-4B2F_9A12, ARX-C3D1_7E4A
 *
 * Uses crypto.randomBytes for CSPRNG — not Math.random().
 * Collision-checks against the existing ID set before returning.
 */
export function generateMemberId(existingIds) {
  const charset = '0123456789ABCDEF';

  function randomSegment(length) {
    const bytes = randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      // Bias-free modulo: charset length is 16, byte range is 256 = 16*16 → no bias
      result += charset[bytes[i] & 0x0f];
    }
    return result;
  }

  let candidate;
  let attempts = 0;

  do {
    const partA = randomSegment(4);
    const partB = randomSegment(4);
    candidate = `ARX-${partA}_${partB}`;
    attempts++;

    if (attempts > 10_000) {
      // Extremely unlikely — fail loudly rather than silently loop
      throw new Error('[idGenerator] Could not generate a unique Member ID after 10,000 attempts.');
    }
  } while (existingIds.has(candidate.toUpperCase()));

  return candidate;
}

/**
 * Generates a standardized, unique Certificate ID with official ARX format
 * Format: ARX-[CODE]-[YEAR]-[5-DIGIT NUMBER]
 * e.g., ARX-PY-2026-00421
 * Uses crypto.randomBytes for entropy.
 */
export function generateCertificateId(courseTitle, existingCertIds) {
  const words = courseTitle.toUpperCase().replace(/[^A-Z\s]/g, '').split(/\s+/).filter(Boolean);
  let code = 'TECH';
  if (words.length >= 2) {
    code = `${words[0][0]}${words[1][0]}`;
  } else if (words.length === 1) {
    code = words[0].slice(0, 4);
  }

  const year = new Date().getFullYear();
  let attempts = 0;

  while (attempts < 1000) {
    // Use randomBytes for cert number too
    const buf = randomBytes(4);
    const num = 10000 + (buf.readUInt32BE(0) % 90000);
    const candidate = `ARX-${code}-${year}-${num}`;
    if (!existingCertIds.has(candidate)) {
      return candidate;
    }
    attempts++;
  }

  // Ultimate fallback using timestamp suffix
  return `ARX-${code}-${year}-${Date.now().toString().slice(-5)}`;
}