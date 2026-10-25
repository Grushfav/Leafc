"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  confirmNewsletter,
  unsubscribeNewsletter,
  type NewsletterError,
} from "@/lib/newsletter";

function TokenAction({
  action,
  missingMessage,
  workingMessage,
}: {
  action: "confirm" | "unsubscribe";
  missingMessage: string;
  workingMessage: string;
}) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<"working" | "ok" | "error">(
    token ? "working" : "error",
  );
  const [message, setMessage] = useState(token ? workingMessage : missingMessage);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const request =
      action === "confirm" ? confirmNewsletter(token) : unsubscribeNewsletter(token);

    request
      .then((result) => {
        if (cancelled) return;
        setStatus("ok");
        setMessage(result.message);
      })
      .catch((error: NewsletterError) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error.error ?? "Unable to complete this request.");
      });

    return () => {
      cancelled = true;
    };
  }, [action, token]);

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
        <Button href="/" variant="accent" size="md">
          Back to home
        </Button>
      ) : null}
    </div>
  );
}

export function NewsletterTokenAction(props: {
  action: "confirm" | "unsubscribe";
  missingMessage: string;
  workingMessage: string;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground" role="status">
          {props.workingMessage}
        </p>
      }
    >
      <TokenAction {...props} />
    </Suspense>
  );
}
