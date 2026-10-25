"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { subscribeToNewsletter, type NewsletterError } from "@/lib/newsletter";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldError(undefined);

    if (!consent) {
      setError("Agree to receive emails before subscribing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await subscribeToNewsletter(email);
      setMessage(result.message);
      setEmail("");
      setConsent(false);
    } catch (caught) {
      const apiError = caught as NewsletterError;
      setFieldError(apiError.fields?.email);
      setError(apiError.error ?? "Unable to subscribe right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (message) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground" role="status">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="font-heading text-lg font-bold text-brand-navy">
        Get the updates
      </p>
      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldError}
        className="bg-white text-heading"
      />
      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-brand-orange focus:ring-brand-orange/30"
        />
        <span>
          I agree to receive emails from LEAF-C about programmes, updates, and
          promotions. I can unsubscribe at any time. See the{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand-navy underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full shadow-glow"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
