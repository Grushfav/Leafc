import type { Metadata } from "next";
import { NewsletterTokenAction } from "@/components/newsletter/NewsletterTokenAction";

export const metadata: Metadata = {
  title: "Confirm newsletter",
  robots: { index: false, follow: false },
};

export default function NewsletterConfirmPage() {
  return (
    <section className="bg-warm-cream py-16 sm:py-20">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-heading">
            Confirm your subscription
          </h1>
          <div className="mt-6">
            <NewsletterTokenAction
              action="confirm"
              workingMessage="Confirming your subscription…"
              missingMessage="This confirmation link is missing or incomplete."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
