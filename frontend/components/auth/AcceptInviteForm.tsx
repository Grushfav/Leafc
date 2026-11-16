"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchInvite,
  roleLabel,
  type AccountRole,
  type AuthError,
} from "@/lib/auth";

type InvitePreview = {
  name: string;
  email: string;
  role: AccountRole;
  expiresAt: string;
};

function AcceptInviteFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token")?.trim() ?? "";
  const { completeInvite, user, isReady } = useAuth();

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    rawToken ? "loading" : "error",
  );
  const [loadError, setLoadError] = useState(
    rawToken
      ? "Loading your invitation…"
      : "This invite link is missing or incomplete. Ask an admin to resend.",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace("/dashboard");
    }
  }, [isReady, user, router]);

  useEffect(() => {
    if (!rawToken) return;
    let cancelled = false;

    setLoadState("loading");
    fetchInvite(rawToken)
      .then((preview) => {
        if (cancelled) return;
        setInvite(preview);
        setLoadState("ready");
      })
      .catch((caught: AuthError) => {
        if (cancelled) return;
        setLoadState("error");
        const message = caught.error ?? "Unable to load this invitation.";
        setLoadError(
          message.endsWith(" Ask an admin to resend.")
            ? message
            : `${message} Ask an admin to resend.`,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [rawToken]);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      await completeInvite(rawToken, password);
      router.replace("/dashboard");
    } catch (caught) {
      const apiError = caught as AuthError;
      const message =
        apiError.error ?? "Unable to accept this invitation.";
      setSubmitError(
        message.endsWith(" Ask an admin to resend.")
          ? message
          : `${message} Ask an admin to resend.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadState === "loading") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading your invitation…
      </p>
    );
  }

  if (loadState === "error" || !invite) {
    return (
      <div className="space-y-5">
        <p
          className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {loadError}
        </p>
        <Button href="/login" variant="accent" size="md" className="w-full">
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="rounded-xl border border-border-subtle bg-warm-cream/60 px-4 py-3 text-sm">
        <p className="font-medium text-heading">{invite.name}</p>
        <p className="mt-0.5 text-muted-foreground">{invite.email}</p>
        <p className="mt-2 text-muted-foreground">
          Role:{" "}
          <span className="font-medium text-heading">
            {roleLabel(invite.role)}
          </span>
        </p>
      </div>

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        hint="At least 8 characters."
      />
      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={fieldErrors.confirmPassword}
      />

      {submitError ? (
        <p
          className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Setting password…" : "Accept invitation"}
      </Button>
    </form>
  );
}

export function AcceptInviteForm() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground" role="status">
          Loading your invitation…
        </p>
      }
    >
      <AcceptInviteFormInner />
    </Suspense>
  );
}
