/**
 * ATLVS Platform - Centralized Enum Definitions
 * Single Source of Truth for all status types and enums
 * Generated from database schema ENUMs
 */

// ============================================================================
// SUBSCRIPTION & BILLING
// ============================================================================

export const SUBSCRIPTION_TIER = {
  CORE: "core",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIER)[keyof typeof SUBSCRIPTION_TIER];

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELLED: "cancelled",
  TRIALING: "trialing",
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// ============================================================================
// MEMBER STATUS
// ============================================================================

export const MEMBER_STATUS = {
  ACTIVE: "active",
  INVITED: "invited",
  SUSPENDED: "suspended",
  DEACTIVATED: "deactivated",
} as const;

export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

// ============================================================================
// ACCOUNT TYPES
// ============================================================================

export const ACCOUNT_TYPE = {
  OWNER: "owner",
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  FINANCE_MANAGER: "finance_manager",
  CREW_MEMBER: "crew_member",
  ARTIST: "artist",
  VENDOR: "vendor",
  CLIENT: "client",
  VOLUNTEER: "volunteer",
  MEMBER: "member",
} as const;

export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

// ============================================================================
// ONBOARDING
// ============================================================================

export const ONBOARDING_STEP_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;

export type OnboardingStepStatus = (typeof ONBOARDING_STEP_STATUS)[keyof typeof ONBOARDING_STEP_STATUS];

export const INVITATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
  REVOKED: "revoked",
} as const;

export type InvitationStatus = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

// ============================================================================
// PROJECT & TASK
// ============================================================================

export const PROJECT_STATUS = {
  DRAFT: "draft",
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ARCHIVED: "archived",
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const VISIBILITY_TYPE = {
  PRIVATE: "private",
  TEAM: "team",
  ORGANIZATION: "organization",
  PUBLIC: "public",
} as const;

export type VisibilityType = (typeof VISIBILITY_TYPE)[keyof typeof VISIBILITY_TYPE];

export const PRIORITY_LEVEL = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type PriorityLevel = (typeof PRIORITY_LEVEL)[keyof typeof PRIORITY_LEVEL];

export const TASK_STATUS = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  BLOCKED: "blocked",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const TASK_TYPE = {
  TASK: "task",
  BUG: "bug",
  FEATURE: "feature",
  EPIC: "epic",
  STORY: "story",
  MILESTONE: "milestone",
} as const;

export type TaskType = (typeof TASK_TYPE)[keyof typeof TASK_TYPE];

export const DEPENDENCY_TYPE = {
  FINISH_TO_START: "finish_to_start",
  START_TO_START: "start_to_start",
  FINISH_TO_FINISH: "finish_to_finish",
  START_TO_FINISH: "start_to_finish",
} as const;

export type DependencyType = (typeof DEPENDENCY_TYPE)[keyof typeof DEPENDENCY_TYPE];

// ============================================================================
// EVENTS & PRODUCTION
// ============================================================================

export const EVENT_TYPE = {
  FESTIVAL: "festival",
  CONFERENCE: "conference",
  CONCERT: "concert",
  ACTIVATION: "activation",
  CORPORATE: "corporate",
  WEDDING: "wedding",
  PRIVATE: "private",
  TOUR: "tour",
  PRODUCTION: "production",
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export const EVENT_PHASE = {
  CONCEPT: "concept",
  PLANNING: "planning",
  PRE_PRODUCTION: "pre_production",
  SETUP: "setup",
  ACTIVE: "active",
  LIVE: "live",
  TEARDOWN: "teardown",
  POST_MORTEM: "post_mortem",
  ARCHIVED: "archived",
} as const;

export type EventPhase = (typeof EVENT_PHASE)[keyof typeof EVENT_PHASE];

export const SHOW_CALL_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

export type ShowCallStatus = (typeof SHOW_CALL_STATUS)[keyof typeof SHOW_CALL_STATUS];

export const RUNSHEET_STATUS = {
  DRAFT: "draft",
  APPROVED: "approved",
  ACTIVE: "active",
  LOCKED: "locked",
} as const;

export type RunsheetStatus = (typeof RUNSHEET_STATUS)[keyof typeof RUNSHEET_STATUS];

export const RUNSHEET_ITEM_TYPE = {
  PERFORMANCE: "performance",
  TRANSITION: "transition",
  BREAK: "break",
  ANNOUNCEMENT: "announcement",
  TECHNICAL: "technical",
  CEREMONY: "ceremony",
  SPEECH: "speech",
  OTHER: "other",
} as const;

export type RunsheetItemType = (typeof RUNSHEET_ITEM_TYPE)[keyof typeof RUNSHEET_ITEM_TYPE];

export const RUNSHEET_ITEM_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SKIPPED: "skipped",
  DELAYED: "delayed",
} as const;

export type RunsheetItemStatus = (typeof RUNSHEET_ITEM_STATUS)[keyof typeof RUNSHEET_ITEM_STATUS];

export const CUE_DEPARTMENT = {
  LIGHTING: "lighting",
  AUDIO: "audio",
  VIDEO: "video",
  PYRO: "pyro",
  SFX: "sfx",
  RIGGING: "rigging",
  STAGING: "staging",
} as const;

export type CueDepartment = (typeof CUE_DEPARTMENT)[keyof typeof CUE_DEPARTMENT];

export const CUE_TYPE = {
  GO: "go",
  STANDBY: "standby",
  WARNING: "warning",
  HOLD: "hold",
  CUT: "cut",
} as const;

export type CueType = (typeof CUE_TYPE)[keyof typeof CUE_TYPE];

export const TRIGGER_TYPE = {
  MANUAL: "manual",
  TIMECODE: "timecode",
  MIDI: "midi",
  OSC: "osc",
  FOLLOW: "follow",
} as const;

export type TriggerType = (typeof TRIGGER_TYPE)[keyof typeof TRIGGER_TYPE];

// ============================================================================
// ASSETS
// ============================================================================

export const ASSET_STATUS = {
  AVAILABLE: "available",
  IN_USE: "in_use",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
  RETIRED: "retired",
  LOST: "lost",
  DAMAGED: "damaged",
} as const;

export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];

export const ASSET_CONDITION = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
  BROKEN: "broken",
} as const;

export type AssetCondition = (typeof ASSET_CONDITION)[keyof typeof ASSET_CONDITION];

export const DEPRECIATION_METHOD = {
  STRAIGHT_LINE: "straight_line",
  DECLINING_BALANCE: "declining_balance",
  NONE: "none",
} as const;

