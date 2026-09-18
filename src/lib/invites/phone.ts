/**
 * Phone numbers as the school writes them, normalised to E.164.
 *
 * Staff paste numbers from WhatsApp, Excel and notebooks, so spacing, dashes,
 * brackets and the leading 0 / 255 / +255 all vary. A number written with a
 * leading + that is not Tanzanian is accepted if its length is plausible:
 * some alumni live abroad.
 */
export type PhoneResult = { ok: true; phone: string } | { ok: false; reason: string };

const SHAPE = "Phone number should look like 0712 345 678.";

function tanzanian(national: string): PhoneResult {
  if (/^[67]\d{8}$/.test(national)) return { ok: true, phone: `+255${national}` };
  return { ok: false, reason: "Not a Tanzanian mobile number (it should start 06 or 07)." };
}

export function normalizeTzPhone(input: string): PhoneResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: "Phone number is missing." };
  if (/[^\d\s().+-]/.test(trimmed)) {
    return { ok: false, reason: "Phone number has letters or symbols in it." };
  }

  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    if (digits.startsWith("255")) return tanzanian(digits.slice(3));
    if (digits.length >= 8 && digits.length <= 15) return { ok: true, phone: `+${digits}` };
    return { ok: false, reason: SHAPE };
  }
  if (digits.length === 12 && digits.startsWith("255")) return tanzanian(digits.slice(3));
  if (digits.length === 10 && digits.startsWith("0")) return tanzanian(digits.slice(1));
  if (digits.length === 9) return tanzanian(digits);
  return { ok: false, reason: SHAPE };
}
