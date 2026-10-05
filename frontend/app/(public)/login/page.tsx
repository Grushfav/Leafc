import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <PageHero
        badge="Staff sign in"
        title="LEAF-C workspace"
        description="Admins and agents sign in here. Clients do not need an account — use Get Started to request services."
        imageSrc="/hero-justice.svg"
        imageClassName="object-cover object-[center_right]"
        actions={
          <Button href="/get-started" variant="accent" size="md">
            Request services
          </Button>
        }
      />

      <section className="bg-warm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Staff sign in
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your LEAF-C member email and password.
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              New staff member?{" "}
              <Link href="/signup" className="font-medium text-brand-orange hover:underline">
                Create an account with an invite code
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
