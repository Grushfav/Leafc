import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <>
      <PageHero
        badge="Create account"
        title="Join LEAF-C"
        description="Customers and organisations can open an account to request services. LEAF-C members (admin, senior agent, and agent) sign up with a staff invite code."
        imageSrc="/hero-justice.svg"
        imageClassName="object-cover object-[center_right]"
        actions={
          <Link href="/login">
            <Button variant="secondary" size="md">
              Already have an account
            </Button>
          </Link>
        }
      />

      <section className="bg-warm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Sign up
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose customer/organisation or LEAF-C member, then complete your
              details.
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
