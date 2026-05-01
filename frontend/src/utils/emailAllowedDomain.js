// Domain must be exactly `gmail.com` — avoids false positives like `notgmail.com` using full-domain match only.
const ALLOWED_DOMAIN = "gmail.com";

export const GMAIL_ONLY_MESSAGE =
  "Only @gmail.com addresses are allowed. You cannot sign in or register with @company.com or other domains.";

export function isGmailAddress(email) {
  const e = String(email ?? "").trim();
  const at = e.lastIndexOf("@");
  if (at <= 0 || at === e.length - 1) return false;
  const domain = e.slice(at + 1).toLowerCase();
  return domain === ALLOWED_DOMAIN;
}