export type DepreciationMethod = (typeof DEPRECIATION_METHOD)[keyof typeof DEPRECIATION_METHOD];

export const LOCATION_TYPE = {
  WAREHOUSE: "warehouse",
  VENUE: "venue",
  VEHICLE: "vehicle",
  OFFICE: "office",
  EXTERNAL: "external",
  VIRTUAL: "virtual",
} as const;

export type LocationType = (typeof LOCATION_TYPE)[keyof typeof LOCATION_TYPE];

export const CHECK_ACTION_TYPE = {
  CHECK_OUT: "check_out",
  CHECK_IN: "check_in",
  TRANSFER: "transfer",
  RESERVE: "reserve",
  RELEASE: "release",
} as const;

export type CheckActionType = (typeof CHECK_ACTION_TYPE)[keyof typeof CHECK_ACTION_TYPE];

export const SCAN_METHOD = {
  QR: "qr",
  BARCODE: "barcode",
  RFID: "rfid",
  NFC: "nfc",
  MANUAL: "manual",
} as const;

export type ScanMethod = (typeof SCAN_METHOD)[keyof typeof SCAN_METHOD];

export const MAINTENANCE_TYPE = {
  PREVENTIVE: "preventive",
  CORRECTIVE: "corrective",
  INSPECTION: "inspection",
  CALIBRATION: "calibration",
} as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPE)[keyof typeof MAINTENANCE_TYPE];

export const MAINTENANCE_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type MaintenanceStatus = (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

export const INVENTORY_TRANSACTION_TYPE = {
  RECEIPT: "receipt",
  ISSUE: "issue",
  ADJUSTMENT: "adjustment",
  TRANSFER: "transfer",
  RETURN: "return",
  WASTE: "waste",
} as const;

export type InventoryTransactionType = (typeof INVENTORY_TRANSACTION_TYPE)[keyof typeof INVENTORY_TRANSACTION_TYPE];

// ============================================================================
// WORKFORCE
// ============================================================================

export const CREW_CALL_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CONFIRMED: "confirmed",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type CrewCallStatus = (typeof CREW_CALL_STATUS)[keyof typeof CREW_CALL_STATUS];

export const RATE_TYPE = {
  HOURLY: "hourly",
  DAILY: "daily",
  FLAT: "flat",
} as const;

export type RateType = (typeof RATE_TYPE)[keyof typeof RATE_TYPE];

export const ASSIGNMENT_STATUS = {
  INVITED: "invited",
  CONFIRMED: "confirmed",
  DECLINED: "declined",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  NO_SHOW: "no_show",
} as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export const SHIFT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type ShiftStatus = (typeof SHIFT_STATUS)[keyof typeof SHIFT_STATUS];

export const TIMESHEET_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid",
} as const;

export type TimesheetStatus = (typeof TIMESHEET_STATUS)[keyof typeof TIMESHEET_STATUS];

export const CERTIFICATION_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
} as const;

export type CertificationStatus = (typeof CERTIFICATION_STATUS)[keyof typeof CERTIFICATION_STATUS];

export const AVAILABILITY_TYPE = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  TENTATIVE: "tentative",
  PREFERRED: "preferred",
} as const;

export type AvailabilityType = (typeof AVAILABILITY_TYPE)[keyof typeof AVAILABILITY_TYPE];

// ============================================================================
// FINANCE
// ============================================================================

export const BUDGET_PERIOD_TYPE = {
  ANNUAL: "annual",
  QUARTERLY: "quarterly",
  MONTHLY: "monthly",
  PROJECT: "project",
  EVENT: "event",
} as const;

export type BudgetPeriodType = (typeof BUDGET_PERIOD_TYPE)[keyof typeof BUDGET_PERIOD_TYPE];

export const BUDGET_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;

export type BudgetStatus = (typeof BUDGET_STATUS)[keyof typeof BUDGET_STATUS];

export const BUDGET_CATEGORY_TYPE = {
  INCOME: "income",
  EXPENSE: "expense",
  CAPITAL: "capital",
} as const;

export type BudgetCategoryType = (typeof BUDGET_CATEGORY_TYPE)[keyof typeof BUDGET_CATEGORY_TYPE];

export const INVOICE_TYPE = {
  STANDARD: "standard",
  CREDIT: "credit",
  PROFORMA: "proforma",
  RECURRING: "recurring",
} as const;

export type InvoiceType = (typeof INVOICE_TYPE)[keyof typeof INVOICE_TYPE];

export const INVOICE_DIRECTION = {
  RECEIVABLE: "receivable",
  PAYABLE: "payable",
} as const;

export type InvoiceDirection = (typeof INVOICE_DIRECTION)[keyof typeof INVOICE_DIRECTION];

export const INVOICE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  PARTIALLY_PAID: "partially_paid",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const PAYMENT_METHOD = {
  BANK_TRANSFER: "bank_transfer",
  CREDIT_CARD: "credit_card",
  CHECK: "check",
  CASH: "cash",
  PAYPAL: "paypal",
  STRIPE: "stripe",
  OTHER: "other",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const EXPENSE_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
  REIMBURSED: "reimbursed",
} as const;

export type ExpenseStatus = (typeof EXPENSE_STATUS)[keyof typeof EXPENSE_STATUS];

export const REQUISITION_PRIORITY = {
  URGENT: "urgent",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
} as const;

export type RequisitionPriority = (typeof REQUISITION_PRIORITY)[keyof typeof REQUISITION_PRIORITY];

export const REQUISITION_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
  ORDERED: "ordered",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const;

export type RequisitionStatus = (typeof REQUISITION_STATUS)[keyof typeof REQUISITION_STATUS];

export const PO_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  ACKNOWLEDGED: "acknowledged",
  PARTIALLY_RECEIVED: "partially_received",
  RECEIVED: "received",
  INVOICED: "invoiced",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;

export type POStatus = (typeof PO_STATUS)[keyof typeof PO_STATUS];

export const CONTRACT_TYPE = {
  VENDOR: "vendor",
  CLIENT: "client",
  EMPLOYMENT: "employment",
  NDA: "nda",
  SERVICE: "service",
  LICENSING: "licensing",
  RENTAL: "rental",
  SPONSORSHIP: "sponsorship",
} as const;

export type ContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE];

export const CONTRACT_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  PENDING_SIGNATURE: "pending_signature",
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
  RENEWED: "renewed",
} as const;

