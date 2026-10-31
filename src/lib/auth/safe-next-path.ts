const BASE = "http://mobigo.invalid";

// Only allow same-site relative paths as post-auth redirect targets (no open redirects).
export function safeNextPath(path: unknown, fallback = "/"): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return fallback;
  }
  try {
    const url = new URL(path, BASE);
    return url.origin === BASE ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
