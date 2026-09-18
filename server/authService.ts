import crypto from "crypto";

export interface UserSession {
  token: string;
  email: string;
  name: string;
  createdAt: string;
}

interface StoredOtp {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// In-memory persistent auth state
const otpStore = new Map<string, StoredOtp>();
const sessionStore = new Map<string, UserSession>();

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
export function generateOtp(): string {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

/**
 * Send an OTP to the given email address
 */
export function sendOtpToEmail(email: string): { success: boolean; message: string; demoOtp: string; expiresAt: number } {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedEmail, {
    otp,
    expiresAt,
    attempts: 0,
  });

  console.log(`\n========================================`);
  console.log(`[AUTH SERVICE] 📧 Verification OTP for ${normalizedEmail}`);
  console.log(`[AUTH SERVICE] Code: >>> ${otp} <<<`);
  console.log(`[AUTH SERVICE] Valid for 10 minutes (until ${new Date(expiresAt).toLocaleTimeString()})`);
  console.log(`========================================\n`);

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
    demoOtp: otp,
    expiresAt,
  };
}

/**
 * Verify the 6-digit OTP for an email
 */
export function verifyOtp(email: string, inputOtp: string): { success: boolean; message: string; user?: UserSession } {
  const normalizedEmail = email.trim().toLowerCase();
  const stored = otpStore.get(normalizedEmail);

  if (!stored) {
    return {
      success: false,
      message: "No OTP was requested for this email. Please request a new code.",
    };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "This verification code has expired. Please request a new code.",
    };
  }

  stored.attempts += 1;
  if (stored.attempts > 5) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "Too many incorrect attempts. Please request a fresh verification code.",
    };
  }

  if (stored.otp !== inputOtp.trim()) {
    return {
      success: false,
      message: "Invalid verification code. Please check and try again.",
    };
  }

  // OTP is valid!
  otpStore.delete(normalizedEmail);

  const token = `nexus_sess_${crypto.randomUUID()}`;
  const username = normalizedEmail.split("@")[0] || "User";
  const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

  const session: UserSession = {
    token,
    email: normalizedEmail,
    name: formattedName,
    createdAt: new Date().toISOString(),
  };

  sessionStore.set(token, session);

  console.log(`[AUTH SERVICE] ✅ User verified & authenticated: ${normalizedEmail}`);

  return {
    success: true,
    message: "Email verified successfully!",
    user: session,
  };
}

/**
 * Validate a session token
 */
export function getSession(token: string): UserSession | null {
  if (!token) return null;
  return sessionStore.get(token) || null;
}

/**
 * Log out a user session
 */
export function logoutSession(token: string): boolean {
  if (!token) return false;
  return sessionStore.delete(token);
}
