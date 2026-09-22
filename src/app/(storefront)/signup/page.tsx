"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye, EyeOff, Loader2, UserPlus, ArrowRight, Mail,
  CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck
} from "lucide-react";

export default function CustomerSignupPage() {
  const router = useRouter();

  // Step State: "details" | "otp"
  const [step, setStep] = useState<"details" | "otp">("details");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // OTP State (6 digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback & Loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to Email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          purpose: "registration",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep("otp");
        setResendCooldown(60);
        setInfoMsg(`We sent a 6-digit code to ${email.trim()}`);
        // Focus first OTP input on step change
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setError(data.error || "Failed to send verification code. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your internet connection.");
    }
    setLoading(false);
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // numbers only

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // only keep last typed character
    setOtpDigits(newDigits);
    setError("");

    // Auto move focus to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste event for complete OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const splitDigits = pasted.split("");
      setOtpDigits(splitDigits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          otp: fullOtp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Save auth to client storage
        localStorage.setItem(
          "gh_auth",
          JSON.stringify({
            loggedIn: true,
            email: data.user.email,
            name: data.user.name,
            role: "Customer",
            loginAt: new Date().toISOString(),
          })
        );
        router.push("/account");
        router.refresh();
      } else {
        setError(data.error || "Verification failed. Please check the code and try again.");
        setLoading(false);
      }
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    setInfoMsg("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          purpose: "registration",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setInfoMsg("A new 6-digit verification code has been sent!");
        otpInputRefs.current[0]?.focus();
      } else {
        setError(data.error || "Failed to resend code. Please try again.");
      }
    } catch {
      setError("Connection error while resending code.");
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
      {/* Ambient background glows */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,oklch(0.85_0.08_250/.5),transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.88_0.09_260/.4),transparent_50%)]" />
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 animate-fade-up">
          <Link href="/" className="inline-flex items-center justify-center mb-3">
            <div className="relative h-14 w-[180px] flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={256}
                height={151}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl">
            {step === "details" ? "Create Your Account" : "Verify Your Email"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {step === "details"
              ? "Join for exclusive tech deals and warranty protection"
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Main Card */}
        <div
          className="glass rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/10 border border-border/80 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          {/* ═══════════ STEP 1: REGISTRATION DETAILS FORM ═══════════ */}
          {step === "details" && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <UserPlus className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Customer Sign Up</h2>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Email Address (For Verification) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Mobile Phone Number <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Confirm Password *
                  </label>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                </div>

                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending verification code...
                    </>
                  ) : (
                    <>
                      Send Verification Code <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═══════════ STEP 2: 6-DIGIT OTP VERIFICATION FORM ═══════════ */}
          {step === "otp" && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email / Edit info
              </button>

              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Enter 6-Digit Code</h2>
              </div>

              <p className="text-xs text-muted-foreground mb-6">
                Please check your inbox for <strong>{email}</strong> and enter the OTP below.
              </p>

              {infoMsg && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{infoMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                {/* 6-Digit OTP Box Grid */}
                <div className="flex justify-between gap-2 sm:gap-2.5 onPaste" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  ))}
                </div>

                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length !== 6}
                  className="w-full py-3.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying code...
                    </>
                  ) : (
                    <>
                      Verify &amp; Create Account <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP Section */}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-primary font-medium">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resending}
                        className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                      >
                        {resending && <Loader2 className="w-3 h-3 animate-spin" />} Resend Code
                      </button>
                    )}
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Footer links */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
