import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "investigator",
  "client",
  "trainer",
  "polygraph_examiner",
]);

export const divisionTypeEnum = pgEnum("division_type", [
  "consultancy",
  "operations",
  "training",
  "polygraph",
]);

export const caseStatusEnum = pgEnum("case_status", [
  "draft",
  "active",
  "on_hold",
  "closed",
  "archived",
]);

export const casePriorityEnum = pgEnum("case_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "uploaded",
  "verified",
  "archived",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const polygraphSessionStatusEnum = pgEnum("polygraph_session_status", [
  "requested",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "in_progress",
  "closed",
]);

export const inquiryClientTypeEnum = pgEnum("inquiry_client_type", [
  "private",
  "corporate",
  "government",
  "ngo",
]);

export const inquiryServiceInterestEnum = pgEnum("inquiry_service_interest", [
  "consultancy",
  "operations",
  "training",
  "polygraph",
  "multiple",
  "unsure",
]);

// ─── Divisions ───────────────────────────────────────────────────────────────

export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  type: divisionTypeEnum("type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("client"),
  divisionId: integer("division_id").references(() => divisions.id),
  passwordHash: text("password_hash"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Cases / Investigations ──────────────────────────────────────────────────

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: caseStatusEnum("status").notNull().default("draft"),
  priority: casePriorityEnum("priority").notNull().default("medium"),
  divisionId: integer("division_id")
    .references(() => divisions.id)
    .notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  clientId: integer("client_id").references(() => users.id),
  jurisdiction: text("jurisdiction"),
  openedAt: timestamp("opened_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Documents ───────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  uploadedById: integer("uploaded_by_id")
    .references(() => users.id)
    .notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: text("storage_key").notNull(),
  status: documentStatusEnum("status").notNull().default("pending"),
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  encryptionKeyId: text("encryption_key_id"),
  checksum: text("checksum"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Training ────────────────────────────────────────────────────────────────

export const trainingPrograms = pgTable("training_programs", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  maxSeats: integer("max_seats").notNull(),
  level: text("level").notNull(),
  divisionId: integer("division_id")
    .references(() => divisions.id)
    .notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .references(() => trainingPrograms.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    status: enrollmentStatusEnum("status").notNull().default("pending"),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    certificateIssued: boolean("certificate_issued").notNull().default(false),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("enrollments_program_user_idx").on(
      table.programId,
      table.userId,
    ),
  ],
);

// ─── Polygraph Sessions ────────────────────────────────────────────────────────

export const polygraphSessions = pgTable("polygraph_sessions", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  caseId: integer("case_id").references(() => cases.id),
  examinerId: integer("examiner_id")
    .references(() => users.id)
    .notNull(),
  requestingAgency: text("requesting_agency").notNull(),
  examinationType: text("examination_type").notNull(),
  status: polygraphSessionStatusEnum("status").notNull().default("requested"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  resultSummary: text("result_summary"),
  isConfidential: boolean("is_confidential").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Risk Assessments ────────────────────────────────────────────────────────

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  assessedById: integer("assessed_by_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  findings: text("findings"),
  recommendations: text("recommendations"),
  mitigationPlan: jsonb("mitigation_plan").$type<Record<string, unknown>>(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Service Inquiries (public intake) ───────────────────────────────────────

export const serviceInquiries = pgTable("service_inquiries", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  organization: text("organization"),
  clientType: inquiryClientTypeEnum("client_type").notNull(),
  serviceInterest: inquiryServiceInterestEnum("service_interest").notNull(),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  division: one(divisions, {
    fields: [users.divisionId],
    references: [divisions.id],
  }),
  assignedCases: many(cases, { relationName: "assignedCases" }),
  clientCases: many(cases, { relationName: "clientCases" }),
  documents: many(documents),
  enrollments: many(enrollments),
  polygraphSessions: many(polygraphSessions),
  riskAssessments: many(riskAssessments),
  auditLogs: many(auditLogs),
}));

export const divisionsRelations = relations(divisions, ({ many }) => ({
  users: many(users),
  cases: many(cases),
  trainingPrograms: many(trainingPrograms),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  division: one(divisions, {
    fields: [cases.divisionId],
    references: [divisions.id],
  }),
  assignedTo: one(users, {
    fields: [cases.assignedToId],
    references: [users.id],
    relationName: "assignedCases",
  }),
  client: one(users, {
    fields: [cases.clientId],
    references: [users.id],
    relationName: "clientCases",
  }),
  documents: many(documents),
  polygraphSessions: many(polygraphSessions),
  riskAssessments: many(riskAssessments),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  case: one(cases, {
    fields: [documents.caseId],
    references: [cases.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
}));

export const trainingProgramsRelations = relations(
  trainingPrograms,
  ({ one, many }) => ({
    division: one(divisions, {
      fields: [trainingPrograms.divisionId],
      references: [divisions.id],
    }),
    enrollments: many(enrollments),
  }),
);

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  program: one(trainingPrograms, {
    fields: [enrollments.programId],
    references: [trainingPrograms.id],
  }),
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
}));

export const polygraphSessionsRelations = relations(
  polygraphSessions,
  ({ one }) => ({
    case: one(cases, {
      fields: [polygraphSessions.caseId],
      references: [cases.id],
    }),
    examiner: one(users, {
      fields: [polygraphSessions.examinerId],
      references: [users.id],
    }),
  }),
);

export const riskAssessmentsRelations = relations(
  riskAssessments,
  ({ one }) => ({
    case: one(cases, {
      fields: [riskAssessments.caseId],
      references: [cases.id],
    }),
    assessedBy: one(users, {
      fields: [riskAssessments.assessedById],
      references: [users.id],
    }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
