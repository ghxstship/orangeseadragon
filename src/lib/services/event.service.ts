/**
 * Event Service
 * Handles event management operations
 */

import { createClient } from "@supabase/supabase-js";

export interface Event {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: "draft" | "confirmed" | "in_progress" | "completed" | "cancelled";
  startDate: Date;
  endDate: Date;
  venueId?: string;
  venue?: Venue;
  capacity?: number;
  budget?: number;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
}

export interface CreateEventData {
  name: string;
  description?: string;
  type: string;
  startDate: Date;
  endDate: Date;
  venueId?: string;
  capacity?: number;
  budget?: number;
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  type?: string;
  status?: Event["status"];
  startDate?: Date;
  endDate?: Date;
  venueId?: string;
  capacity?: number;
  budget?: number;
}

export interface EventFilters {
  status?: Event["status"];
  type?: string;
  venueId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class EventService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getEvents(
    filters?: EventFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Event>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("events")
      .select("*, venue:venues(*)", { count: "exact" });

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.venueId) {
      query = query.eq("venue_id", filters.venueId);
    }
    if (filters?.startDate) {
      query = query.gte("start_date", filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte("end_date", filters.endDate.toISOString());
    }
    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = pagination?.sortBy ?? "start_date";
    const sortDirection = pagination?.sortDirection ?? "desc";
    query = query.order(sortBy, { ascending: sortDirection === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: (data ?? []).map(this.mapEvent),
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  }

  async getEvent(id: string): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from("events")
      .select("*, venue:venues(*)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }

    return this.mapEvent(data);
  }

  async createEvent(eventData: CreateEventData, userId: string): Promise<Event> {
    const { data, error } = await this.supabase
      .from("events")
      .insert({
        name: eventData.name,
        description: eventData.description,
        type: eventData.type,
        status: "draft",
        start_date: eventData.startDate.toISOString(),
        end_date: eventData.endDate.toISOString(),
        venue_id: eventData.venueId,
        capacity: eventData.capacity,
        budget: eventData.budget,
        created_by: userId,
      })
      .select("*, venue:venues(*)")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapEvent(data);
  }

  async updateEvent(id: string, updates: UpdateEventData): Promise<Event> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString();
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate.toISOString();
    if (updates.venueId !== undefined) updateData.venue_id = updates.venueId;
    if (updates.capacity !== undefined) updateData.capacity = updates.capacity;
    if (updates.budget !== undefined) updateData.budget = updates.budget;

    const { data, error } = await this.supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select("*, venue:venues(*)")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapEvent(data);
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async duplicateEvent(id: string, userId: string): Promise<Event> {
    const original = await this.getEvent(id);
    if (!original) {
      throw new Error("Event not found");
    }

    return this.createEvent(
      {
        name: `${original.name} (Copy)`,
        description: original.description,
        type: original.type,
        startDate: original.startDate,
        endDate: original.endDate,
        venueId: original.venueId,
        capacity: original.capacity,
        budget: original.budget,
      },
      userId
    );
  }

  async updateEventStatus(id: string, status: Event["status"]): Promise<Event> {
    return this.updateEvent(id, { status });
  }

  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from("events")
      .select("*, venue:venues(*)")
      .gte("start_date", new Date().toISOString())
      .in("status", ["confirmed", "draft"])
      .order("start_date", { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(this.mapEvent);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from("events")
      .select("*, venue:venues(*)")
      .gte("start_date", startDate.toISOString())
      .lte("end_date", endDate.toISOString())
      .order("start_date", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(this.mapEvent);
  }

  async getEventStats(): Promise<{
    total: number;
    draft: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    const { data, error } = await this.supabase
      .from("events")
      .select("status")
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }

    const stats = {
      total: data?.length ?? 0,
      draft: 0,
      confirmed: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const event of data ?? []) {
      switch (event.status) {
        case "draft":
          stats.draft++;
          break;
        case "confirmed":
          stats.confirmed++;
          break;
        case "in_progress":
          stats.inProgress++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
      }
    }

    return stats;
  }

  private mapEvent(data: Record<string, unknown>): Event {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string | undefined,
      type: data.type as string,
      status: data.status as Event["status"],
      startDate: new Date(data.start_date as string),
      endDate: new Date(data.end_date as string),
      venueId: data.venue_id as string | undefined,
      venue: data.venue ? this.mapVenue(data.venue as Record<string, unknown>) : undefined,
      capacity: data.capacity as number | undefined,
      budget: data.budget as number | undefined,
      organizationId: data.organization_id as string,
      createdBy: data.created_by as string,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }

  private mapVenue(data: Record<string, unknown>): Venue {
    return {
      id: data.id as string,
      name: data.name as string,
      address: data.address as string,
      city: data.city as string,
      capacity: data.capacity as number,
    };
  }
}

export const eventService = new EventService();