export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

export const RENEWAL_TYPE = {
  NONE: "none",
  AUTO: "auto",
  MANUAL: "manual",
} as const;

export type RenewalType = (typeof RENEWAL_TYPE)[keyof typeof RENEWAL_TYPE];

export const COUNTERPARTY_TYPE = {
  COMPANY: "company",
  CONTACT: "contact",
  VENDOR: "vendor",
  USER: "user",
} as const;

export type CounterpartyType = (typeof COUNTERPARTY_TYPE)[keyof typeof COUNTERPARTY_TYPE];

// ============================================================================
// CRM & BUSINESS
// ============================================================================

export const COMPANY_TYPE = {
  PROSPECT: "prospect",
  CLIENT: "client",
  PARTNER: "partner",
  VENDOR: "vendor",
  COMPETITOR: "competitor",
} as const;

export type CompanyType = (typeof COMPANY_TYPE)[keyof typeof COMPANY_TYPE];

export const DEAL_TYPE = {
  NEW_BUSINESS: "new_business",
  EXPANSION: "expansion",
  RENEWAL: "renewal",
  OTHER: "other",
} as const;

export type DealType = (typeof DEAL_TYPE)[keyof typeof DEAL_TYPE];

export const DEAL_STAGE = {
  LEAD: "lead",
  QUALIFIED: "qualified",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  WON: "won",
  LOST: "lost",
} as const;

export type DealStage = (typeof DEAL_STAGE)[keyof typeof DEAL_STAGE];

export const ACTIVITY_TYPE = {
  CALL: "call",
  EMAIL: "email",
  MEETING: "meeting",
  NOTE: "note",
  TASK: "task",
  DEMO: "demo",
  PROPOSAL: "proposal",
} as const;

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

export const PROPOSAL_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;

export type ProposalStatus = (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

// ============================================================================
// VENUES
// ============================================================================

export const VENUE_TYPE = {
  INDOOR: "indoor",
  OUTDOOR: "outdoor",
  HYBRID: "hybrid",
  VIRTUAL: "virtual",
} as const;

export type VenueType = (typeof VENUE_TYPE)[keyof typeof VENUE_TYPE];

// ============================================================================
// CONTENT
// ============================================================================

export const MEDIA_STATUS = {
  PROCESSING: "processing",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type MediaStatus = (typeof MEDIA_STATUS)[keyof typeof MEDIA_STATUS];

export const BRAND_GUIDELINE_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type BrandGuidelineStatus = (typeof BRAND_GUIDELINE_STATUS)[keyof typeof BRAND_GUIDELINE_STATUS];

export const CAMPAIGN_TYPE = {
  LAUNCH: "launch",
  AWARENESS: "awareness",
  ENGAGEMENT: "engagement",
  CONVERSION: "conversion",
  RETENTION: "retention",
  EVENT: "event",
  SEASONAL: "seasonal",
} as const;

export type CampaignType = (typeof CAMPAIGN_TYPE)[keyof typeof CAMPAIGN_TYPE];

export const CAMPAIGN_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];

export const MATERIAL_TYPE = {
  FLYER: "flyer",
  POSTER: "poster",
  BANNER: "banner",
  SOCIAL_POST: "social_post",
  EMAIL: "email",
  VIDEO: "video",
  BROCHURE: "brochure",
  PRESENTATION: "presentation",
  PRESS_RELEASE: "press_release",
} as const;

export type MaterialType = (typeof MATERIAL_TYPE)[keyof typeof MATERIAL_TYPE];

export const MATERIAL_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type MaterialStatus = (typeof MATERIAL_STATUS)[keyof typeof MATERIAL_STATUS];

export const SOCIAL_PLATFORM = {
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  TWITTER: "twitter",
  LINKEDIN: "linkedin",
  TIKTOK: "tiktok",
  YOUTUBE: "youtube",
  PINTEREST: "pinterest",
  THREADS: "threads",
} as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORM)[keyof typeof SOCIAL_PLATFORM];

export const SOCIAL_POST_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
  FAILED: "failed",
  DELETED: "deleted",
} as const;

export type SocialPostStatus = (typeof SOCIAL_POST_STATUS)[keyof typeof SOCIAL_POST_STATUS];

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REVISION_REQUESTED: "revision_requested",
} as const;

export type ApprovalStatus = (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

// ============================================================================
// TALENT
// ============================================================================

export const TALENT_TYPE = {
  DJ: "dj",
  BAND: "band",
  SOLO_ARTIST: "solo_artist",
  SPEAKER: "speaker",
  MC: "mc",
  PERFORMER: "performer",
  COMEDIAN: "comedian",
  OTHER: "other",
} as const;

export type TalentType = (typeof TALENT_TYPE)[keyof typeof TALENT_TYPE];

export const BOOKING_STATUS = {
  AVAILABLE: "available",
  LIMITED: "limited",
  UNAVAILABLE: "unavailable",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const TALENT_BOOKING_STATUS = {
  INQUIRY: "inquiry",
  NEGOTIATING: "negotiating",
  CONFIRMED: "confirmed",
  CONTRACTED: "contracted",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type TalentBookingStatus = (typeof TALENT_BOOKING_STATUS)[keyof typeof TALENT_BOOKING_STATUS];

export const PERFORMANCE_TYPE = {
  HEADLINER: "headliner",
  SUPPORT: "support",
  OPENER: "opener",
  SPECIAL_GUEST: "special_guest",
  RESIDENT: "resident",
} as const;

export type PerformanceType = (typeof PERFORMANCE_TYPE)[keyof typeof PERFORMANCE_TYPE];

export const FEE_TYPE = {
  FLAT: "flat",
  GUARANTEE: "guarantee",
  VS_PERCENTAGE: "vs_percentage",
  GUARANTEE_PLUS_PERCENTAGE: "guarantee_plus_percentage",
} as const;

export type FeeType = (typeof FEE_TYPE)[keyof typeof FEE_TYPE];

export const RIDER_TYPE = {
  TECHNICAL: "technical",
  HOSPITALITY: "hospitality",
  COMBINED: "combined",
} as const;

export type RiderType = (typeof RIDER_TYPE)[keyof typeof RIDER_TYPE];

export const RIDER_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  SIGNED: "signed",
} as const;

export type RiderStatus = (typeof RIDER_STATUS)[keyof typeof RIDER_STATUS];

export const RIDER_ITEM_CATEGORY = {
  AUDIO: "audio",
  LIGHTING: "lighting",
  VIDEO: "video",
  BACKLINE: "backline",
  STAGING: "staging",
  HOSPITALITY: "hospitality",
  CATERING: "catering",
  ACCOMMODATION: "accommodation",
  TRANSPORTATION: "transportation",
  SECURITY: "security",
  OTHER: "other",
} as const;

export type RiderItemCategory = (typeof RIDER_ITEM_CATEGORY)[keyof typeof RIDER_ITEM_CATEGORY];

export const RIDER_ITEM_PROVIDER = {
  ARTIST: "artist",
  VENUE: "venue",
  PROMOTER: "promoter",
} as const;

export type RiderItemProvider = (typeof RIDER_ITEM_PROVIDER)[keyof typeof RIDER_ITEM_PROVIDER];

export const RIDER_ITEM_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SUBSTITUTED: "substituted",
  NOT_AVAILABLE: "not_available",
} as const;

export type RiderItemStatus = (typeof RIDER_ITEM_STATUS)[keyof typeof RIDER_ITEM_STATUS];

export const TALENT_PAYMENT_TYPE = {
  DEPOSIT: "deposit",
  BALANCE: "balance",
  BONUS: "bonus",
  REIMBURSEMENT: "reimbursement",
} as const;

export type TalentPaymentType = (typeof TALENT_PAYMENT_TYPE)[keyof typeof TALENT_PAYMENT_TYPE];

export const TALENT_PAYMENT_METHOD = {
  WIRE: "wire",
  CHECK: "check",
  PAYPAL: "paypal",
  CASH: "cash",
  CRYPTO: "crypto",
} as const;

export type TalentPaymentMethod = (typeof TALENT_PAYMENT_METHOD)[keyof typeof TALENT_PAYMENT_METHOD];

export const TALENT_PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type TalentPaymentStatus = (typeof TALENT_PAYMENT_STATUS)[keyof typeof TALENT_PAYMENT_STATUS];

export const SETLIST_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  PERFORMED: "performed",
} as const;

