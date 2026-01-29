/**
 * ATLVS Consolidated Types
 * 
 * TypeScript types for tables added in 00035_3nf_ssot_consolidation.sql
 * These types complement the existing schema types and provide SSOT for:
 * - Catalog Items (product master)
 * - Employee Profiles (HR data extending users)
 * - Training System (programs, assignments, sessions)
 * - Performance Reviews
 */

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG ITEMS
// ─────────────────────────────────────────────────────────────────────────────

export interface CatalogItem {
  id: string;
  organization_id: string;
  category_id?: string;
  sku: string;
  name: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  unit_of_measure: string;
  default_unit_cost?: number;
  default_rental_rate?: number;
  currency: string;
  weight_lbs?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'in' | 'ft' | 'cm' | 'm';
  };
  specifications?: Record<string, string | number | boolean | null>;
  image_url?: string;
  is_rentable: boolean;
  is_purchasable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type CatalogItemInsert = Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>;
export type CatalogItemUpdate = Partial<CatalogItemInsert>;

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE PROFILES
// ─────────────────────────────────────────────────────────────────────────────

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern' | 'seasonal';
export type EmploymentStatus = 'active' | 'on_leave' | 'terminated' | 'suspended';
export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface EmployeeProfile {
  id: string;
  organization_id: string;
  user_id: string;
  employee_number?: string;
  hire_date?: string;
  termination_date?: string;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  department_id?: string;
  position_id?: string;
  manager_id?: string;
  work_location_id?: string;
  hourly_rate?: number;
  salary?: number;
  pay_frequency: PayFrequency;
  currency: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  shirt_size?: string;
  dietary_restrictions?: string;
  notes?: string;
  metadata?: Record<string, string | number | boolean | null>;
  created_at: string;
  updated_at: string;
}

export type EmployeeProfileInsert = Omit<EmployeeProfile, 'id' | 'created_at' | 'updated_at'>;
export type EmployeeProfileUpdate = Partial<EmployeeProfileInsert>;

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export type TrainingProgramType = 'course' | 'certification' | 'onboarding' | 'compliance' | 'skill_development';
export type TrainingAssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'expired' | 'waived';
export type TrainingSessionType = 'in_person' | 'virtual' | 'self_paced' | 'hybrid';
export type TrainingSessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AttendeeStatus = 'registered' | 'attended' | 'no_show' | 'cancelled';

