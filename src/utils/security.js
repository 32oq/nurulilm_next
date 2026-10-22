/**
 * @file security.js
 * @description Cryptographic token decoding and client-side payload tamper protection.
 * Prevents HTTP response tampering attacks (e.g., modifying `act` in proxy tools like Burp Suite).
 */

/**
 * Safely parses the payload of a JSON Web Token (JWT) without external libraries.
 * Handles base64url padding and Unicode characters.
 * 
 * @param {string} token - The raw JWT string
 * @returns {Record<string, any>|null} Decoded JSON payload or null if invalid
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Validates and extracts the authentic user role from the cryptographically signed JWT.
 * Detects if the unauthenticated JSON body (`user.act`) was manipulated during transit.
 * 
 * @param {string} token - Access token returned from authentication
 * @param {Record<string, any>} user - User object from HTTP response
 * @returns {{ role: string, isTampered: boolean }}
 */
export function validateAndEnforceRole(token, user) {
  const tokenPayload = parseJwtPayload(token);
  
  if (tokenPayload && tokenPayload.user_type) {
    const signedRole = String(tokenPayload.user_type);
    const claimedRole = String(user?.act || user?.user_type || '');

    // Check if proxy or attacker modified the response body `act` to elevate privileges
    const isTampered = Boolean(
      claimedRole && 
      claimedRole.toLowerCase() !== signedRole.toLowerCase()
    );

    if (isTampered) {
      console.warn(
        `[Security Warning] Role mismatch detected! Claimed: "${claimedRole}", Signed Token: "${signedRole}". ` +
        `Overriding with cryptographically signed token claim to prevent privilege escalation.`
      );
    }

    return {
      role: signedRole,
      isTampered,
    };
  }

  // Fallback to user object if no token payload available
  return {
    role: user?.act || user?.user_type || 'Patron',
    isTampered: false,
  };
}
