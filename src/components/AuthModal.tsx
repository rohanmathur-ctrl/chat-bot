import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Lock, 
  Sparkles,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [deliveredOtp, setDeliveredOtp] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Focus first digit box when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  // Step 1: Send OTP to Email
  const handleSendOtp = async (targetEmail?: string) => {
    const emailToUse = targetEmail || email.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setDeliveredOtp(data.demoOtp || null);
      setStep('otp');
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle 6-digit OTP input mechanics
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle single character
    const lastChar = cleanVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = lastChar;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const fullOtp = otpDigits.join('');
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  // Handle pasting full 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    // Focus either the next empty box or the last box
    const focusIndex = Math.min(pasted.length, 5);
    digitInputRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  // Auto-fill test code
  const handleAutoFill = (code: string) => {
    const chars = code.split('').slice(0, 6);
    setOtpDigits(chars);
    handleVerifyOtp(code);
  };

  // Step 3: Verify OTP with server
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otpDigits.join('');
    if (finalOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: finalOtp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code.');
      }

      setStep('success');
      
      // Save session locally
      if (data.user) {
        localStorage.setItem('nexus_auth_user', JSON.stringify(data.user));
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
          // Reset modal state
          setStep('email');
          setOtpDigits(['', '', '', '', '', '']);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="auth-modal-card"
        className="w-full max-w-md bg-[#10131e] border border-[#252b40] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/90 relative overflow-hidden text-slate-200"
      >
        {/* Glowing Ambient Gradient behind card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7c5cfc]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1f30] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header / Brand */}
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5d3bf6] to-[#7c5cfc] flex items-center justify-center mx-auto shadow-lg shadow-[#7c5cfc]/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Sign in to Nexus AI</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Enter your email address to receive an instant 6-digit verification code.
              </p>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="name@company.com"
                    autoFocus
                    className="w-full bg-[#161a28] border border-[#272e44] focus:border-[#7c5cfc] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                id="auth-send-otp-btn"
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#7c5cfc] hover:bg-[#6844f7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7c5cfc]/30"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security perks */}
            <div className="pt-2 border-t border-[#1c2234] flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Passwordless</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#a58bff]" />
                <span>Zero spam</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Encrypted session</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 'otp' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Check your email</h2>
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <span>We sent a 6-digit code to</span>
                <span className="font-semibold text-slate-200">{email}</span>
                <button
                  id="auth-change-email-btn"
                  onClick={() => {
                    setStep('email');
                    setErrorMessage(null);
                  }}
                  className="text-[#a58bff] hover:underline text-[11px] ml-1"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Instant Delivery Simulation Toast for rapid preview testing */}
            {deliveredOtp && (
              <div 
                id="auth-delivered-otp-banner"
                className="p-3 rounded-2xl bg-[#161f30] border border-[#2a3c5a] flex items-center justify-between gap-2 text-xs text-slate-200 animate-in slide-in-from-top-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <span className="text-slate-400 text-[11px]">Verification Code: </span>
                    <span className="font-mono font-bold text-emerald-300 text-sm tracking-widest">{deliveredOtp}</span>
                  </div>
                </div>
                <button
                  id="auth-autofill-otp-btn"
                  onClick={() => handleAutoFill(deliveredOtp)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Auto-Fill</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 6 Discrete Digit Boxes */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (digitInputRefs.current[idx] = el)}
                    id={`auth-otp-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border bg-[#141826] text-white outline-none transition-all ${
                      digit 
                        ? 'border-[#7c5cfc] bg-[#1a1f34] shadow-sm shadow-[#7c5cfc]/30' 
                        : 'border-[#272e44] focus:border-[#7c5cfc]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              id="auth-verify-otp-btn"
              onClick={() => handleVerifyOtp()}
              disabled={isLoading || otpDigits.some(d => !d)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#7c5cfc] hover:bg-[#6844f7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7c5cfc]/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Sign In</span>
                </>
              )}
            </button>

            {/* Resend countdown */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Didn't receive the code?</span>
              {resendTimer > 0 ? (
                <span className="font-mono text-[11px] text-slate-400">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  id="auth-resend-otp-btn"
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  className="text-[#a58bff] hover:text-white font-medium transition-colors"
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Success State */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Email Verified!</h3>
              <p className="text-xs text-slate-400">
                Welcome to Nexus AI. Your authenticated session is ready.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
