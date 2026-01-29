/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
/**
 * Employee Profiles API Service
 * CRUD operations for employee HR data extending users
 */

import { BaseService } from "../base-service";
import type { EmployeeProfile } from "@/lib/schema/consolidated-types";

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE PROFILES SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class EmployeeProfileService extends BaseService<EmployeeProfile> {
  constructor() {
    super({
      table: "employee_profiles",
      defaultOrder: { column: "hire_date", ascending: false },
    });
  }

  protected buildSearchFilter(search: string): string {
    return `employee_number.ilike.%${search}%`;
  }

  async getByUserId(userId: string, organizationId: string) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { success: false, error: { code: "NOT_FOUND", message: "Employee profile not found" } };
        }
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async listByDepartment(departmentId: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        department_id: departmentId,
        employment_status: "active",
      },
    });
  }

  async listByManager(managerId: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        manager_id: managerId,
        employment_status: "active",
      },
    });
  }

  async listByStatus(status: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        employment_status: status,
      },
    });
  }

  async listByEmploymentType(employmentType: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        employment_type: employmentType,
        employment_status: "active",
      },
    });
  }

  async getWithUser(id: string) {
    try {
      const { data, error } = await this.table()
        .select(`
          *,
          users!employee_profiles_user_id_fkey(
            id,
            email,
            first_name,
            last_name,
            avatar_url,
            phone
          ),
          departments(id, name),
          positions(id, title),
          locations(id, name)
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

  async terminate(id: string, terminationDate: string) {
    return this.update(id, {
      employment_status: "terminated",
      termination_date: terminationDate,
    } as Partial<EmployeeProfile>);
  }

  async updateCompensation(id: string, hourlyRate?: number, salary?: number) {
    const updates: Partial<EmployeeProfile> = {};
    if (hourlyRate !== undefined) updates.hourly_rate = hourlyRate;
    if (salary !== undefined) updates.salary = salary;
    return this.update(id, updates);
  }

  async updateManager(id: string, managerId: string) {
    return this.update(id, {
      manager_id: managerId,
    } as Partial<EmployeeProfile>);
  }

  async updateDepartment(id: string, departmentId: string, positionId?: string) {
    const updates: Partial<EmployeeProfile> = {
      department_id: departmentId,
    };
    if (positionId) updates.position_id = positionId;
    return this.update(id, updates);
  }

  async getHeadcount(organizationId: string) {
    try {
      const { count, error } = await this.table()
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("employment_status", "active");

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async getHeadcountByDepartment(organizationId: string) {
    try {
      // Manual query to get headcount by department
      const { data: profiles, error: profileError } = await this.table()
        .select("department_id")
        .eq("organization_id", organizationId)
        .eq("employment_status", "active");

      if (profileError) {
        return { success: false, error: { code: profileError.code, message: profileError.message } };
      }

      const counts: Record<string, number> = {};
      for (const profile of profiles || []) {
        const deptId = profile.department_id || "unassigned";
        counts[deptId] = (counts[deptId] || 0) + 1;
      }

      return { success: true, data: counts };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async getAnniversaries(organizationId: string, month: number) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .eq("employment_status", "active")
        .not("hire_date", "is", null);

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      // Filter by month in application code since Supabase doesn't support EXTRACT easily
      const filtered = (data || []).filter((profile: EmployeeProfile) => {
        if (!profile.hire_date) return false;
        const hireMonth = new Date(profile.hire_date).getMonth() + 1;
        return hireMonth === month;
      });

      return { success: true, data: { items: filtered, pagination: { total: filtered.length } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }
}

export const employeeProfileService = new EmployeeProfileService();
