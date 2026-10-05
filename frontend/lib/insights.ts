export const INSIGHT_CATEGORIES = [
  { id: "articles-commentary", label: "Articles and commentary" },
  { id: "financial-crime", label: "Financial-crime updates" },
  { id: "fraud-corruption", label: "Fraud and corruption alerts" },
  { id: "cybercrime", label: "Cybercrime guidance" },
  { id: "regulatory", label: "Regulatory updates" },
  { id: "training", label: "Training announcements" },
  { id: "case-studies", label: "Case studies" },
  { id: "checklists", label: "Checklists and guides" },
] as const;

export type InsightCategoryId = (typeof INSIGHT_CATEGORIES)[number]["id"];

export type InsightSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type InsightArticle = {
  slug: string;
  title: string;
  description: string;
  category: InsightCategoryId;
  date: string;
  isoDate: string;
  readMinutes: number;
  relatedHref: string;
  relatedLabel: string;
  sections: InsightSection[];
  takeaways: string[];
};

export const INSIGHTS: InsightArticle[] = [
  {
    slug: "five-warning-signs-of-procurement-fraud",
    title: "Five Warning Signs of Procurement Fraud",
    description:
      "How boards, finance leads, and investigators can spot bid manipulation, vendor capture, and invoice fraud before losses compound.",
    category: "fraud-corruption",
    date: "19 September 2026",
    isoDate: "2026-09-19",
    readMinutes: 8,
    relatedHref: "/consultancy",
    relatedLabel: "Consultancy",
    sections: [
      {
        heading: "Why procurement is a frequent target",
        paragraphs: [
          "Procurement sits where money, urgency, and discretion meet. In public bodies, utilities, construction, hospitality, and large private groups across the Caribbean, a small number of officers can commit an organisation to significant spend. That concentration of authority is useful for operations — and attractive to people who intend to divert value.",
          "Most schemes do not begin as a spectacular theft. They start as a pattern: a favoured vendor, a rushed award, an invoice that almost matches the purchase order. The practical question for leadership is not whether fraud exists in the market. It is whether your controls would surface it early enough to act.",
        ],
      },
      {
        heading: "1. Bid rotation and unusually tidy competition",
        paragraphs: [
          "On paper, competitive tendering is happening. In practice, the same three or four suppliers take turns winning, losing bids are token, and prices sit just inside the budget. Losing bidders may share ownership, addresses, phone numbers, or directors with the winner.",
          "Ask who actually prepared the losing submissions. If the same formatting, language, or pricing structure appears across supposedly independent bids, treat that as a fact to investigate — not a coincidence to file.",
        ],
        bullets: [
          "The same vendors cycle through first place with little genuine price tension.",
          "Losing bids arrive late, incomplete, or at round numbers that never threaten the winner.",
          "Corporate records show overlapping directors, beneficial owners, or registered addresses.",
        ],
      },
      {
        heading: "2. One vendor quietly capturing a category of spend",
        paragraphs: [
          "Concentration is not automatically fraud. Specialist work, island logistics, and small markets can justify a short supplier list. The warning sign is unexplained lock-in: a vendor that expands from one contract into adjacent categories without a fresh contest, or whose share of spend grows while service quality stays flat.",
          "Compare vendor concentration against the original justification. If the business case was “only qualified local installer,” check whether other qualified firms were invited later — and whether anyone documented why they were not.",
        ],
      },
      {
        heading: "3. Invoice and purchase-order mismatches",
        paragraphs: [
          "Classic invoice fraud relies on volume and fatigue. Duplicate invoices with small numbering changes, goods received notes that nobody can match to a delivery, and variations that inflate the original award are common. Split purchases just under approval thresholds are another tell: five invoices of J$990,000 instead of one of J$4.95 million.",
          "Finance teams should be able to reconstruct the trail from requisition to payment. If they cannot, the gap is itself evidence of control failure — whether or not a named suspect has emerged.",
        ],
        bullets: [
          "Repeated round-number invoices, especially just below a delegated limit.",
          "Descriptions that do not match the contracted scope, or “miscellaneous” lines with no backup.",
          "The same approver raising, receiving, and paying for the work.",
        ],
      },
      {
        heading: "4. Conflicts that never appear on a declaration form",
        paragraphs: [
          "Related-party awards are among the most damaging procurement failures because they poison both the ledger and staff confidence. The relationship may be a spouse’s company, a former colleague, a church or political network, or a beneficial owner hidden behind a recently incorporated vehicle.",
          "Declarations of interest only work if they are updated, checked against company registries, and treated as a living control. A signed form from three years ago does not cover a vendor incorporated last month.",
        ],
      },
      {
        heading: "5. Process exceptions that become the process",
        paragraphs: [
          "Emergency awards, sole-source justifications, and “board already approved in principle” notes have a place. They become a warning sign when they are the default path for a category of spend. Once staff learn that the competitive process can be skipped, the incentive to keep skipping it grows.",
          "Review a sample of exceptions from the last 12–24 months. If the same officer, vendor, and justification language recur, you are looking at a system — not a series of one-off emergencies.",
        ],
      },
      {
        heading: "What to do when a pattern appears",
        paragraphs: [
          "Preserve the record before you confront anyone. Export vendor master data, tender files, emails, and payment runs. Restrict access only as far as needed to stop further loss — a noisy lockout can destroy evidence and alert collusive suppliers.",
          "A focused fact-find can often answer, within days, whether you are looking at weak process, honest error, or a scheme. That scoping work is cheaper than a full investigation launched on rumour, and it is the difference between a defensible report and an internal argument.",
        ],
      },
    ],
    takeaways: [
      "Look for patterns across bids, vendors, and invoices — not a single dramatic transaction.",
      "Exceptions, related parties, and threshold-splitting are high-yield places to start.",
      "Preserve records before interviews; a quiet scoping review is usually the first professional step.",
    ],
  },
  {
    slug: "when-an-organization-should-consider-a-polygraph-examination",
    title: "When an Organization Should Consider a Polygraph Examination",
    description:
      "A practical brief on when polygraph testing can support hiring, specific-issue inquiries, and integrity programmes — and when it should not.",
    category: "articles-commentary",
    date: "19 September 2026",
    isoDate: "2026-09-19",
    readMinutes: 7,
    relatedHref: "/polygraph",
    relatedLabel: "Polygraph & Integrity",
    sections: [
      {
        heading: "Treat the polygraph as a specialist tool, not a shortcut",
        paragraphs: [
          "A polygraph examination is a structured interview supported by psychophysiological recording. Used well, it can narrow a specific issue, support pre-employment screening for high-trust roles, and form part of a periodic integrity programme. Used poorly, it becomes a substitute for investigation, a pressure tactic, or a process that will not survive later legal or industrial scrutiny.",
          "LEAF-C’s position is straightforward: the instrument does not replace evidence. It can, in the right case, help an organisation decide where to look next and how much confidence to place in an account.",
        ],
      },
      {
        heading: "Pre-employment screening for high-trust roles",
        paragraphs: [
          "Consider screening when the role has unsupervised access to cash, controlled goods, investigative files, IT administration, or vulnerable people. Financial institutions, security contractors, public bodies, and firms handling client assets are typical settings.",
          "The examination should sit inside a wider background-check process: identity, employment, qualifications, and open-source review. A polygraph is not a cheaper alternative to those steps. It is an additional integrity measure for posts where a single dishonest hire creates outsized risk.",
        ],
      },
      {
        heading: "Specific-issue examinations after an incident",
        paragraphs: [
          "The strongest investigative use is a defined question: missing cash from a counted float, an unexplained systems access event, a disputed handling of exhibits, or a narrow allegation against a small group of people who had opportunity.",
          "The issue must be specific enough to form testable questions. “Are you loyal to the company?” is not a useful question. “Did you remove cash from the vault on 12 August?” is. If the facts are still too broad, finish the documentary and digital work first.",
        ],
      },
      {
        heading: "Periodic integrity testing",
        paragraphs: [
          "Some organisations require periodic examinations for personnel in cash, armoury, intelligence, or other high-trust posts. The value is deterrent as much as diagnostic: staff know that access is paired with accountability.",
          "Periodic programmes only work if they are written into policy, applied consistently, and conducted by examiners who follow a documented protocol. Ad hoc testing of people who have fallen out of favour is not a programme. It is a grievance waiting to happen.",
        ],
      },
      {
        heading: "When you should not reach for the polygraph",
        paragraphs: [
          "Do not use an examination to paper over a missing investigation, to pressure a confession, or to decide a workplace dispute that is really about performance or industrial relations. Do not test an entire department because leadership is angry and has no theory of the case.",
          "Medical, developmental, and some psychological conditions can also make a person a poor candidate. A professional examiner will screen for suitability rather than force a session that cannot be interpreted.",
        ],
        bullets: [
          "There is no defined issue, timeframe, or group with opportunity.",
          "Core records, CCTV, or access logs have not been preserved or reviewed.",
          "The organisation cannot explain, in writing, the purpose, consent, and use of results.",
        ],
      },
      {
        heading: "Consent, policy, and how results should be used",
        paragraphs: [
          "Examinations should be voluntary, preceded by a rights and process briefing, and documented. Results belong in a confidential file with a narrow distribution list. They should inform — not automatically determine — employment or disciplinary decisions.",
          "If you may later need the work to stand up in a hearing or in court, instruct examiners who can describe their protocol, chain of custody, and limitations in plain language. That is part of what you are paying for.",
        ],
      },
    ],
    takeaways: [
      "Use polygraph testing for defined high-trust hiring, specific issues, or written integrity programmes.",
      "Do not use it as a substitute for records review or as a pressure tactic.",
      "Policy, consent, examiner credentials, and a narrow use of results are what make the process defensible.",
    ],
  },
  {
    slug: "preserving-digital-evidence-after-an-incident",
    title: "Preserving Digital Evidence After an Incident",
    description:
      "First-hour actions that keep phones, laptops, CCTV, and cloud accounts usable as evidence after fraud, intrusion, or workplace misconduct.",
    category: "cybercrime",
    date: "19 September 2026",
    isoDate: "2026-09-19",
    readMinutes: 8,
    relatedHref: "/operations",
    relatedLabel: "Investigations",
    sections: [
      {
        heading: "The first hour decides what you can prove later",
        paragraphs: [
          "After a suspected fraud, data incident, or internal allegation, well-meaning staff often do the most damaging thing: they log in “just to check,” run antivirus, delete “junk,” or power equipment off and on. Each of those steps can alter timestamps, overwrite volatile data, or destroy a forensic image’s integrity.",
          "Your job in the first hour is not to solve the case. It is to stop further harm and freeze the scene in a way a specialist can later explain.",
        ],
      },
      {
        heading: "Identify what might hold the story",
        paragraphs: [
          "Think in systems, not in a single laptop. Relevant material may sit on a phone, a desktop, a shared drive, email, messaging apps, CCTV, access-control logs, payment terminals, cloud admin consoles, and the router that logged the session.",
          "Write a short inventory: device, owner, location, whether it is powered, and who last touched it. That list becomes the spine of your legal hold and of any later specialist instruction.",
        ],
        bullets: [
          "Endpoints: laptops, phones, USBs, workstations used by the people with opportunity.",
          "Accounts: email, banking, cloud storage, admin panels, and password managers.",
          "Environment: CCTV, badge logs, Wi-Fi logs, and server or firewall records.",
        ],
      },
      {
        heading: "What to do — and what not to do — with devices",
        paragraphs: [
          "If a computer is on and the suspected activity is live, photograph the screen, isolate it from the network if you can do so without destroying evidence, and call a specialist before you shut it down. If a device is off, leave it off. Do not attempt password guesses on a locked phone.",
          "Do not run cleaner tools, “optimise disk,” restore from backup onto the same machine, or let IT reimage a laptop to get the user working again until a copy of the original has been taken. Business continuity matters; it should use a replacement device, not the exhibit.",
        ],
      },
      {
        heading: "Legal hold and cloud accounts",
        paragraphs: [
          "Issue a written hold to anyone who may hold relevant mail, chats, or files: do not delete, do not tidy folders, do not auto-archive. Suspend — do not wipe — accounts that may be involved. Preserve mailbox and drive data at the administrator level rather than asking the subject to forward “anything relevant.”",
          "For banking and vendor portals, export available logs and statements immediately. Many platforms rotate logs in days, not months. Waiting for a Monday morning committee is how evidence expires.",
        ],
      },
      {
        heading: "Chain of custody in plain terms",
        paragraphs: [
          "Every exhibit needs a story: who collected it, when, from where, and where it went next. Use sealed bags or an evidence locker, restrict the number of handlers, and record transfers. Photographs of serial numbers and the scene help later identification.",
          "If law enforcement may become involved, this paperwork is not bureaucracy. It is what allows a court or a disciplinary panel to trust that the laptop in the report is the laptop from the office.",
        ],
      },
      {
        heading: "When to bring in digital forensics",
        paragraphs: [
          "Call specialists when the potential loss is material, when you may need findings for a regulator, insurer, or court, or when staff lack a documented forensic process. A scoped engagement can image priority devices, extract cloud data, and give you a first briefing without boiling the ocean.",
          "Tell the specialist what you already touched. An honest account of “IT logged in to check” is far more useful than a reconstructed narrative that pretends nobody did.",
        ],
      },
    ],
    takeaways: [
      "Inventory devices and accounts, then stop casual login and reimaging.",
      "Leave powered-off devices off; isolate live systems and photograph screens.",
      "Issue a legal hold immediately — cloud and payment logs disappear faster than people expect.",
    ],
  },
  {
    slug: "building-an-effective-speak-up-programme",
    title: "Building an Effective Speak Up Programme",
    description:
      "How to design a whistleblowing channel that staff will actually use: confidential intake, anti-retaliation, case handling, and board reporting.",
    category: "articles-commentary",
    date: "19 September 2026",
    isoDate: "2026-09-19",
    readMinutes: 8,
    relatedHref: "/consultancy",
    relatedLabel: "Consultancy",
    sections: [
      {
        heading: "A hotline is not a programme",
        paragraphs: [
          "Many organisations can point to an email address or a poster. Fewer can show that staff trust it, that reports are triaged independently of the alleged wrongdoer, and that the board sees patterns rather than anecdotes. A Speak Up programme is the system around the channel: policy, intake, investigation protocol, protection against retaliation, and feedback.",
          "In Caribbean workplaces, where professional networks are dense and reputations travel quickly, confidentiality is not a slogan. It is the condition for receiving anything useful.",
        ],
      },
      {
        heading: "Make reporting possible in more than one way",
        paragraphs: [
          "People report in the mode they trust. Some will use a form. Others will call. A few will only speak to a named person outside the line of command. Offer at least two paths, including one that does not require the reporter to walk into HR or Internal Audit in person.",
          "Anonymous reporting should be available. It is messier to investigate. It is also how you hear about problems that would otherwise stay inside a team. Design the intake so a reporter can add information later without revealing identity if they choose not to.",
        ],
      },
      {
        heading: "Independence at intake",
        paragraphs: [
          "The person who first reads a report should not report to the subject of the allegation. If the concern is about a CEO, CFO, or board member, the path must skip the usual management chain and go to a designated independent recipient — often the audit committee chair or an external intake partner.",
          "Document that routing in the policy before you need it. Writing the exception during a live crisis is how reports leak and how the organisation looks captured.",
        ],
      },
      {
        heading: "Anti-retaliation has to be operational",
        paragraphs: [
          "A paragraph forbidding retaliation is necessary and insufficient. Managers need to know that sudden performance scores, roster changes, isolation, and “restructuring” of a reporter’s role will be reviewed. Reporters need a named contact if their situation deteriorates.",
          "Investigate retaliation as a separate issue even if the original allegation is not substantiated. Staff watch what happens to the last person who spoke up more closely than they read the policy.",
        ],
      },
      {
        heading: "Case management and the audit trail",
        paragraphs: [
          "Every report should receive a reference number, an initial risk rating, a decision on whether to investigate, and a recorded outcome. Trivial HR gripes should be redirected without pretending they were never received. Serious fraud, safety, and integrity issues should follow a written investigation protocol.",
          "Keep a register that the board or audit committee can review in summary: volume, themes, time to close, substantiation rate, and any retaliation claims. Identifying details stay restricted. Patterns belong in the governance conversation.",
        ],
        bullets: [
          "Acknowledge receipt where the reporter can be reached, even if you cannot discuss findings.",
          "Separate intake, investigation, and employment decision-makers where the size of the organisation allows.",
          "Retain records in line with legal hold and data-protection duties — not in a personal inbox.",
        ],
      },
      {
        heading: "Close the loop without gossip",
        paragraphs: [
          "Reporters who hear nothing assume the organisation buried the issue. You can usually say that the matter was reviewed, that action was taken where appropriate, and that retaliation is prohibited — without disclosing another person’s confidential employment outcome.",
          "Publicise the programme with realistic examples: procurement irregularity, safety bypass, data misuse. Do not only advertise it during onboarding. Remind staff after incidents in the sector, when people are already thinking about risk.",
        ],
      },
    ],
    takeaways: [
      "Offer more than one reporting path, including a route that bypasses implicated managers.",
      "Treat retaliation as its own case, with operational checks rather than a policy sentence.",
      "Give the board themes and cycle times, not gossip — and keep the case file out of personal inboxes.",
    ],
  },
  {
    slug: "what-a-strong-background-check-should-cover",
    title: "What a Strong Background Check Should Cover",
    description:
      "Identity, employment, qualifications, criminal records, sanctions, and adverse media — and why a police certificate alone is not due diligence.",
    category: "articles-commentary",
    date: "19 September 2026",
    isoDate: "2026-09-19",
    readMinutes: 7,
    relatedHref: "/operations",
    relatedLabel: "Investigations",
    sections: [
      {
        heading: "A police certificate is a starting point, not a file",
        paragraphs: [
          "Many Caribbean employers still treat a recent police certificate as the background check. It answers one question: whether a particular jurisdiction has a disclosable criminal record under its rules. It does not confirm that the person is who they say they are, that the degree is real, that the last employer would rehire them, or that they appear on a sanctions or politically exposed list.",
          "For cashiers that may be proportionate. For people who will hold payment authority, investigative powers, root IT access, or fiduciary responsibility, it is not.",
        ],
      },
      {
        heading: "Identity and right to work",
        paragraphs: [
          "Match the candidate to government identity documents, note previous names, and flag documents that look altered or inconsistent with the CV. Where the role requires it, confirm the right to work and any professional licence that the job depends on.",
          "Identity errors are not always fraud. They are always a reason to pause before you grant system access.",
        ],
      },
      {
        heading: "Employment and qualifications",
        paragraphs: [
          "Verify dates, titles, and eligibility for rehire with previous employers using a documented process. Candidates frequently inflate seniority or close gaps with a consulting vehicle that never had clients. For degrees and professional certifications, check with the issuing body — not a laminated copy in a folder.",
          "Where a referee is a personal mobile number and not a switchboard, treat that as a lead to verify, not as confirmation.",
        ],
      },
      {
        heading: "Criminal, civil, and regulatory records",
        paragraphs: [
          "Criminal checks should cover jurisdictions where the person has lived and worked, within the law of those places and with the candidate’s consent. Also look for civil judgments, bankruptcy, and regulatory findings that speak to honesty or competence — a dismissed criminal matter is not the same as a clean professional history.",
          "Local knowledge matters. A search that only covers one island when the CV shows three years in another territory is incomplete by design.",
        ],
      },
      {
        heading: "Sanctions, PEP status, and adverse media",
        paragraphs: [
          "For roles in finance, procurement, government contracting, and international NGOs, screen against sanctions lists and for politically exposed person status. Adverse media is not a verdict. It is a prompt to ask better questions: is this the same person, is the reporting sourced, and does the issue relate to the role?",
          "Record the sources you used and the date. Screening is perishable. A check from 2019 does not cover a 2025 appointment to a state board.",
        ],
      },
      {
        heading: "Conflicts, social footprint, and proportionality",
        paragraphs: [
          "Ask about related companies, family in the supply chain, and outside employment. Open-source review of a public social footprint can reveal undisclosed business activity or hostility to the duties of the role. It should be scoped, consistent, and free of fishing through private accounts.",
          "Data-protection law, including Jamaica’s Data Protection Act, expects purpose limitation and fairness. Check what the role requires, tell the candidate what you will do, obtain consent where required, and retain only what you need. A stronger check is a more complete check — not a more intrusive one.",
        ],
      },
    ],
    takeaways: [
      "Build checks to the risk of the role: identity, work history, qualifications, then criminal and integrity screens.",
      "Cover the jurisdictions in the CV, not only the island where you are hiring.",
      "Consent, purpose limitation, and a written methodology are part of quality — they are not optional extras.",
    ],
  },
  {
    slug: "financial-crime-risks-caribbean-businesses-should-monitor",
    title: "Financial Crime Risks Caribbean Businesses Should Monitor",
    description:
      "Procurement corruption, cyber-enabled fraud, trade-based laundering, and cash-intensive sectors — the regional risks leadership teams should be watching.",
    category: "financial-crime",
    date: "19 September 2026",
    isoDate: "2026-09-19",
    readMinutes: 9,
    relatedHref: "/consultancy",
    relatedLabel: "Consultancy",
    sections: [
      {
        heading: "Regional conditions shape the risk, not only the typology",
        paragraphs: [
          "Caribbean businesses operate in small professional markets, with high import dependence, significant tourism and remittance flows, and correspondent banking relationships that can be withdrawn if controls look weak. Those conditions do not make every company a target. They do mean that a single procurement scandal, ransomware event, or laundering allegation can have outsized effects on banking, insurance, and reputation.",
          "Boards should watch a short list of live risks and ask whether controls match how the business actually makes and moves money — not how the policy manual describes it.",
        ],
      },
      {
        heading: "Procurement and public-facing contracts",
        paragraphs: [
          "Government, utility, construction, and large private-group tenders remain a primary corruption and fraud surface. Bid rigging, related-party vendors, and variation-led inflation of awards appear across sectors. Companies that sell to the state also inherit ABC (anti-bribery and corruption) expectations from international partners and development financiers.",
          "If your growth plan depends on public contracts, treat integrity due diligence on agents, joint-venture partners, and politically exposed counterparties as part of business development — not as a legal afterthought.",
        ],
      },
      {
        heading: "Cyber-enabled fraud and payment diversion",
        paragraphs: [
          "Business email compromise, fake vendor-bank-detail changes, and payroll redirection are now routine regional losses. The technology is ordinary email and WhatsApp. The control failure is usually human: a change to payment instructions accepted without a second, out-of-band confirmation.",
          "Train accounts payable as if they are a control function, because they are. A callback to a known number on file is cheaper than recovering a wire that has already left a correspondent chain.",
        ],
      },
      {
        heading: "Trade, logistics, and cash-intensive activity",
        paragraphs: [
          "Over- and under-invoicing, phantom shipments, and misdescribed goods can move value across borders in ways that look like ordinary import business. Tourism, gaming, fuel, and wholesale cash operations create placement opportunities that criminals will rent if your CDD is theatrical.",
          "Ask whether your customer and supplier files would satisfy a correspondent bank’s questions. If the honest answer is no, the banking relationship is the asset you are putting at risk.",
        ],
      },
      {
        heading: "Internal fraud: payroll, inventory, and refunds",
        paragraphs: [
          "Ghost workers, inflated overtime, inventory shrinkage, and collusive refunds remain common because they sit in processes managers trust. In family and closely held firms, segregation of duties is often informal. That informality is efficient until one person controls hiring, timekeeping, and payment.",
          "Periodic data analytics — duplicate bank accounts in payroll, round-number inventory adjustments, refund spikes by cashier — catch more than annual stocktakes performed by the same team that owns the warehouse.",
        ],
      },
      {
        heading: "What monitoring should look like in practice",
        paragraphs: [
          "You do not need a multinational compliance department to watch these risks. You need a named owner, a short risk register reviewed by leadership, exception reporting on payments and vendors, a Speak Up path that bypasses line managers, and a relationship with investigators and counsel you can call before a rumour becomes a filing.",
          "Training helps when it is built from local cases and real process maps. Generic slide decks from another jurisdiction rarely change how an invoice is approved on a Friday afternoon.",
        ],
        bullets: [
          "Map where money, goods, and data actually move — including WhatsApp approvals.",
          "Rehearse a payment-diversion and a procurement-allegation scenario once a year.",
          "Keep correspondent-bank and regulatory expectations in the same conversation as commercial growth.",
        ],
      },
    ],
    takeaways: [
      "Watch procurement, payment diversion, trade flows, and internal schemes — not only classic AML case studies.",
      "Small markets and correspondent banking make one incident more expensive than the ledger loss.",
      "A short, owned risk register plus exception reporting beats a long policy nobody uses.",
    ],
  },
];

export function getInsight(slug: string) {
  return INSIGHTS.find((article) => article.slug === slug);
}

export function getCategoryLabel(id: InsightCategoryId) {
  return INSIGHT_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function categoriesWithArticles(articles: InsightArticle[] = INSIGHTS) {
  return INSIGHT_CATEGORIES.filter((category) =>
    articles.some((article) => article.category === category.id),
  );
}

export function insightsInCategory(
  id: InsightCategoryId,
  articles: InsightArticle[] = INSIGHTS,
) {
  return articles.filter((article) => article.category === id);
}

export function relatedInsights(
  article: InsightArticle,
  limit = 3,
  articles: InsightArticle[] = INSIGHTS,
) {
  return articles
    .filter((item) => item.category === article.category && item.slug !== article.slug)
    .slice(0, limit);
}
