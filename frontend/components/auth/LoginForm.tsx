"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  resendLoginCode,
  resendVerification,
  type AuthError,
  type TwoFactorChallenge,
} from "@/lib/auth";

const CODE_LENGTH = 6;
const CODE_INPUT_ID = "login-code";

/** Error codes that mean the current challenge is dead and the user must start over. */
const RESTART_CODES = new Set([
  "two_factor_locked",
  "two_factor_expired",
  "two_factor_invalid",
  "two_factor_resend_limit",
]);

export function LoginForm() {
  const router = useRouter();
  const { login, verifyTwoFactor, user, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [codeNotice, setCodeNotice] = useState<string | null>(null);

  function focusCodeInput() {
    document.getElementById(CODE_INPUT_ID)?.focus();
  }

  useEffect(() => {
    if (isReady && user) {
      router.replace("/dashboard");
    }
  }, [isReady, user, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function restart(message?: string) {
    setChallenge(null);
    setCode("");
    setCooldown(0);
    setCodeNotice(null);
    setPassword("");
    setError(message ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUnverified(false);
    setResendMessage(null);

    try {
      const result = await login(email.trim(), password);
      if (result) {
        setChallenge(result);
        setCode("");
        setCodeNotice(null);
        setCooldown(result.resendAfterSeconds);
        return;
      }
      router.push("/dashboard");
    } catch (caught) {
      const apiError = caught as AuthError;
      setError(apiError.error ?? "Unable to sign in.");
      setUnverified(apiError.code === "email_unverified");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;

    if (code.length !== CODE_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setCodeNotice(null);

    try {
      await verifyTwoFactor(challenge.challengeId, code);
      router.push("/dashboard");
    } catch (caught) {
      const apiError = caught as AuthError;
      if (apiError.code && RESTART_CODES.has(apiError.code)) {
        restart(apiError.error ?? "Sign in again.");
        return;
      }
      setError(apiError.error ?? "Unable to verify that code.");
      setCode("");
      focusCodeInput();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (!challenge || cooldown > 0) return;

    setIsResendingCode(true);
    setError(null);
    setCodeNotice(null);

    try {
      const result = await resendLoginCode(challenge.challengeId);
      setCodeNotice(result.message);
      setCooldown(result.resendAfterSeconds);
    } catch (caught) {
      const apiError = caught as AuthError & { retryAfterSeconds?: number };
      if (apiError.code && RESTART_CODES.has(apiError.code)) {
        restart(apiError.error ?? "Sign in again.");
        return;
      }
      if (apiError.retryAfterSeconds) setCooldown(apiError.retryAfterSeconds);
      setError(apiError.error ?? "Unable to send another code.");
    } finally {
      setIsResendingCode(false);
    }
  }

  if (challenge) {
    return (
      <form onSubmit={handleVerify} noValidate className="space-y-5">
        <div>
          <p className="font-heading text-base font-semibold text-heading">
            Check your email
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a 6-digit sign-in code to{" "}
            <span className="font-medium text-heading">{challenge.maskedEmail}</span>.
            It expires in 10 minutes.
          </p>
        </div>
        <Input
          id={CODE_INPUT_ID}
          autoFocus
          label="Sign-in code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH}
          placeholder="123456"
          required
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
          }
          className="text-center font-mono text-lg tracking-[0.4em]"
        />
        {error ? (
          <p
            className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {codeNotice ? (
          <p className="text-sm text-heading" role="status">
            {codeNotice}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          disabled={isSubmitting || code.length !== CODE_LENGTH}
        >
          {isSubmitting ? "Verifying..." : "Verify and sign in"}
        </Button>
        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="font-medium text-brand-navy underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
            disabled={isResendingCode || cooldown > 0}
            onClick={handleResendCode}
          >
            {isResendingCode
              ? "Sending..."
              : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend code"}
          </button>
          <button
            type="button"
            className="text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => restart()}
          >
            Use a different account
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? (
        <p
          className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {unverified ? (
        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full"
          disabled={isResending || !email.trim()}
          onClick={async () => {
            setIsResending(true);
            setResendMessage(null);
            try {
              const result = await resendVerification(email.trim());
              setResendMessage(result.message);
            } catch (caught) {
              setResendMessage(
                (caught as AuthError).error ?? "Unable to send another email.",
              );
            } finally {
              setIsResending(false);
            }
          }}
        >
          {isResending ? "Sending..." : "Resend confirmation email"}
        </Button>
      ) : null}
      {resendMessage ? (
        <p className="text-sm text-heading" role="status">
          {resendMessage}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
