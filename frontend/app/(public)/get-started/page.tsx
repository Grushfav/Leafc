import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const steps = [
  {
    title: "Submit inquiry",
    body: "Tell us about your needs, client type, and preferred service division.",
  },
  {
    title: "Initial review",
    body: "Our intake team assesses scope, confidentiality, and jurisdictional fit.",
  },
  {
    title: "Consultation",
    body: "A LEAF-C specialist contacts you to discuss next steps and engagement options.",
  },
];

export default function GetStartedPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <Image
          src="/get_started_background.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal/65" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/45 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-4">
            Get Started
          </Badge>
          <h1 className="hero-heading max-w-3xl text-4xl font-bold sm:text-5xl">
            Begin your engagement with LEAF-C
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Whether you need advisory support, investigative operations, accredited
            training, or integrity screening — submit an inquiry and our team will
            guide you through the next steps.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:gap-12 lg:px-8">
          <div className="lg:col-span-2">
            <div className="section-divider-duo" aria-hidden />
            <h2 className="mt-4 font-heading text-2xl font-bold text-brand-navy">
              What happens next
            </h2>
            <ol className="mt-8 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 font-heading text-sm font-bold text-brand-orange">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-heading">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Card variant="callout" className="mt-10">
              <CardBody>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  All inquiries are handled confidentially. For sensitive matters,
                  note your confidentiality requirements in the message field — our
                  intake team follows strict chain-of-custody protocols from first
                  contact.
                </p>
              </CardBody>
            </Card>

            <p className="mt-6 text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/signup" className="font-medium text-brand-orange hover:underline">
                Create an account
              </Link>
              {" · "}
              Already registered?{" "}
              <Link href="/login" className="font-medium text-brand-orange hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <Card variant="featured" className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Service inquiry form</CardTitle>
              <CardDescription>
                Complete the form below and a LEAF-C representative will respond
                within two business days.
              </CardDescription>
            </CardHeader>
            <CardBody>
              <ServiceInquiryForm />
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  );
}
