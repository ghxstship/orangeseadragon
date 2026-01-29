/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Performance Review API Services
 * CRUD operations for performance reviews and competencies
 */

import { BaseService } from "../base-service";
import type {
  PerformanceReview,
  PerformanceReviewCompetency,
} from "@/lib/schema/consolidated-types";

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE REVIEWS SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class PerformanceReviewService extends BaseService<PerformanceReview> {
  constructor() {
    super({
      table: "performance_reviews",
      defaultOrder: { column: "review_period_end", ascending: false },
    });
  }

  async listByEmployee(employeeId: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        employee_id: employeeId,
      },
    });
  }

  async listByReviewer(reviewerId: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        reviewer_id: reviewerId,
      },
    });
  }

  async listPending(organizationId: string) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .in("status", ["draft", "self_review", "manager_review", "calibration"])
        .order("review_period_end", { ascending: true });

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data: { items: data || [], pagination: { total: data?.length || 0 } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async listByPeriod(organizationId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .gte("review_period_start", startDate)
        .lte("review_period_end", endDate)
        .order("review_period_end", { ascending: false });

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data: { items: data || [], pagination: { total: data?.length || 0 } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async getWithCompetencies(id: string) {
    try {
      const { data, error } = await this.table()
        .select(`
          *,
          performance_review_competencies(
            id,
            competency_name,
            competency_category,
            self_rating,
            manager_rating,
            weight,
            self_comments,
            manager_comments
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

  async startSelfReview(id: string) {
    return this.update(id, {
      status: "self_review",
    } as Partial<PerformanceReview>);
  }

  async completeSelfReview(id: string, employeeComments?: string) {
    return this.update(id, {
      status: "manager_review",
      self_review_completed_at: new Date().toISOString(),
      employee_comments: employeeComments,
    } as Partial<PerformanceReview>);
  }

  async completeManagerReview(id: string, overallRating: number, managerComments?: string) {
    return this.update(id, {
      status: "completed",
      manager_review_completed_at: new Date().toISOString(),
      overall_rating: overallRating,
      manager_comments: managerComments,
    } as Partial<PerformanceReview>);
  }

  async acknowledge(id: string) {
    return this.update(id, {
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
    } as Partial<PerformanceReview>);
  }

  async createReviewCycle(
    organizationId: string,
    reviewType: string,
    periodStart: string,
    periodEnd: string,
    employeeReviewerPairs: Array<{ employeeId: string; reviewerId: string }>,
    createdBy?: string
  ) {
    const reviews = employeeReviewerPairs.map(({ employeeId, reviewerId }) => ({
      organization_id: organizationId,
      employee_id: employeeId,
      reviewer_id: reviewerId,
      review_period_start: periodStart,
      review_period_end: periodEnd,
      review_type: reviewType,
      status: "draft",
      created_by: createdBy,
    }));

    return this.bulkCreate(reviews as any);
  }
}

export const performanceReviewService = new PerformanceReviewService();

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE REVIEW COMPETENCIES SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class PerformanceReviewCompetencyService extends BaseService<PerformanceReviewCompetency> {
  constructor() {
    super({
      table: "performance_review_competencies",
      defaultOrder: { column: "competency_category", ascending: true },
    });
  }

  async listByReview(reviewId: string) {
    return this.list({
      filters: {
        review_id: reviewId,
      },
    });
  }

  async updateSelfRating(id: string, rating: number, comments?: string) {
    return this.update(id, {
      self_rating: rating,
      self_comments: comments,
    } as Partial<PerformanceReviewCompetency>);
  }

  async updateManagerRating(id: string, rating: number, comments?: string) {
    return this.update(id, {
      manager_rating: rating,
      manager_comments: comments,
    } as Partial<PerformanceReviewCompetency>);
  }

  async bulkCreateForReview(
    reviewId: string,
    competencies: Array<{
      name: string;
      category?: string;
      weight?: number;
    }>
  ) {
    const items = competencies.map((c) => ({
      review_id: reviewId,
      competency_name: c.name,
      competency_category: c.category,
      weight: c.weight || 1.0,
    }));

    return this.bulkCreate(items as any);
  }

  async calculateWeightedAverage(reviewId: string, ratingType: "self" | "manager") {
    try {
      const { data, error } = await this.table()
        .select("self_rating, manager_rating, weight")
        .eq("review_id", reviewId);

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      if (!data || data.length === 0) {
        return { success: true, data: null };
      }

      const ratingField = ratingType === "self" ? "self_rating" : "manager_rating";
      let totalWeight = 0;
      let weightedSum = 0;

      for (const item of data) {
        const rating = item[ratingField];
        const weight = item.weight || 1;
        if (rating !== null && rating !== undefined) {
          weightedSum += rating * weight;
          totalWeight += weight;
        }
      }

      const average = totalWeight > 0 ? weightedSum / totalWeight : null;
      return { success: true, data: average };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }
}

export const performanceReviewCompetencyService = new PerformanceReviewCompetencyService();

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIENCE EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const performanceServices = {
  reviews: performanceReviewService,
  competencies: performanceReviewCompetencyService,
};
