import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  return (
    <>
      <PageHero
        badge="Staff access"
        title="Membership by invitation"
        description="LEAF-C workspace accounts are created by invitation only. Ask a LEAF-C administrator to send you an invite."
        imageSrc="/hero-justice.svg"
        imageClassName="object-cover object-[center_right]"
        actions={
          <Button href="/login" variant="secondary" size="md">
            Already have an account
          </Button>
        }
      />

      <section className="bg-warm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Membership by invitation
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Public signup is closed. If you are joining the LEAF-C team, ask
              an administrator to email you an invitation link. When you receive
              it, open the link to set your password and access the workspace.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Already invited? Check your email for the accept link, or{" "}
              <Link
                href="/login"
                className="font-medium text-brand-orange hover:underline"
              >
                sign in
              </Link>{" "}
              if you already have an account.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Looking for LEAF-C services instead?{" "}
              <Link
                href="/get-started"
                className="font-medium text-brand-orange hover:underline"
              >
                Get started
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/login" variant="accent" size="md" className="w-full sm:w-auto">
                Sign in
              </Button>
              <Button
                href="/get-started"
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
