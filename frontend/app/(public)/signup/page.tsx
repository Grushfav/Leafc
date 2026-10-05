import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <>
      <PageHero
        badge="Staff signup"
        title="Join the LEAF-C workspace"
        description="Admin, senior agent, and agent accounts require a staff invite code. Clients should request services without creating an account."
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
              Staff signup
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your details and invite code. We will email a confirmation
              link before you can sign in.
            </p>
            <div className="mt-6">
              <SignupForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
