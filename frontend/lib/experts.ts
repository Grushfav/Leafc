export type ExpertProfile = {
  slug: string;
  name: string;
  initials: string;
  title: string;
  portrait: "male" | "female";
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
