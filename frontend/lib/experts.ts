import { resolveCmsAssetUrl } from "@/lib/cms/api";

export type ExpertProfile = {
  slug: string;
  name: string;
  initials: string;
  title: string;
  portrait: "male" | "female";
  photoSrc?: string;
  email?: string;
  linkedin?: string;
  /** Full biography is shown only when approved for public disclosure. */
  published: boolean;
  summary?: string;
  specialistAreas?: string[];
  experience?: string[];
  qualifications?: string[];
  memberships?: string[];
};

export const EXPERTS: ExpertProfile[] = [
  {
    slug: "adrian-wellington",
    name: "Adrian Wellington",
    initials: "AW",
    title: "Founder and Managing Director",
    portrait: "male",
    photoSrc: "/Adrian_Wellington_Headshot.jpeg",
    published: true,
    summary:
      "Adrian Wellington is an investigations, ethics and compliance professional with experience spanning law enforcement, anti-corruption investigations, corporate investigations, financial crime and professional education. He has developed policy, training and investigative frameworks for public and private sector environments.",
    specialistAreas: [
      "Investigations and financial crime",
      "Ethics and compliance",
      "Anti-corruption inquiries",
      "Corporate investigations",
      "Professional education and training design",
      "Polygraph examination and supervision",
    ],
    experience: [
      "Investigations, ethics and compliance work across public and private sector environments",
      "Development of policy, training and investigative frameworks",
      "Professional education in forensic accounting, fraud and integrity practice",
    ],
    qualifications: [
      "MSc in Forensic Accounting, with Distinction",
      "Trained polygraph examiner and supervisor",
      "ISO 37001 Lead Implementer",
    ],
    memberships: [
      "Certified Fraud Examiner",
      "Accredited Counter Fraud Professional",
    ],
  },
  {
    slug: "shanique-hutchinson",
    name: "Shanique Hutchinson",
    initials: "SH",
    title: "Director, Training",
    portrait: "female",
    published: false,
  },
  {
    slug: "jemar-bailey",
    name: "Jemar Bailey",
    initials: "JB",
    title: "Director, Intelligence and Investigations",
    portrait: "male",
    published: false,
  },
];

export function getPublishedExperts() {
  return EXPERTS.filter((expert) => expert.published);
}

export function getExpert(slug: string) {
  return EXPERTS.find((expert) => expert.slug === slug);
}

function preferList(
  cms: string[] | null | undefined,
  fallback?: string[],
): string[] | undefined {
  if (cms != null) return cms;
  return fallback;
}

export function mergeExperts(
  local: ExpertProfile[],
  remote: Array<{
    slug: string;
    name: string;
    title: string;
    photoUrl?: string | null;
    initials?: string | null;
    portrait?: string | null;
    email?: string | null;
    linkedin?: string | null;
    summary?: string | null;
    specialistAreas?: string[] | null;
    experience?: string[] | null;
    qualifications?: string[] | null;
    memberships?: string[] | null;
    published: boolean;
    sortOrder?: number;
  }>,
): ExpertProfile[] {
  // Empty remote means CMS returned no published experts — do not resurrect hardcoded locals.
  if (!remote.length) return [];
  const localBySlug = new Map(local.map((expert) => [expert.slug, expert]));
  return [...remote]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((expert) => {
      const fallback = localBySlug.get(expert.slug);
      return {
        slug: expert.slug,
        name: expert.name,
        initials: expert.initials || expert.name.slice(0, 2).toUpperCase(),
        title: expert.title,
        portrait: expert.portrait === "female" ? "female" : "male",
        photoSrc:
          resolveCmsAssetUrl(expert.photoUrl) ?? fallback?.photoSrc ?? undefined,
        email: expert.email ?? fallback?.email ?? undefined,
        linkedin: expert.linkedin ?? fallback?.linkedin ?? undefined,
        published: expert.published,
        summary: expert.summary ?? fallback?.summary ?? undefined,
        specialistAreas: preferList(
          expert.specialistAreas,
          fallback?.specialistAreas,
        ),
        experience: preferList(expert.experience, fallback?.experience),
        qualifications: preferList(
          expert.qualifications,
          fallback?.qualifications,
        ),
        memberships: preferList(expert.memberships, fallback?.memberships),
      };
    });
}
