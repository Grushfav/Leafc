import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm your LEAF-C member email address.",
};

export default function VerifyEmailPage() {
  return (
    <>
      <PageHero
        badge="Member access"
        title="Verify your email"
        description="Open the confirmation link we sent to finish creating your LEAF-C member account."
        imageSrc="/hero-justice.svg"
        imageClassName="object-cover object-[center_right]"
        actions={
          <Link href="/login">
            <Button variant="outline" size="md">
              Sign in
            </Button>
          </Link>
        }
      />

      <section className="bg-warm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Email confirmation
            </h2>
            <div className="mt-6">
              <VerifyEmailForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
