/**
 * logic for generating premium alphanumeric invite codes
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates a human-readable, alphanumeric invite code
 * Format: 12345A (5 numbers, 1 uppercase letter)
 */
export function generateInviteCode(): string {
  let code = "";

  // 5 random numbers
  for (let i = 0; i < 5; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }

  // 1 random uppercase letter
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  code += chars.charAt(Math.floor(Math.random() * chars.length));

  return code;
}

/**
 * Validates if the code format is correct
 */
export function isValidInviteCodeFormat(code: string): boolean {
  return /^\d{5}[A-Z]$/.test(code.toUpperCase());
}
