import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  password: passwordSchema,
  organizationName: z.string().min(1, "Organization name is required"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  description: z.string().optional(),
  status: z.enum(["draft", "planning", "active", "on_hold", "completed", "cancelled", "archived"]).default("draft"),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetAmount: z.number().positive().optional(),
  workspaceId: z.string().uuid().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(500),
  description: z.string().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "blocked", "done", "cancelled"]).default("backlog"),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).default("none"),
  taskType: z.enum(["task", "bug", "feature", "epic", "story", "milestone"]).default("task"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  projectId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(255),
  description: z.string().optional(),
  eventType: z.enum(["festival", "conference", "concert", "activation", "corporate", "wedding", "private", "tour", "production"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  venueId: z.string().uuid().optional(),
  capacity: z.number().int().positive().optional(),
  expectedAttendance: z.number().int().positive().optional(),
});

export const assetSchema = z.object({
  assetTag: z.string().min(1, "Asset tag is required").max(50),
  name: z.string().min(1, "Asset name is required").max(255),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "reserved", "retired", "lost", "damaged"]).default("available"),
  condition: z.enum(["excellent", "good", "fair", "poor", "broken"]).default("good"),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().positive().optional(),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  direction: z.enum(["receivable", "payable"]),
  companyId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  subtotal: z.number().positive(),
  taxRate: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  legalName: z.string().optional(),
  companyType: z.enum(["prospect", "client", "partner", "vendor", "competitor"]).default("prospect"),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: emailSchema.optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: emailSchema.optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  companyId: z.string().uuid().optional(),
  isPrimary: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type AssetInput = z.infer<typeof assetSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
