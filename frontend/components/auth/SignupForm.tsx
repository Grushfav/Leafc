"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/components/auth/AuthProvider";
import type {
  AccountType,
  AuthError,
  CustomerKind,
  StaffRole,
} from "@/lib/auth";

const MEMBER_ROLES: { value: StaffRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "senior_agent", label: "Senior agent" },
  { value: "agent", label: "Agent" },
];

export function SignupForm() {
  const router = useRouter();
  const { register, user, isReady } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole | "">("");
  const [inviteCode, setInviteCode] = useState("");
  const [customerKind, setCustomerKind] = useState<CustomerKind | "">("");
  const [organizationName, setOrganizationName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (accountType === "member") {
      if (!role) next.role = "Select your member role.";
      if (!inviteCode.trim()) next.inviteCode = "Invite code is required.";
    }
    if (accountType === "customer") {
      if (!customerKind) next.customerKind = "Select individual or organisation.";
      if (customerKind === "organization" && !organizationName.trim()) {
        next.organizationName = "Organisation name is required.";
      }
    }
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
      await register({
        accountType,
        name: name.trim(),
        email: email.trim(),
        password,
        role: accountType === "member" ? (role as StaffRole) : undefined,
        inviteCode: accountType === "member" ? inviteCode.trim() : undefined,
        customerKind:
          accountType === "customer" ? (customerKind as CustomerKind) : undefined,
        organizationName:
          accountType === "customer" && customerKind === "organization"
            ? organizationName.trim()
            : undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setSubmitError(apiError.error ?? "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Account type"
      >
        {(
          [
            {
              value: "customer" as const,
              label: "Customer / organisation",
              description: "Request services and track your inquiries.",
            },
            {
              value: "member" as const,
              label: "LEAF-C member",
              description: "Admin, senior agent, or agent workspace.",
            },
          ]
        ).map((option) => {
          const selected = accountType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setAccountType(option.value);
                setSubmitError(null);
              }}
              className={
                selected
                  ? "rounded-2xl border border-brand-orange bg-brand-orange/10 p-4 text-left ring-2 ring-brand-orange/30"
                  : "rounded-2xl border border-border-subtle bg-warm-white p-4 text-left hover:border-brand-orange/40"
              }
            >
              <span className="block font-heading font-semibold text-heading">
                {option.label}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

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

      {accountType === "member" ? (
        <>
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
        </>
      ) : (
        <>
          <Select
            label="I am signing up as"
            name="customerKind"
            required
            value={customerKind}
            onChange={(event) =>
              setCustomerKind(event.target.value as CustomerKind | "")
            }
            options={[
              { value: "individual", label: "Private individual" },
              { value: "organization", label: "Organisation / agency" },
            ]}
            placeholder="Select account kind"
            error={errors.customerKind}
          />
          {customerKind === "organization" ? (
            <Input
              label="Organisation name"
              name="organizationName"
              autoComplete="organization"
              required
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              error={errors.organizationName}
            />
          ) : null}
        </>
      )}

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
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
