
import { verifyToken } from '../utils/jwtUtils.js';
import { db } from '../services/db.js';

/**
 * authMiddleware — Verifies Bearer token and confirms the member account
 * still exists and is active in the database.
 *
 * SEC: We perform a live DB lookup on every request to ensure suspended or
 * deleted accounts cannot reuse a previously issued token.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }

  // Live DB lookup — reject tokens for accounts that no longer exist
  const member = db.findMemberById(payload.id);
  if (!member) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }

  if (member.role === 'member') {
    if (member.status === 'pending') {
      res.status(403).json({
        error: 'Your application is currently under review by an administrator.',
        status: 'pending'
      });
      return;
    }

    if (member.status === 'rejected') {
      res.status(403).json({
        error: member.rejectionReason
          ? `Your application was not approved: ${member.rejectionReason}`
          : 'Your application has been declined by an administrator.',
        status: 'rejected'
      });
      return;
    }
  }

  if (member.status === 'suspended') {
    res.status(403).json({
      error: 'Your account is currently suspended. Please contact club administration.'
    });
    return;
  }

  // Attach full payload and live-verified role (not just the token claim)
  req.user = {
    ...payload,
    // Override the token's role claim with the live DB value — prevents
    // privilege escalation if a token was issued before a role downgrade.
    role: member.role
  };
  next();
}

/**
 * adminMiddleware — Strict server-side RBAC middleware for all admin endpoints.
 *
 * SEC: Enforces administrator status in two layers:
 *   1. Token validity (via authMiddleware)
 *   2. Live DB role check — the role is re-read from the database on every
 *      request, not trusted from the JWT alone. This means revoking admin
 *      access takes effect immediately without waiting for token expiry.
 *
 * Any attempt to access an admin endpoint without a valid admin account
 * will be rejected with 403 Forbidden.
 */
export function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    // Double-check against live DB — req.user.role is already set from DB in
    // authMiddleware, but we do an explicit second verification here to make
    // the RBAC boundary explicit and auditable.
    const member = db.findMemberById(req.user.id);
    if (!member || member.role !== 'admin') {
      res.status(403).json({
        error: 'Access denied. Administrator privileges required.'
      });
      return;
    }

    // Confirm account is active
    if (member.status === 'suspended') {
      res.status(403).json({
        error: 'This administrator account is suspended. Contact system administration.'
      });
      return;
    }

    next();
  });
}

/**
 * optionalAuthMiddleware — Attaches user context when a token is present
 * but does not reject requests without one.
 * Used for public endpoints that show different content for authenticated users.
 */
export function optionalAuthMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (payload) {
      // Verify the account still exists before attaching
      const member = db.findMemberById(payload.id);
      if (member && member.status !== 'suspended') {
        req.user = { ...payload, role: member.role };
      }
    }
  }
  next();
}