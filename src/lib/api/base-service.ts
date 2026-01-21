/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Base API Service
 * Provides common CRUD operations with Supabase integration
 * 
 * Note: This service uses type assertions to work with dynamic table names.
 * For type-safe operations, use the typed service implementations.
 * 
 * TypeScript checking is disabled due to Supabase's strict generated types
 * not supporting dynamic table names in generic services.
 */

import { createClient } from "@/lib/supabase/client";
import type {
  ApiResponse,
  ApiError,
  ListParams,
  ListResponse,
  PaginationParams,
} from "./types";

export type SupabaseClient = ReturnType<typeof createClient>;

export interface ServiceConfig {
  table: string;
  primaryKey?: string;
  softDelete?: boolean;
  defaultSelect?: string;
  defaultOrder?: { column: string; ascending: boolean };
}

export abstract class BaseService<T extends { id: string }> {
  protected supabase: SupabaseClient;
  protected config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.supabase = createClient();
    this.config = {
      primaryKey: "id",
      softDelete: false,
      defaultSelect: "*",
      ...config,
    };
  }

  // Helper to get typed table reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected table(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.supabase as any).from(this.config.table);
  }

  protected handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        code: "INTERNAL_ERROR",
        message: error.message,
      };
    }
    return {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
    };
  }

  protected buildPagination(params: PaginationParams): { from: number; to: number } {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
  }

  async list(params: ListParams = {}): Promise<ApiResponse<ListResponse<T>>> {
    try {
      const { from, to } = this.buildPagination(params);
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;

      let query = this.table()
        .select(params.include?.join(",") || this.config.defaultSelect || "*", {
          count: "exact",
        });

      // Apply soft delete filter if enabled
      if (this.config.softDelete) {
        query = query.is("deleted_at", null);
      }

      // Apply search filter
      if (params.search) {
        query = query.or(this.buildSearchFilter(params.search));
      }

      // Apply custom filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply sorting
      if (params.sortBy) {
        query = query.order(params.sortBy, {
          ascending: params.sortOrder !== "desc",
        });
      } else if (this.config.defaultOrder) {
        query = query.order(this.config.defaultOrder.column, {
          ascending: this.config.defaultOrder.ascending,
        });
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        data: {
          items: (data as T[]) || [],
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async getById(id: string, include?: string[]): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await this.table()
        .select(include?.join(",") || this.config.defaultSelect || "*")
        .eq(this.config.primaryKey || "id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return {
            success: false,
            error: { code: "NOT_FOUND", message: `${this.config.table} not found` },
          };
        }
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      return { success: true, data: data as T };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<T>> {
    try {
      const { data: created, error } = await this.table()
        .insert(data)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      return { success: true, data: created as T };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data: updated, error } = await this.table()
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq(this.config.primaryKey || "id", id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      return { success: true, data: updated as T };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      if (this.config.softDelete) {
        const { error } = await this.table()
          .update({ deleted_at: new Date().toISOString() })
          .eq(this.config.primaryKey || "id", id);

        if (error) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
      } else {
        const { error } = await this.table()
          .delete()
          .eq(this.config.primaryKey || "id", id);

        if (error) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async bulkCreate(items: Array<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<ApiResponse<T[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.config.table)
        .insert(items)
        .select();

      if (error) {
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      return { success: true, data: data as T[] };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async bulkUpdate(
    ids: string[],
    data: Partial<T>
  ): Promise<ApiResponse<T[]>> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.config.table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .in(this.config.primaryKey || "id", ids)
        .select();

      if (error) {
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      return { success: true, data: updated as T[] };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    try {
      if (this.config.softDelete) {
        const { error } = await this.table()
          .update({ deleted_at: new Date().toISOString() })
          .in(this.config.primaryKey || "id", ids);

        if (error) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
      } else {
        const { error } = await this.table()
          .delete()
          .in(this.config.primaryKey || "id", ids);

        if (error) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async count(filters?: Record<string, unknown>): Promise<ApiResponse<number>> {
    try {
      let query = this.supabase
        .from(this.config.table)
        .select("*", { count: "exact", head: true });

      if (this.config.softDelete) {
        query = query.is("deleted_at", null);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        return {
          success: false,
          error: { code: error.code, message: error.message },
        };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.getById(id);
    return result.success;
  }

  protected buildSearchFilter(search: string): string {
    // Override in subclasses to specify searchable columns
    return `name.ilike.%${search}%`;
  }
}

// Utility function to create typed services
export function createService<T extends { id: string }>(
  config: ServiceConfig
): BaseService<T> {
  return new (class extends BaseService<T> {
    constructor() {
      super(config);
    }
  })();
}