export type SetlistStatus = (typeof SETLIST_STATUS)[keyof typeof SETLIST_STATUS];

export const SCHEDULE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  LOCKED: "locked",
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

// ============================================================================
// TICKETS & EXPERIENCE
// ============================================================================

export const TICKET_STATUS = {
  RESERVED: "reserved",
  PURCHASED: "purchased",
  CHECKED_IN: "checked_in",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  TRANSFERRED: "transferred",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_TIER = {
  GENERAL: "general",
  VIP: "vip",
  PREMIUM: "premium",
  BACKSTAGE: "backstage",
  ARTIST: "artist",
  MEDIA: "media",
  STAFF: "staff",
  COMP: "comp",
} as const;

export type TicketTier = (typeof TICKET_TIER)[keyof typeof TICKET_TIER];

export const TICKET_ORDER_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;

export type TicketOrderStatus = (typeof TICKET_ORDER_STATUS)[keyof typeof TICKET_ORDER_STATUS];

export const GUEST_LIST_TYPE = {
  VIP: "vip",
  ARTIST: "artist",
  MEDIA: "media",
  SPONSOR: "sponsor",
  STAFF: "staff",
  COMP: "comp",
} as const;

export type GuestListType = (typeof GUEST_LIST_TYPE)[keyof typeof GUEST_LIST_TYPE];

export const GUEST_LIST_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;

export type GuestListStatus = (typeof GUEST_LIST_STATUS)[keyof typeof GUEST_LIST_STATUS];

export const GUEST_ENTRY_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  NO_SHOW: "no_show",
} as const;

export type GuestEntryStatus = (typeof GUEST_ENTRY_STATUS)[keyof typeof GUEST_ENTRY_STATUS];

export const HOSPITALITY_REQUEST_TYPE = {
  ACCOMMODATION: "accommodation",
  TRANSPORTATION: "transportation",
  CATERING: "catering",
  GREENROOM: "greenroom",
  SECURITY: "security",
  OTHER: "other",
} as const;

export type HospitalityRequestType = (typeof HOSPITALITY_REQUEST_TYPE)[keyof typeof HOSPITALITY_REQUEST_TYPE];

export const HOSPITALITY_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
} as const;

export type HospitalityStatus = (typeof HOSPITALITY_STATUS)[keyof typeof HOSPITALITY_STATUS];

export const ACCOMMODATION_STATUS = {
  BOOKED: "booked",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
} as const;

export type AccommodationStatus = (typeof ACCOMMODATION_STATUS)[keyof typeof ACCOMMODATION_STATUS];

export const TRANSPORT_TYPE = {
  FLIGHT: "flight",
  GROUND: "ground",
  SHUTTLE: "shuttle",
  RIDESHARE: "rideshare",
  RENTAL: "rental",
  PRIVATE: "private",
} as const;

export type TransportType = (typeof TRANSPORT_TYPE)[keyof typeof TRANSPORT_TYPE];

export const TRANSPORT_STATUS = {
  BOOKED: "booked",
  CONFIRMED: "confirmed",
  IN_TRANSIT: "in_transit",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TransportStatus = (typeof TRANSPORT_STATUS)[keyof typeof TRANSPORT_STATUS];

export const CATERING_ORDER_TYPE = {
  GREENROOM: "greenroom",
  CREW_MEAL: "crew_meal",
  VIP: "vip",
  HOSPITALITY: "hospitality",
  CONCESSION: "concession",
} as const;

export type CateringOrderType = (typeof CATERING_ORDER_TYPE)[keyof typeof CATERING_ORDER_TYPE];

export const CATERING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type CateringStatus = (typeof CATERING_STATUS)[keyof typeof CATERING_STATUS];

export const COMMUNITY_MEMBER_TYPE = {
  FAN: "fan",
  ARTIST: "artist",
  CREATOR: "creator",
  INFLUENCER: "influencer",
  BRAND: "brand",
} as const;

export type CommunityMemberType = (typeof COMMUNITY_MEMBER_TYPE)[keyof typeof COMMUNITY_MEMBER_TYPE];

export const POST_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  POLL: "poll",
  EVENT: "event",
  ARTICLE: "article",
} as const;

export type PostType = (typeof POST_TYPE)[keyof typeof POST_TYPE];

export const POST_VISIBILITY = {
  PUBLIC: "public",
  FOLLOWERS: "followers",
  PRIVATE: "private",
} as const;

export type PostVisibility = (typeof POST_VISIBILITY)[keyof typeof POST_VISIBILITY];

