"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  IconBriefcase,
  IconGraduationCap,
  IconPulse,
  IconSearch,
} from "@/components/icons/MonoIcons";
import { cn } from "@/lib/utils";
import {
  CLIENT_TYPE_OPTIONS,
  submitServiceInquiry,
  type ClientType,
  type ServiceInterest,
} from "@/lib/api";

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Details" },
  { id: 3, label: "Submit" },
] as const;

const SERVICE_OPTIONS: {
  value: ServiceInterest;
  label: string;
  description: string;
  Icon: typeof IconBriefcase;
}[] = [
  {
    value: "consultancy",
    label: "Consultation",
    description: "Advisory, compliance & governance",
    Icon: IconBriefcase,
  },
  {
    value: "training",
    label: "Training",
    description: "Accredited programmes & certification",
    Icon: IconGraduationCap,
  },
  {
    value: "polygraph",
    label: "Polygraph testing",
    description: "Integrity & pre-employment screening",
    Icon: IconPulse,
  },
  {
    value: "operations",
    label: "Investigations",
    description: "Field ops, intelligence & case work",
    Icon: IconSearch,
  },
];

type FormFields = {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  clientType: ClientType | "";
  serviceInterest: ServiceInterest | "";
  message: string;
  consent: boolean;
};

const initialFields: FormFields = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  clientType: "",
  serviceInterest: "",
  message: "",
  consent: false,
};

type ServiceInquiryFormProps = {
  id?: string;
  className?: string;
  compact?: boolean;
};

function FormProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-brand-orange">
            Step {currentStep} of {totalSteps}
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-heading">
            {STEPS[currentStep - 1]?.label}
          </p>
        </div>
        <p className="font-heading text-3xl font-extrabold tabular-nums text-brand-orange drop-shadow-sm">
          {progress}
          <span className="text-lg text-brand-orange/70">%</span>
        </p>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-warm-cream ring-1 ring-brand-orange/20">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange-light shadow-glow transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Form progress: ${progress}%`}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>

      <ol className="mt-4 grid grid-cols-3 gap-2">
        {STEPS.map((step) => {
          const isComplete = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-300",
                isActive &&
                  "border-brand-orange bg-brand-orange/10 shadow-glow ring-2 ring-brand-orange/30",
                isComplete &&
                  "border-brand-orange/40 bg-brand-orange/5 text-brand-navy",
                !isActive &&
                  !isComplete &&
                  "border-border-subtle bg-warm-white text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold transition-colors",
                  isActive && "bg-brand-orange text-white shadow-sm",
                  isComplete && "bg-brand-orange/20 text-brand-orange",
                  !isActive && !isComplete && "bg-warm-cream text-muted-foreground",
                )}
                aria-hidden
              >
                {isComplete ? "✓" : step.id}
              </span>
              <span
                className={cn(
                  "hidden font-heading text-xs font-semibold sm:inline",
                  isActive && "text-heading",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ServiceInquiryForm({
  id,
  className,
  compact = false,
}: ServiceInquiryFormProps) {
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>(
    {},
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  function updateField<K extends keyof FormFields>(
    key: K,
    value: FormFields[K],
  ) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSubmitError(null);
  }

  function validateStep(targetStep: number): Partial<Record<keyof FormFields, string>> {
    const next: Partial<Record<keyof FormFields, string>> = {};

    if (targetStep >= 1 && !fields.serviceInterest) {
      next.serviceInterest = "Select a service to continue.";
    }

    if (targetStep >= 2) {
      if (!fields.fullName.trim()) next.fullName = "Full name is required.";
      if (!fields.email.trim()) {
        next.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
        next.email = "Enter a valid email address.";
      }
      if (!fields.clientType) {
        next.clientType = "Select who you are enquiring on behalf of.";
      }
    }

    if (targetStep >= 3) {
      if (!fields.message.trim()) {
        next.message = "Please describe your needs.";
      } else if (fields.message.trim().length < 20) {
        next.message = "Please provide at least 20 characters.";
      }
      if (!fields.consent) {
        next.consent = "You must agree before submitting.";
      }
    }

    return next;
  }

  function goToStep(nextStep: number) {
    const validationErrors = validateStep(step);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setStep(nextStep);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateStep(3);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitServiceInquiry({
        fullName: fields.fullName.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim() || undefined,
        organization: fields.organization.trim() || undefined,
        clientType: fields.clientType as ClientType,
        serviceInterest: fields.serviceInterest as ServiceInterest,
        message: fields.message.trim(),
      });

      setReferenceNumber(response.referenceNumber);
      setFields(initialFields);
      setErrors({});
      setStep(1);
    } catch (error) {
      const apiError = error as { error?: string; fields?: Record<string, string> };
      if (apiError.fields) {
        setErrors(apiError.fields as Partial<Record<keyof FormFields, string>>);
      }
      setSubmitError(
        apiError.error ??
          "Unable to submit your inquiry right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (referenceNumber) {
    return (
      <div id={id} className={className} role="status" aria-live="polite">
        <div className="rounded-2xl border border-brand-orange/25 bg-gradient-to-br from-warm-cream to-surface p-8 text-center shadow-glow">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange"
            aria-hidden
          >
            ✓
          </span>
          <h3 className="mt-4 font-heading text-xl font-bold text-heading">
            Inquiry received
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Thank you for your interest in LEAF-C. Our team will review your
            request and respond within two business days.
          </p>
          <p className="mt-4 font-mono text-sm font-semibold text-brand-navy">
            Reference: {referenceNumber}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => {
              setReferenceNumber(null);
              setStep(1);
            }}
          >
            Submit another inquiry
          </Button>
        </div>
      </div>
    );
  }

  const selectedService = SERVICE_OPTIONS.find(
    (option) => option.value === fields.serviceInterest,
  );

  return (
    <form id={id} onSubmit={handleSubmit} className={className} noValidate>
      <FormProgressBar currentStep={step} totalSteps={STEPS.length} />

      {step === 1 && (
        <div className="animate-fade-in-up">
          <h3 className="font-heading text-base font-semibold text-heading">
            Which service do you need?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the division that best matches your request.
          </p>
          <div
            className={cn(
              "mt-5 grid gap-3",
              compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
            )}
            role="radiogroup"
            aria-label="Service selection"
          >
            {SERVICE_OPTIONS.map((option) => {
              const isSelected = fields.serviceInterest === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => updateField("serviceInterest", option.value)}
                  className={cn(
                    "group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    isSelected
                      ? "border-brand-orange bg-gradient-to-br from-brand-orange/15 to-brand-gold/10 shadow-glow ring-2 ring-brand-orange/40"
                      : "border-border-subtle bg-warm-white hover:border-brand-orange/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors",
                      isSelected
                        ? "border-brand-orange/30 bg-brand-orange text-white"
                        : "border-brand-navy/15 bg-warm-cream text-brand-navy group-hover:border-brand-orange/30",
                    )}
                    aria-hidden
                  >
                    <option.Icon className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-heading font-semibold text-heading">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {errors.serviceInterest && (
            <p className="mt-3 text-xs text-error" role="alert">
              {errors.serviceInterest}
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up">
          {selectedService && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-orange/25 bg-brand-orange/5 px-4 py-3">
              <selectedService.Icon className="h-5 w-5 text-brand-orange" aria-hidden />
              <p className="text-sm">
                <span className="text-muted-foreground">Selected: </span>
                <span className="font-semibold text-heading">{selectedService.label}</span>
              </p>
            </div>
          )}
          <div
            className={cn(
              "grid gap-4",
              compact ? "grid-cols-1" : "gap-5 sm:grid-cols-2",
            )}
          >
            <Input
              label="Full name"
              name="fullName"
              autoComplete="name"
              required
              value={fields.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              error={errors.fullName}
              className={compact ? undefined : "sm:col-span-1"}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={fields.email}
              onChange={(event) => updateField("email", event.target.value)}
              error={errors.email}
              className={compact ? undefined : "sm:col-span-1"}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Optional"
              value={fields.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              error={errors.phone}
              className={compact ? undefined : "sm:col-span-1"}
            />
            <Input
              label="Organisation"
              name="organization"
              autoComplete="organization"
              placeholder="Optional"
              value={fields.organization}
              onChange={(event) => updateField("organization", event.target.value)}
              error={errors.organization}
              className={compact ? undefined : "sm:col-span-1"}
            />
            <Select
              label="I am enquiring as"
              name="clientType"
              required
              value={fields.clientType}
              onChange={(event) =>
                updateField("clientType", event.target.value as ClientType | "")
              }
              options={[...CLIENT_TYPE_OPTIONS]}
              placeholder="Select client type"
              error={errors.clientType}
              className={compact ? undefined : "sm:col-span-2"}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in-up">
          {selectedService && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-orange/25 bg-brand-orange/5 px-4 py-3">
              <selectedService.Icon className="h-5 w-5 text-brand-orange" aria-hidden />
              <p className="text-sm">
                <span className="text-muted-foreground">Requesting: </span>
                <span className="font-semibold text-heading">{selectedService.label}</span>
                <span className="text-muted-foreground"> · {fields.fullName || "Your details"}</span>
              </p>
            </div>
          )}
          <Textarea
            label="How can we help?"
            name="message"
            required
            rows={compact ? 4 : 5}
            placeholder="Briefly describe your mandate, timeline, and any confidentiality requirements..."
            value={fields.message}
            onChange={(event) => updateField("message", event.target.value)}
            error={errors.message}
          />

          <label className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="consent"
              checked={fields.consent}
              onChange={(event) => updateField("consent", event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-brand-orange focus:ring-brand-orange/30"
            />
            <span>
              I agree that LEAF-C may contact me about this inquiry and handle my
              information in accordance with its data protection standards.
            </span>
          </label>
          {errors.consent && (
            <p className="mt-2 text-xs text-error" role="alert">
              {errors.consent}
            </p>
          )}

          {submitError && (
            <p
              className="mt-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {submitError}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setStep((current) => current - 1)}
          >
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button
            type="button"
            variant="accent"
            size="lg"
            className="min-w-[140px] flex-1 sm:flex-none"
            onClick={() => goToStep(step + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="min-w-[180px] flex-1 sm:flex-none shadow-glow"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Start your engagement"}
          </Button>
        )}
      </div>
    </form>
  );
}
