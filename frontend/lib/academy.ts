export type AcademyCourse = {
  id?: number;
  code: string;
  title: string;
  description?: string | null;
  format: string;
  duration: string;
  dates: string;
  level: string;
  published?: boolean;
  sortOrder?: number;
};

export const FALLBACK_ACADEMY_COURSES: AcademyCourse[] = [
  {
    code: "LCA-101",
    title: "Financial Crime Investigations",
    format: "In-person workshop",
    duration: "5 days",
    dates: "12–16 Oct 2026",
    level: "Foundation",
  },
  {
    code: "LCA-204",
    title: "Fraud and Corruption Investigations",
    format: "Virtual training",
    duration: "3 days",
    dates: "4–6 Nov 2026",
    level: "Intermediate",
  },
  {
    code: "LCA-310",
    title: "Cybercrime and Digital Evidence",
    format: "In-person workshop",
    duration: "4 days",
    dates: "18–21 Nov 2026",
    level: "Intermediate",
  },
  {
    code: "LCA-415",
    title: "Interviewing and Interrogation",
    format: "Executive briefing",
    duration: "2 days",
    dates: "3–4 Dec 2026",
    level: "Advanced",
  },
];
