"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { verifyEmail, type AuthError } from "@/lib/auth";

function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<"working" | "ok" | "error">(
    token ? "working" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Confirming your email…"
      : "This verification link is missing or incomplete.",
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    verifyEmail(token)
      .then((result) => {
        if (cancelled) return;
        setStatus("ok");
        setMessage(result.message);
      })
      .catch((error: AuthError) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error.error ?? "Unable to verify this email address.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-5">
      <p
        className={
          status === "error"
            ? "rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
            : "text-sm leading-relaxed text-muted-foreground"
        }
        role={status === "error" ? "alert" : "status"}
      >
        {message}
      </p>
      {status !== "working" ? (
        <Link href="/login">
          <Button variant="accent" size="md" className="w-full">
            Sign in
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

export function VerifyEmailForm() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground" role="status">
          Confirming your email…
        </p>
      }
    >
      <VerifyEmailStatus />
    </Suspense>
  );
}
