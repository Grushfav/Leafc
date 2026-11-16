import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Set your password to join the LEAF-C workspace.",
};

export default function AcceptInvitePage() {
  return (
    <>
      <PageHero
        badge="Member access"
        title="Accept your invitation"
        description="Choose a password to finish joining the LEAF-C workspace."
        imageSrc="/hero-justice.svg"
        imageClassName="object-cover object-[center_right]"
        actions={
          <Button href="/login" variant="outline" size="md">
            Sign in
          </Button>
        }
      />

      <section className="bg-warm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Set your password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm the details from your invite, then create a password to
              access the workspace.
            </p>
            <div className="mt-6">
              <AcceptInviteForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