// ============================================================================
// DOCUMENTS
// ============================================================================

export const DOCUMENT_TYPE = {
  DOCUMENT: "document",
  TEMPLATE: "template",
  WIKI: "wiki",
  NOTE: "note",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export const DOCUMENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

// ============================================================================
// WORKFLOWS
// ============================================================================

export const WORKFLOW_TRIGGER_TYPE = {
  ENTITY_CREATED: "entity_created",
  ENTITY_UPDATED: "entity_updated",
  ENTITY_DELETED: "entity_deleted",
  FIELD_CHANGED: "field_changed",
  STATUS_CHANGED: "status_changed",
  SCHEDULE: "schedule",
  WEBHOOK: "webhook",
  MANUAL: "manual",
  API_CALL: "api_call",
  FORM_SUBMITTED: "form_submitted",
  APPROVAL_DECISION: "approval_decision",
  SCAN_EVENT: "scan_event",
} as const;

export type WorkflowTriggerType = (typeof WORKFLOW_TRIGGER_TYPE)[keyof typeof WORKFLOW_TRIGGER_TYPE];

export const WORKFLOW_RUN_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type WorkflowRunStatus = (typeof WORKFLOW_RUN_STATUS)[keyof typeof WORKFLOW_RUN_STATUS];

export const APPROVAL_WORKFLOW_TYPE = {
  SINGLE_APPROVER: "single_approver",
  ANY_OF_LIST: "any_of_list",
  ALL_OF_LIST: "all_of_list",
  SEQUENTIAL_CHAIN: "sequential_chain",
  PARALLEL_CHAIN: "parallel_chain",
  MANAGER_HIERARCHY: "manager_hierarchy",
  ROLE_BASED: "role_based",
} as const;

export type ApprovalWorkflowType = (typeof APPROVAL_WORKFLOW_TYPE)[keyof typeof APPROVAL_WORKFLOW_TYPE];

export const APPROVAL_REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ESCALATED: "escalated",
  CANCELLED: "cancelled",
} as const;

export type ApprovalRequestStatus = (typeof APPROVAL_REQUEST_STATUS)[keyof typeof APPROVAL_REQUEST_STATUS];

// ============================================================================
// GENERIC / COMMON
// ============================================================================

export const GENERIC_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ERROR: "error",
} as const;

export type GenericStatus = (typeof GENERIC_STATUS)[keyof typeof GENERIC_STATUS];

export const SUPPORT_TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  WAITING: "waiting",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUS)[keyof typeof SUPPORT_TICKET_STATUS];

export const BACKUP_STATUS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
  FAILED: "failed",
  SCHEDULED: "scheduled",
} as const;

export type BackupStatus = (typeof BACKUP_STATUS)[keyof typeof BACKUP_STATUS];

export const SSO_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ERROR: "error",
} as const;

export type SSOStatus = (typeof SSO_STATUS)[keyof typeof SSO_STATUS];

export const ON_CALL_STATUS = {
  CURRENT: "current",
  UPCOMING: "upcoming",
  COMPLETED: "completed",
} as const;

export type OnCallStatus = (typeof ON_CALL_STATUS)[keyof typeof ON_CALL_STATUS];

export const MESSAGE_STATUS = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  FAILED: "failed",
} as const;

export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];

// ============================================================================
// FLOOR PLANS
// ============================================================================

export const FLOOR_PLAN_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  ARCHIVED: "archived",
} as const;

export type FloorPlanStatus = (typeof FLOOR_PLAN_STATUS)[keyof typeof FLOOR_PLAN_STATUS];

// ============================================================================
// QUOTES
// ============================================================================

export const QUOTE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

// ============================================================================
// PURCHASE ORDERS
// ============================================================================

export const PURCHASE_ORDER_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  ORDERED: "ordered",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const;

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUS)[keyof typeof PURCHASE_ORDER_STATUS];

// ============================================================================
// CALL SHEETS
// ============================================================================

export const CALL_SHEET_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  ACKNOWLEDGED: "acknowledged",
} as const;

export type CallSheetStatus = (typeof CALL_SHEET_STATUS)[keyof typeof CALL_SHEET_STATUS];

// ============================================================================
// CUE SHEETS
// ============================================================================

export const CUE_SHEET_STATUS = {
  DRAFT: "draft",
  REHEARSAL: "rehearsal",
  LIVE: "live",
  COMPLETED: "completed",
} as const;

export type CueSheetStatus = (typeof CUE_SHEET_STATUS)[keyof typeof CUE_SHEET_STATUS];

export const CUE_STATUS = {
  STANDBY: "standby",
  GO: "go",
  COMPLETE: "complete",
} as const;

export type CueStatus = (typeof CUE_STATUS)[keyof typeof CUE_STATUS];

// ============================================================================
// SURVEYS
// ============================================================================

export const SURVEY_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
  ARCHIVED: "archived",
} as const;

export type SurveyStatus = (typeof SURVEY_STATUS)[keyof typeof SURVEY_STATUS];

export const SURVEY_TYPE = {
  PRE_EVENT: "pre_event",
  POST_EVENT: "post_event",
  NPS: "nps",
  SATISFACTION: "satisfaction",
  FEEDBACK: "feedback",
} as const;

export type SurveyType = (typeof SURVEY_TYPE)[keyof typeof SURVEY_TYPE];

// ============================================================================
// EMAIL CAMPAIGNS
// ============================================================================

export const EMAIL_CAMPAIGN_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
} as const;

export type EmailCampaignStatus = (typeof EMAIL_CAMPAIGN_STATUS)[keyof typeof EMAIL_CAMPAIGN_STATUS];

export const EMAIL_CAMPAIGN_TYPE = {
  ANNOUNCEMENT: "announcement",
  REMINDER: "reminder",
  NEWSLETTER: "newsletter",
  PROMOTIONAL: "promotional",
  FOLLOW_UP: "follow_up",
} as const;

export type EmailCampaignType = (typeof EMAIL_CAMPAIGN_TYPE)[keyof typeof EMAIL_CAMPAIGN_TYPE];

// ============================================================================
// STAGE PLOTS
// ============================================================================

export const STAGE_PLOT_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  ARCHIVED: "archived",
} as const;

export type StagePlotStatus = (typeof STAGE_PLOT_STATUS)[keyof typeof STAGE_PLOT_STATUS];

// ============================================================================
// EMERGENCY PLANS
// ============================================================================

