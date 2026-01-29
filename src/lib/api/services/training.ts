/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Tables not yet in generated types until migration runs
/**
 * Training API Services
 * CRUD operations for training programs, assignments, sessions, and attendees
 */

import { BaseService } from "../base-service";
import type {
  TrainingProgram,
  TrainingAssignment,
  TrainingSession,
  TrainingSessionAttendee,
} from "@/lib/schema/consolidated-types";

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING PROGRAMS SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class TrainingProgramService extends BaseService<TrainingProgram> {
  constructor() {
    super({
      table: "training_programs",
      defaultOrder: { column: "name", ascending: true },
    });
  }

  protected buildSearchFilter(search: string): string {
    return `name.ilike.%${search}%,description.ilike.%${search}%`;
  }

  async listByType(programType: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        program_type: programType,
        is_active: true,
      },
    });
  }

  async listRequired(organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        is_required: true,
        is_active: true,
      },
    });
  }

  async getWithAssignments(id: string) {
    try {
      const { data, error } = await this.table()
        .select(`
          *,
          training_assignments(
            id,
            user_id,
            status,
            due_date,
            completed_at,
            score,
            passed
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }
}

export const trainingProgramService = new TrainingProgramService();

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING ASSIGNMENTS SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class TrainingAssignmentService extends BaseService<TrainingAssignment> {
  constructor() {
    super({
      table: "training_assignments",
      defaultOrder: { column: "due_date", ascending: true },
    });
  }

  async listByUser(userId: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        user_id: userId,
      },
    });
  }

  async listByProgram(programId: string) {
    return this.list({
      filters: {
        program_id: programId,
      },
    });
  }

  async listOverdue(organizationId: string) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .in("status", ["assigned", "in_progress"])
        .lt("due_date", new Date().toISOString().split("T")[0])
        .order("due_date", { ascending: true });

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data: { items: data || [], pagination: { total: data?.length || 0 } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async markStarted(id: string) {
    return this.update(id, {
      status: "in_progress",
      started_at: new Date().toISOString(),
    } as Partial<TrainingAssignment>);
  }

  async markCompleted(id: string, score?: number, passed?: boolean) {
    return this.update(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
      score,
      passed,
    } as Partial<TrainingAssignment>);
  }

  async assignToUser(programId: string, userId: string, organizationId: string, dueDate?: string, assignedBy?: string) {
    return this.create({
      organization_id: organizationId,
      program_id: programId,
      user_id: userId,
      assigned_by: assignedBy,
      due_date: dueDate,
      status: "assigned",
      attempts: 0,
    } as any);
  }

  async bulkAssign(programId: string, userIds: string[], organizationId: string, dueDate?: string, assignedBy?: string) {
    const assignments = userIds.map((userId) => ({
      organization_id: organizationId,
      program_id: programId,
      user_id: userId,
      assigned_by: assignedBy,
      due_date: dueDate,
      status: "assigned",
      attempts: 0,
    }));

    return this.bulkCreate(assignments as any);
  }
}

export const trainingAssignmentService = new TrainingAssignmentService();

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING SESSIONS SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class TrainingSessionService extends BaseService<TrainingSession> {
  constructor() {
    super({
      table: "training_sessions",
      defaultOrder: { column: "scheduled_date", ascending: true },
    });
  }

  protected buildSearchFilter(search: string): string {
    return `name.ilike.%${search}%,description.ilike.%${search}%`;
  }

  async listUpcoming(organizationId: string, limit = 10) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .in("status", ["scheduled"])
        .order("scheduled_date", { ascending: true })
        .limit(limit);

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data: { items: data || [], pagination: { total: data?.length || 0 } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async listByProgram(programId: string) {
    return this.list({
      filters: {
        program_id: programId,
      },
    });
  }

  async listByInstructor(instructorId: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        instructor_id: instructorId,
      },
    });
  }

  async getWithAttendees(id: string) {
    try {
      const { data, error } = await this.table()
        .select(`
          *,
          training_session_attendees(
            id,
            user_id,
            status,
            checked_in_at,
            checked_out_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async updateEnrolledCount(id: string) {
    try {
      const { count, error: countError } = await this.supabase
        .from("training_session_attendees")
        .select("*", { count: "exact", head: true })
        .eq("session_id", id)
        .in("status", ["registered", "attended"]);

      if (countError) {
        return { success: false, error: { code: countError.code, message: countError.message } };
      }

      return this.update(id, { enrolled_count: count || 0 } as Partial<TrainingSession>);
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }
}

export const trainingSessionService = new TrainingSessionService();

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING SESSION ATTENDEES SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class TrainingSessionAttendeeService extends BaseService<TrainingSessionAttendee> {
  constructor() {
    super({
      table: "training_session_attendees",
      defaultOrder: { column: "created_at", ascending: false },
    });
  }

  async listBySession(sessionId: string) {
    return this.list({
      filters: {
        session_id: sessionId,
      },
    });
  }

  async listByUser(userId: string) {
    return this.list({
      filters: {
        user_id: userId,
      },
    });
  }

  async register(sessionId: string, userId: string, assignmentId?: string) {
    const result = await this.create({
      session_id: sessionId,
      user_id: userId,
      assignment_id: assignmentId,
      status: "registered",
    } as any);

    if (result.success) {
      await trainingSessionService.updateEnrolledCount(sessionId);
    }

    return result;
  }

  async checkIn(id: string) {
    return this.update(id, {
      status: "attended",
      checked_in_at: new Date().toISOString(),
    } as Partial<TrainingSessionAttendee>);
  }

  async checkOut(id: string) {
    return this.update(id, {
      checked_out_at: new Date().toISOString(),
    } as Partial<TrainingSessionAttendee>);
  }

  async cancel(id: string, sessionId: string) {
    const result = await this.update(id, {
      status: "cancelled",
    } as Partial<TrainingSessionAttendee>);

    if (result.success) {
      await trainingSessionService.updateEnrolledCount(sessionId);
    }

    return result;
  }

  async markNoShow(id: string) {
    return this.update(id, {
      status: "no_show",
    } as Partial<TrainingSessionAttendee>);
  }
}

export const trainingSessionAttendeeService = new TrainingSessionAttendeeService();

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIENCE EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const trainingServices = {
  programs: trainingProgramService,
  assignments: trainingAssignmentService,
  sessions: trainingSessionService,
  attendees: trainingSessionAttendeeService,
};
