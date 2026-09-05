import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <PageHero
        badge="Sign in"
        title="Access your workspace"
        description="Sign in to the LEAF-C portal as a member, customer, or organisation."
        imageSrc="/hero-justice.svg"
        imageClassName="object-cover object-[center_right]"
        actions={
          <Link href="/signup">
            <Button variant="accent" size="md">
              Create an account
            </Button>
          </Link>
        }
      />

      <section className="bg-warm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-heading">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the email and password from your LEAF-C account.
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
