const TTL_MS = 5 * 60 * 1000;

interface TokenPayload {
  practitionerId: string;
  nonce: string;
  ts: number;
}

function toBase64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromBase64url(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function encodeToken(payload: TokenPayload): string {
  return toBase64url(JSON.stringify(payload));
}

export function decodeToken(
  token: string
): { payload: TokenPayload; valid: boolean; error?: string } {
  try {
    const payload = JSON.parse(fromBase64url(token)) as TokenPayload;
    const age = Date.now() - payload.ts;
    if (age > TTL_MS) {
      return { payload, valid: false, error: "Token expired" };
    }
    return { payload, valid: true };
  } catch {
    return {
      payload: { practitionerId: "", nonce: "", ts: 0 },
      valid: false,
      error: "Invalid token",
    };
  }
}
