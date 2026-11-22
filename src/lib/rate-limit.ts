// F02 fix note: me file eka kalin hadala tibba (verify-email, chat
// route wal use karanawa), eth login/forgot-password wal use karala
// tibbe naha — eka nisa ewa unlimited attempts ta open wela tibba
// (brute-force password guessing, email-bombing risk). Dan login eken
// saha forgot-password eken me function eka call karanawa.

const hits = new Map<string, { count: number; resetAt: number }>();

// "why in-memory, not Redis/Upstash?" — me project eke dan Redis/Upstash
// wage distributed store ekak set wela na. In-memory Map ekak Vercel
// serverless eke "function instance ekakatama" witharak apply wenawa —
// instance ekak cold-start unoth count eka reset wenawa, saha weradi
// requests godak "instance" godak atara spread unoth, hama instance
// ekakatama "own" limit ekak thiyenawa (ekata ekak widiyata ekasath
// wenne na). Eka nisa me approach eka "dan tiyena tatawa ekata wada
// hari fix ekak" — eth traffic wedi unoth Upstash Redis wage persistent
// store ekakata switch karanna one.

/** key eka limit eka adu kara nathnam true ("allowed"), nattam false ("blocked"). */
export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();

  // Map eka wediwenawa nam, pරණ (expired) entries ain karanawa.
  if (hits.size > 1000) {
    for (const [k, v] of hits) {
      if (now > v.resetAt) hits.delete(k);
    }
  }

  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= limit) return false; // blocked

  entry.count++;
  return true;
}

/** key ekata athi witharak (consume karanne na), "nawatha try karanna puluwan wenne kiiyen" (seconds) kiyana eka return karanawa. Blocked unoth 429 response eke Retry-After header ekata use karanna. */
export function getRetryAfterSeconds(key: string): number {
  const entry = hits.get(key);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}

/**
 * Request eka awapu client ge IP eka ganna. Vercel wage platform ekaka
 * eke, edge proxy eka client eke request eka forward karana welawe
 * "x-forwarded-for" header eke ADANMA (first) IP eka danawa — eka
 * client ta spoof karanna baha (Vercel eke infra ekema danne).
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
