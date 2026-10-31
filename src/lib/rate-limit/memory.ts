/** ponytail: in-memory limiter; fine for local dev and single Node instance. */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export const checkRateLimit = (key: string, max: number, windowMs: number): boolean => {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (existing.count >= max) return false
  existing.count += 1
  return true
}