export const EMERGENCY_PLAN_STATUS = {
  DRAFT: "draft",
  APPROVED: "approved",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type EmergencyPlanStatus = (typeof EMERGENCY_PLAN_STATUS)[keyof typeof EMERGENCY_PLAN_STATUS];

export const EMERGENCY_PLAN_TYPE = {
  EVACUATION: "evacuation",
  MEDICAL: "medical",
  WEATHER: "weather",
  SECURITY: "security",
  FIRE: "fire",
  GENERAL: "general",
} as const;

export type EmergencyPlanType = (typeof EMERGENCY_PLAN_TYPE)[keyof typeof EMERGENCY_PLAN_TYPE];

// ============================================================================
// SEATING CHARTS
// ============================================================================

export const SEATING_CHART_STATUS = {
  DRAFT: "draft",
  IN_PROGRESS: "in_progress",
  FINALIZED: "finalized",
  LOCKED: "locked",
} as const;

export type SeatingChartStatus = (typeof SEATING_CHART_STATUS)[keyof typeof SEATING_CHART_STATUS];

// ============================================================================
// PATCH LISTS
// ============================================================================

export const PATCH_LIST_STATUS = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  ACTIVE: "active",
} as const;

export type PatchListStatus = (typeof PATCH_LIST_STATUS)[keyof typeof PATCH_LIST_STATUS];

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================

export const JOURNAL_ENTRY_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  POSTED: "posted",
  REVERSED: "reversed",
} as const;

export type JournalEntryStatus = (typeof JOURNAL_ENTRY_STATUS)[keyof typeof JOURNAL_ENTRY_STATUS];

export const JOURNAL_ENTRY_TYPE = {
  STANDARD: "standard",
  ADJUSTING: "adjusting",
  CLOSING: "closing",
  REVERSING: "reversing",
} as const;

export type JournalEntryType = (typeof JOURNAL_ENTRY_TYPE)[keyof typeof JOURNAL_ENTRY_TYPE];

// ============================================================================
// INPUT LISTS
// ============================================================================

export const INPUT_LIST_STATUS = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  LOCKED: "locked",
} as const;

export type InputListStatus = (typeof INPUT_LIST_STATUS)[keyof typeof INPUT_LIST_STATUS];

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export const EMAIL_TEMPLATE_STATUS = {
  ACTIVE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export type EmailTemplateStatus = (typeof EMAIL_TEMPLATE_STATUS)[keyof typeof EMAIL_TEMPLATE_STATUS];

// ============================================================================
// PROCEDURES
// ============================================================================

export const PROCEDURE_STATUS = {
  ACTIVE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export type ProcedureStatus = (typeof PROCEDURE_STATUS)[keyof typeof PROCEDURE_STATUS];

// ============================================================================
// RATE CARDS
// ============================================================================

export const RATE_CARD_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  EXPIRED: "expired",
} as const;

export type RateCardStatus = (typeof RATE_CARD_STATUS)[keyof typeof RATE_CARD_STATUS];

// ============================================================================
// PLANNING PROJECTS
// ============================================================================

export const PLANNING_PROJECT_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
} as const;

export type PlanningProjectStatus = (typeof PLANNING_PROJECT_STATUS)[keyof typeof PLANNING_PROJECT_STATUS];

// ============================================================================
// SMS TEMPLATES
// ============================================================================

export const SMS_TEMPLATE_STATUS = {
  ACTIVE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export type SmsTemplateStatus = (typeof SMS_TEMPLATE_STATUS)[keyof typeof SMS_TEMPLATE_STATUS];

// ============================================================================
// PAYROLL
// ============================================================================

export const PAYROLL_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type PayrollStatus = (typeof PAYROLL_STATUS)[keyof typeof PAYROLL_STATUS];

// ============================================================================
// CONTENT
// ============================================================================

export const CONTENT_STATUS = {
  PUBLISHED: "published",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

// ============================================================================
// ARTIST MANAGEMENT
// ============================================================================

export const ARTIST_STATUS = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type ArtistStatus = (typeof ARTIST_STATUS)[keyof typeof ARTIST_STATUS];

// ============================================================================
// TAX REPORTS
// ============================================================================

export const TAX_REPORT_STATUS = {
  FILED: "filed",
  PENDING: "pending",
  OVERDUE: "overdue",
  DRAFT: "draft",
} as const;

export type TaxReportStatus = (typeof TAX_REPORT_STATUS)[keyof typeof TAX_REPORT_STATUS];

// ============================================================================
// SOCIAL POSTS (CONTENT)
// ============================================================================

export const SOCIAL_CONTENT_STATUS = {
  PUBLISHED: "published",
  SCHEDULED: "scheduled",
  DRAFT: "draft",
} as const;

export type SocialContentStatus = (typeof SOCIAL_CONTENT_STATUS)[keyof typeof SOCIAL_CONTENT_STATUS];

// ============================================================================
// RFQ STATUS
// ============================================================================

export const RFQ_STATUS = {
  DRAFT: "draft",
  OPEN: "open",
  CLOSED: "closed",
  AWARDED: "awarded",
  CANCELLED: "cancelled",
} as const;

export type RfqStatus = (typeof RFQ_STATUS)[keyof typeof RFQ_STATUS];

// ============================================================================
// PROGRAM PLANNING STATUS
// ============================================================================

export const PROGRAM_PLANNING_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
} as const;

export type ProgramPlanningStatus = (typeof PROGRAM_PLANNING_STATUS)[keyof typeof PROGRAM_PLANNING_STATUS];

// ============================================================================
// RECONCILIATION
// ============================================================================

export const RECONCILIATION_STATUS = {
  MATCHED: "matched",
  UNMATCHED: "unmatched",
  PARTIAL: "partial",
  DISPUTED: "disputed",
} as const;

export type ReconciliationStatus = (typeof RECONCILIATION_STATUS)[keyof typeof RECONCILIATION_STATUS];

export const RECONCILIATION_SOURCE = {
  BANK: "bank",
  SYSTEM: "system",
} as const;

export type ReconciliationSource = (typeof RECONCILIATION_SOURCE)[keyof typeof RECONCILIATION_SOURCE];

// ============================================================================
// INTEGRATIONS
// ============================================================================

export const INTEGRATION_CATEGORY = {
  ERP: "erp",
  CRM: "crm",
  HRIS: "hris",
  FINOPS: "finops",
  COMMUNICATION: "communication",
  PROJECT: "project",
  CALENDAR: "calendar",
  STORAGE: "storage",
  TICKETING: "ticketing",
  IDENTITY: "identity",
} as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORY)[keyof typeof INTEGRATION_CATEGORY];

