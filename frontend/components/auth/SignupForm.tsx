"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/components/auth/AuthProvider";
import { resendVerification, type AuthError, type StaffRole } from "@/lib/auth";

const MEMBER_ROLES: { value: StaffRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "senior_agent", label: "Senior agent" },
  { value: "agent", label: "Agent" },
];

export function SignupForm() {
  const router = useRouter();
  const { register, user, isReady } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole | "">("");
  const [inviteCode, setInviteCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace("/dashboard");
    }
  }, [isReady, user, router]);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (!role) next.role = "Select your member role.";
    if (!inviteCode.trim()) next.inviteCode = "Invite code is required.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      const result = await register({
        accountType: "member",
        name: name.trim(),
        email: email.trim(),
        password,
        role: role as StaffRole,
        inviteCode: inviteCode.trim(),
      });
      if (result.requiresVerification) {
        setPendingEmail(email.trim().toLowerCase());
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setSubmitError(apiError.error ?? "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pendingEmail) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-medium text-heading">{pendingEmail}</span>. Open
          that email to verify your address, then sign in.
        </p>
        {resendMessage ? (
          <p className="text-sm text-heading" role="status">
            {resendMessage}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full"
          disabled={isResending}
          onClick={async () => {
            setIsResending(true);
            setResendMessage(null);
            try {
              const result = await resendVerification(pendingEmail);
              setResendMessage(result.message);
            } catch (error) {
              setResendMessage(
                (error as AuthError).error ?? "Unable to send another email.",
              );
            } finally {
              setIsResending(false);
            }
          }}
        >
          {isResending ? "Sending..." : "Resend confirmation email"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Full name"
        name="name"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint="At least 8 characters."
      />
      <Select
        label="Member role"
        name="role"
        required
        value={role}
        onChange={(event) => setRole(event.target.value as StaffRole | "")}
        options={MEMBER_ROLES}
        placeholder="Select role"
        error={errors.role}
      />
      <Input
        label="Staff invite code"
        name="inviteCode"
        type="password"
        required
        value={inviteCode}
        onChange={(event) => setInviteCode(event.target.value)}
        error={errors.inviteCode}
        hint="Provided by a LEAF-C administrator."
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
        {isSubmitting ? "Creating account..." : "Create staff account"}
      </Button>
    </form>
  );
}
