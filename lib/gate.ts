export const GATE_COOKIE = "rdr2map_gate";

export function sitePin(): string | undefined {
  const pin = process.env.SITE_PIN?.trim();
  return pin || undefined;
}

export async function gateToken(pin: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("rdr2map-unlock"),
  );
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function pinsEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(aa.length, bb.length);
  let out = aa.length === bb.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    out |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return out === 0;
}