export interface TrainingProgram {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  program_type: TrainingProgramType;
  duration_hours?: number;
  is_required: boolean;
  required_for_departments?: string[];
  required_for_positions?: string[];
  certification_type_id?: string;
  passing_score?: number;
  validity_months?: number;
  content_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type TrainingProgramInsert = Omit<TrainingProgram, 'id' | 'created_at' | 'updated_at'>;
export type TrainingProgramUpdate = Partial<TrainingProgramInsert>;

export interface TrainingAssignment {
  id: string;
  organization_id: string;
  program_id: string;
  user_id: string;
  assigned_by?: string;
  assigned_at: string;
  due_date?: string;
  status: TrainingAssignmentStatus;
  started_at?: string;
  completed_at?: string;
  score?: number;
  passed?: boolean;
  attempts: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TrainingAssignmentInsert = Omit<TrainingAssignment, 'id' | 'created_at' | 'updated_at' | 'assigned_at'>;
export type TrainingAssignmentUpdate = Partial<TrainingAssignmentInsert>;

export interface TrainingSession {
  id: string;
  organization_id: string;
  program_id: string;
  name: string;
  description?: string;
  session_type: TrainingSessionType;
  instructor_id?: string;
  location_id?: string;
  virtual_meeting_url?: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  capacity?: number;
  enrolled_count: number;
  status: TrainingSessionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type TrainingSessionInsert = Omit<TrainingSession, 'id' | 'created_at' | 'updated_at' | 'enrolled_count'>;
export type TrainingSessionUpdate = Partial<TrainingSessionInsert>;

export interface TrainingSessionAttendee {
  id: string;
  session_id: string;
  user_id: string;
  assignment_id?: string;
  status: AttendeeStatus;
  checked_in_at?: string;
  checked_out_at?: string;
  notes?: string;
  created_at: string;
}

export type TrainingSessionAttendeeInsert = Omit<TrainingSessionAttendee, 'id' | 'created_at'>;
export type TrainingSessionAttendeeUpdate = Partial<TrainingSessionAttendeeInsert>;

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

export type PerformanceReviewType = 'annual' | 'semi_annual' | 'quarterly' | 'probationary' | '90_day' | 'project';
export type PerformanceReviewStatus = 'draft' | 'self_review' | 'manager_review' | 'calibration' | 'completed' | 'acknowledged';

export interface PerformanceReview {
  id: string;
  organization_id: string;
  employee_id: string;
  reviewer_id: string;
  review_period_start: string;
  review_period_end: string;
  review_type: PerformanceReviewType;
  status: PerformanceReviewStatus;
  overall_rating?: number;
  strengths?: string;
  areas_for_improvement?: string;
  goals_achieved?: string;
  goals_for_next_period?: string;
  manager_comments?: string;
  employee_comments?: string;
  self_review_completed_at?: string;
  manager_review_completed_at?: string;
  acknowledged_at?: string;
  next_review_date?: string;
  metadata?: Record<string, string | number | boolean | null>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type PerformanceReviewInsert = Omit<PerformanceReview, 'id' | 'created_at' | 'updated_at'>;
export type PerformanceReviewUpdate = Partial<PerformanceReviewInsert>;

export interface PerformanceReviewCompetency {
  id: string;
  review_id: string;
  competency_name: string;
  competency_category?: string;
  self_rating?: number;
  manager_rating?: number;
  weight: number;
  self_comments?: string;
  manager_comments?: string;
  created_at: string;
  updated_at: string;
}

export type PerformanceReviewCompetencyInsert = Omit<PerformanceReviewCompetency, 'id' | 'created_at' | 'updated_at'>;
export type PerformanceReviewCompetencyUpdate = Partial<PerformanceReviewCompetencyInsert>;

// ─────────────────────────────────────────────────────────────────────────────
// VENDORS VIEW TYPE (maps to companies with company_type = 'vendor')
// ─────────────────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  organization_id: string;
  name: string;
  legal_name?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
  tags?: string[];
  custom_fields?: Record<string, string | number | boolean | null>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY REGISTRY (for SSOT entity configuration)
// ─────────────────────────────────────────────────────────────────────────────

export const CONSOLIDATED_ENTITIES = {
  catalog_items: {
    table: 'catalog_items',
    label: 'Catalog Item',
    labelPlural: 'Catalog Items',
    icon: 'Package',
    primaryField: 'name',
    searchFields: ['name', 'sku', 'manufacturer', 'model'],
  },
  employee_profiles: {
    table: 'employee_profiles',
    label: 'Employee Profile',
    labelPlural: 'Employee Profiles',
    icon: 'UserCog',
    primaryField: 'employee_number',
    searchFields: ['employee_number'],
  },
  training_programs: {
    table: 'training_programs',
    label: 'Training Program',
    labelPlural: 'Training Programs',
    icon: 'GraduationCap',
    primaryField: 'name',
    searchFields: ['name', 'description'],
  },
  training_assignments: {
    table: 'training_assignments',
    label: 'Training Assignment',
    labelPlural: 'Training Assignments',
    icon: 'ClipboardCheck',
    primaryField: 'id',
    searchFields: [],
  },
  training_sessions: {
    table: 'training_sessions',
    label: 'Training Session',
    labelPlural: 'Training Sessions',
    icon: 'Calendar',
    primaryField: 'name',
    searchFields: ['name', 'description'],
  },
  performance_reviews: {
    table: 'performance_reviews',
    label: 'Performance Review',
    labelPlural: 'Performance Reviews',
    icon: 'Star',
    primaryField: 'id',
    searchFields: [],
  },
  vendors: {
    table: 'vendors',
    label: 'Vendor',
    labelPlural: 'Vendors',
    icon: 'Building',
    primaryField: 'name',
    searchFields: ['name', 'legal_name', 'email'],
    isView: true,
    sourceTable: 'companies',
    sourceFilter: { company_type: 'vendor' },
  },
} as const;

export type ConsolidatedEntityKey = keyof typeof CONSOLIDATED_ENTITIES;
