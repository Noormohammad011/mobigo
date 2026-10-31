// Bangladesh mobile numbers are stored as 01XXXXXXXXX (matches the user_phone_bd CHECK).
const BD_MOBILE = /^01[3-9]\d{8}$/;

export function normalizeBdPhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let digits = input.replace(/[\s-]/g, "").replace(/^\+/, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  return BD_MOBILE.test(digits) ? digits : null;
}
