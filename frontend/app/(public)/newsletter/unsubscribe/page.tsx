import type { Metadata } from "next";
import { NewsletterTokenAction } from "@/components/newsletter/NewsletterTokenAction";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default function NewsletterUnsubscribePage() {
  return (
    <section className="bg-warm-cream py-16 sm:py-20">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-heading">
            Unsubscribe
          </h1>
          <div className="mt-6">
            <NewsletterTokenAction
              action="unsubscribe"
              workingMessage="Updating your subscription…"
              missingMessage="This unsubscribe link is missing or incomplete."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