export const INTEGRATION_STATUS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
  SYNCING: "syncing",
  PENDING: "pending",
} as const;

export type IntegrationStatus = (typeof INTEGRATION_STATUS)[keyof typeof INTEGRATION_STATUS];

export const INTEGRATION_TIER = {
  CORE: "core",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type IntegrationTier = (typeof INTEGRATION_TIER)[keyof typeof INTEGRATION_TIER];

export const SYNC_DIRECTION = {
  PUSH: "push",
  PULL: "pull",
  BIDIRECTIONAL: "bidirectional",
} as const;

export type SyncDirection = (typeof SYNC_DIRECTION)[keyof typeof SYNC_DIRECTION];

export const SYNC_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
  PARTIAL: "partial",
} as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

// ============================================================================
// PRODUCTIONS (ClickUp SSOT)
// ============================================================================

export const PRODUCTION_STATUS = {
  INTAKE: "intake",
  SCOPING: "scoping",
  PROPOSAL: "proposal",
  AWARDED: "awarded",
  DESIGN: "design",
  FABRICATION: "fabrication",
  DEPLOYMENT: "deployment",
  INSTALLATION: "installation",
  SHOW: "show",
  STRIKE: "strike",
  CLOSEOUT: "closeout",
  ARCHIVED: "archived",
} as const;

export type ProductionStatus = (typeof PRODUCTION_STATUS)[keyof typeof PRODUCTION_STATUS];

export const PRODUCTION_HEALTH = {
  ON_TRACK: "on_track",
  AT_RISK: "at_risk",
  CRITICAL: "critical",
  BLOCKED: "blocked",
} as const;

export type ProductionHealth = (typeof PRODUCTION_HEALTH)[keyof typeof PRODUCTION_HEALTH];

export const PRODUCTION_TYPE = {
  STAGE: "stage",
  SCENIC: "scenic",
  TOURING: "touring",
  INSTALLATION: "installation",
  ACTIVATION: "activation",
  HYBRID: "hybrid",
} as const;

export type ProductionType = (typeof PRODUCTION_TYPE)[keyof typeof PRODUCTION_TYPE];

// ============================================================================
// SHIPMENTS & LOGISTICS (ClickUp SSOT)
// ============================================================================

export const SHIPMENT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PACKED: "packed",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  PARTIALLY_RECEIVED: "partially_received",
  RECEIVED: "received",
  RETURNED: "returned",
  CANCELLED: "cancelled",
} as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUS)[keyof typeof SHIPMENT_STATUS];

export const SHIPMENT_DIRECTION = {
  OUTBOUND: "outbound",
  INBOUND: "inbound",
  TRANSFER: "transfer",
} as const;

export type ShipmentDirection = (typeof SHIPMENT_DIRECTION)[keyof typeof SHIPMENT_DIRECTION];

export const PULL_LIST_STATUS = {
  DRAFT: "draft",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type PullListStatus = (typeof PULL_LIST_STATUS)[keyof typeof PULL_LIST_STATUS];

export const LOAD_PLAN_STATUS = {
  DRAFT: "draft",
  APPROVED: "approved",
  LOADING: "loading",
  LOADED: "loaded",
  VERIFIED: "verified",
} as const;

export type LoadPlanStatus = (typeof LOAD_PLAN_STATUS)[keyof typeof LOAD_PLAN_STATUS];

// ============================================================================
// WORK ORDERS (ClickUp SSOT)
// ============================================================================

export const WORK_ORDER_TYPE = {
  INSTALL: "install",
  STRIKE: "strike",
  MAINTENANCE: "maintenance",
  REPAIR: "repair",
  INSPECTION: "inspection",
} as const;

export type WorkOrderType = (typeof WORK_ORDER_TYPE)[keyof typeof WORK_ORDER_TYPE];

export const WORK_ORDER_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  VERIFIED: "verified",
  CANCELLED: "cancelled",
} as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUS)[keyof typeof WORK_ORDER_STATUS];

// ============================================================================
// PERMITS & COMPLIANCE (ClickUp SSOT)
// ============================================================================

export const PERMIT_STATUS = {
  NOT_REQUIRED: "not_required",
  PENDING: "pending",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  DENIED: "denied",
  EXPIRED: "expired",
  REVOKED: "revoked",
} as const;

export type PermitStatus = (typeof PERMIT_STATUS)[keyof typeof PERMIT_STATUS];

export const PERMIT_TYPE = {
  BUILDING: "building",
  FIRE: "fire",
  ELECTRICAL: "electrical",
  NOISE: "noise",
  STREET_CLOSURE: "street_closure",
  ALCOHOL: "alcohol",
  FOOD: "food",
  PYROTECHNICS: "pyrotechnics",
  TEMPORARY_STRUCTURE: "temporary_structure",
  OTHER: "other",
} as const;

export type PermitType = (typeof PERMIT_TYPE)[keyof typeof PERMIT_TYPE];

export const COI_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type COIStatus = (typeof COI_STATUS)[keyof typeof COI_STATUS];

export const SAFETY_PLAN_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  ARCHIVED: "archived",
} as const;

export type SafetyPlanStatus = (typeof SAFETY_PLAN_STATUS)[keyof typeof SAFETY_PLAN_STATUS];

// ============================================================================
// SITE OPERATIONS (ClickUp SSOT)
// ============================================================================

export const SITE_REPORT_TYPE = {
  DAILY: "daily",
  INCIDENT: "incident",
  SAFETY: "safety",
  PROGRESS: "progress",
  FINAL: "final",
} as const;

export type SiteReportType = (typeof SITE_REPORT_TYPE)[keyof typeof SITE_REPORT_TYPE];

export const SITE_ISSUE_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  ESCALATED: "escalated",
  CLOSED: "closed",
} as const;

export type SiteIssueStatus = (typeof SITE_ISSUE_STATUS)[keyof typeof SITE_ISSUE_STATUS];

export const PUNCH_ITEM_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  PENDING_REVIEW: "pending_review",
  RESOLVED: "resolved",
  DEFERRED: "deferred",
} as const;

export type PunchItemStatus = (typeof PUNCH_ITEM_STATUS)[keyof typeof PUNCH_ITEM_STATUS];

