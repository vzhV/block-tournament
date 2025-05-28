import crypto from "crypto";

// Helper to sort and stringify all top-level fields, using JSON.stringify for objects
function buildDataCheckString(data: Record<string, any>): string {
  // Remove "hash" key
  const { hash, ...rest } = data;
  // Map each key to key=value, use JSON.stringify for objects
  const entries: string[] = Object.keys(rest)
    .map(key => {
      const value = rest[key];
      if (typeof value === "object") {
        return `${key}=${JSON.stringify(value)}`;
      } else {
        return `${key}=${value}`;
      }
    });
  // Sort alphabetically
  entries.sort();
  return entries.join('\n');
}

export function verifyTelegramAuth(data: Record<string, any>, botToken: string): boolean {
  if (!data || !data.hash) return false;
  const dataCheckString = buildDataCheckString(data);

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  console.log("[Telegram Auth] computed:", computedHash, "hash:", data.hash, "ok:", computedHash === data.hash);
  return computedHash === data.hash;
}