export const INSPECTION_TYPE = {
  QC: "qc",
  SAFETY: "safety",
  CLIENT_WALKTHROUGH: "client_walkthrough",
  FINAL_SIGNOFF: "final_signoff",
  REGULATORY: "regulatory",
} as const;

export type InspectionType = (typeof INSPECTION_TYPE)[keyof typeof INSPECTION_TYPE];

export const INSPECTION_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  PASSED: "passed",
  FAILED: "failed",
  CONDITIONAL: "conditional",
  CANCELLED: "cancelled",
} as const;

export type InspectionStatus = (typeof INSPECTION_STATUS)[keyof typeof INSPECTION_STATUS];

// ============================================================================
// WORKFORCE - AVAILABILITY (ClickUp SSOT)
// ============================================================================

export const AVAILABILITY_STATUS = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  TENTATIVE: "tentative",
  PREFERRED: "preferred",
  BLACKOUT: "blackout",
} as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUS)[keyof typeof AVAILABILITY_STATUS];

// ============================================================================
// WORKFORCE - TRAVEL (ClickUp SSOT)
// ============================================================================

export const TRAVEL_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  BOOKED: "booked",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TravelStatus = (typeof TRAVEL_STATUS)[keyof typeof TRAVEL_STATUS];

export const FLIGHT_STATUS = {
  BOOKED: "booked",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type FlightStatus = (typeof FLIGHT_STATUS)[keyof typeof FLIGHT_STATUS];

export const HOTEL_STATUS = {
  BOOKED: "booked",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
} as const;

export type HotelStatus = (typeof HOTEL_STATUS)[keyof typeof HOTEL_STATUS];

// ============================================================================
// WORKFORCE - RECRUITMENT (ClickUp SSOT)
// ============================================================================

export const CANDIDATE_STATUS = {
  NEW: "new",
  SCREENING: "screening",
  PHONE_SCREEN: "phone_screen",
  INTERVIEW: "interview",
  ASSESSMENT: "assessment",
  REFERENCE_CHECK: "reference_check",
  OFFER: "offer",
  HIRED: "hired",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type CandidateStatus = (typeof CANDIDATE_STATUS)[keyof typeof CANDIDATE_STATUS];

export const JOB_REQUISITION_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  OPEN: "open",
  ON_HOLD: "on_hold",
  FILLED: "filled",
  CANCELLED: "cancelled",
} as const;

export type JobRequisitionStatus = (typeof JOB_REQUISITION_STATUS)[keyof typeof JOB_REQUISITION_STATUS];

export const INTERVIEW_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type InterviewStatus = (typeof INTERVIEW_STATUS)[keyof typeof INTERVIEW_STATUS];

export const INTERVIEW_RECOMMENDATION = {
  STRONG_YES: "strong_yes",
  YES: "yes",
  NEUTRAL: "neutral",
  NO: "no",
  STRONG_NO: "strong_no",
} as const;

export type InterviewRecommendation = (typeof INTERVIEW_RECOMMENDATION)[keyof typeof INTERVIEW_RECOMMENDATION];

export const OFFER_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  SENT: "sent",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
  WITHDRAWN: "withdrawn",
} as const;

export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];

// ============================================================================
// WORKFORCE - PERFORMANCE (ClickUp SSOT)
// ============================================================================

export const GOAL_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type GoalStatus = (typeof GOAL_STATUS)[keyof typeof GOAL_STATUS];

export const PIP_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  EXTENDED: "extended",
  COMPLETED_SUCCESS: "completed_success",
  COMPLETED_FAILURE: "completed_failure",
  CANCELLED: "cancelled",
} as const;

export type PIPStatus = (typeof PIP_STATUS)[keyof typeof PIP_STATUS];

export const FEEDBACK_VISIBILITY = {
  PRIVATE: "private",
  MANAGER: "manager",
  PUBLIC: "public",
} as const;

export type FeedbackVisibility = (typeof FEEDBACK_VISIBILITY)[keyof typeof FEEDBACK_VISIBILITY];

// ============================================================================
// WORKFORCE - SAFETY (ClickUp SSOT)
// ============================================================================

export const NEAR_MISS_STATUS = {
  REPORTED: "reported",
  INVESTIGATING: "investigating",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type NearMissStatus = (typeof NEAR_MISS_STATUS)[keyof typeof NEAR_MISS_STATUS];

export const SAFETY_OBSERVATION_STATUS = {
  OPEN: "open",
  ACKNOWLEDGED: "acknowledged",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type SafetyObservationStatus = (typeof SAFETY_OBSERVATION_STATUS)[keyof typeof SAFETY_OBSERVATION_STATUS];

export const WORKERS_COMP_STATUS = {
  FILED: "filed",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  DENIED: "denied",
  SETTLED: "settled",
  CLOSED: "closed",
} as const;

export type WorkersCompStatus = (typeof WORKERS_COMP_STATUS)[keyof typeof WORKERS_COMP_STATUS];

// ============================================================================
// ASSETS - FLEET (ClickUp SSOT)
// ============================================================================

export const VEHICLE_STATUS = {
  AVAILABLE: "available",
  IN_USE: "in_use",
  MAINTENANCE: "maintenance",
  RETIRED: "retired",
} as const;

export type VehicleStatus = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

export const GPS_DEVICE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
  RETIRED: "retired",
} as const;

export type GPSDeviceStatus = (typeof GPS_DEVICE_STATUS)[keyof typeof GPS_DEVICE_STATUS];

export const MISSING_ITEM_STATUS = {
  MISSING: "missing",
  SEARCHING: "searching",
  FOUND: "found",
  WRITTEN_OFF: "written_off",
} as const;

export type MissingItemStatus = (typeof MISSING_ITEM_STATUS)[keyof typeof MISSING_ITEM_STATUS];

// ============================================================================
// RUN OF SHOW (ClickUp SSOT)
// ============================================================================

export const RUN_OF_SHOW_STATUS = {
  DRAFT: "draft",
  APPROVED: "approved",
  ACTIVE: "active",
  LOCKED: "locked",
  ARCHIVED: "archived",
} as const;

export type RunOfShowStatus = (typeof RUN_OF_SHOW_STATUS)[keyof typeof RUN_OF_SHOW_STATUS];

export const ROS_ELEMENT_STATUS = {
  PENDING: "pending",
  STANDBY: "standby",
  ACTIVE: "active",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;

export type ROSElementStatus = (typeof ROS_ELEMENT_STATUS)[keyof typeof ROS_ELEMENT_STATUS];

