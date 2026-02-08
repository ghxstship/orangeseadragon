/**
 * Event Template Service
 * 
 * Provides functionality for creating, managing, and cloning event templates.
 * Supports deep cloning of events with all related entities.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

interface CloneOptions {
  name: string;
  startDate: string;
  endDate?: string;
  includeRunsheets?: boolean;
  includeWorkOrders?: boolean;
  includeCatering?: boolean;
  includeGuestLists?: boolean;
  includeRiders?: boolean;
  includePermits?: boolean;
  includeInspections?: boolean;
  includeHospitality?: boolean;
  includeTechSpecs?: boolean;
  resetStatuses?: boolean;
}


export class EventTemplateService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Create a template from an existing event
   */
  async createTemplate(
    eventId: string,
    templateName: string,
    description?: string,
    category?: string,
    tags?: string[]
  ): Promise<Event> {
    // Get the source event
    const { data: sourceEvent, error: fetchError } = await this.supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (fetchError || !sourceEvent) {
      throw new Error(`Failed to fetch source event: ${fetchError?.message}`);
    }

    // Create the template event
    // events table stores template info in metadata JSONB
    const templateData: EventInsert = {
      ...sourceEvent,
      id: undefined,
      name: templateName,
      start_date: sourceEvent.start_date,
      end_date: sourceEvent.end_date,
      metadata: {
        ...(sourceEvent.metadata as Record<string, unknown> ?? {}),
        is_template: true,
        template_name: templateName,
        ...(description ? { description } : {}),
        ...(category ? { category } : {}),
        ...(tags ? { tags } : {}),
      },
      created_at: undefined,
      updated_at: undefined,
    };

    // Remove fields that shouldn't be copied
    delete (templateData as Record<string, unknown>).id;
    delete (templateData as Record<string, unknown>).created_at;
    delete (templateData as Record<string, unknown>).updated_at;

    const { data: template, error: createError } = await this.supabase
      .from("events")
      .insert(templateData)
      .select()
      .single();

    if (createError || !template) {
      throw new Error(`Failed to create template: ${createError?.message}`);
    }

    return template;
  }

  /**
   * Get all templates for an organization
   */
  async getTemplates(organizationId: string): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from("events")
      .select("*")
      .eq("organization_id", organizationId)
      .contains("metadata", { is_template: true })
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    return data ?? [];
  }

  /**
   * Clone an event (or template) to create a new event
   */
  async cloneEvent(
    sourceEventId: string,
    options: CloneOptions
  ): Promise<Event> {
    // Get the source event
    const { data: sourceEvent, error: fetchError } = await this.supabase
      .from("events")
      .select("*")
      .eq("id", sourceEventId)
      .single();

    if (fetchError || !sourceEvent) {
      throw new Error(`Failed to fetch source event: ${fetchError?.message}`);
    }

    // Calculate date offset for related entities
    const sourceDateMs = sourceEvent.start_date 
      ? new Date(sourceEvent.start_date).getTime() 
      : Date.now();
    const targetDateMs = new Date(options.startDate).getTime();
    const dateOffsetMs = targetDateMs - sourceDateMs;

    // Create the new event
    const sourceMetadata = (sourceEvent.metadata as Record<string, unknown>) ?? {};
    const newEventData: EventInsert = {
      ...sourceEvent,
      id: undefined,
      name: options.name,
      start_date: options.startDate,
      end_date: options.endDate ?? this.calculateEndDate(sourceEvent, options.startDate),
      metadata: {
        ...sourceMetadata,
        is_template: false,
        template_id: sourceMetadata.is_template ? sourceEvent.id : (sourceMetadata.template_id as string | undefined),
      },
      created_at: undefined,
      updated_at: undefined,
    };

    delete (newEventData as Record<string, unknown>).id;
    delete (newEventData as Record<string, unknown>).created_at;
    delete (newEventData as Record<string, unknown>).updated_at;

    const { data: newEvent, error: createError } = await this.supabase
      .from("events")
      .insert(newEventData)
      .select()
      .single();

    if (createError || !newEvent) {
      throw new Error(`Failed to create event: ${createError?.message}`);
    }

    // Clone related entities based on options
    const clonePromises: Promise<void>[] = [];

    if (options.includeRunsheets) {
      clonePromises.push(this.cloneRunsheets(sourceEventId, newEvent.id, dateOffsetMs, options.resetStatuses));
    }

    if (options.includeWorkOrders) {
      clonePromises.push(this.cloneWorkOrders(sourceEventId, newEvent.id, dateOffsetMs, options.resetStatuses));
    }

    if (options.includeCatering) {
      clonePromises.push(this.cloneCateringOrders(sourceEventId, newEvent.id, dateOffsetMs, options.resetStatuses));
    }

    if (options.includeGuestLists) {
      clonePromises.push(this.cloneGuestLists(sourceEventId, newEvent.id, options.resetStatuses));
    }

    if (options.includeRiders) {
      clonePromises.push(this.cloneRiders(sourceEventId, newEvent.id, options.resetStatuses));
    }

    if (options.includePermits) {
      clonePromises.push(this.clonePermits(sourceEventId, newEvent.id, dateOffsetMs, options.resetStatuses));
    }

    if (options.includeInspections) {
      clonePromises.push(this.cloneInspections(sourceEventId, newEvent.id, dateOffsetMs, options.resetStatuses));
    }

    if (options.includeHospitality) {
      clonePromises.push(this.cloneHospitalityRequests(sourceEventId, newEvent.id, dateOffsetMs, options.resetStatuses));
    }

    if (options.includeTechSpecs) {
      clonePromises.push(this.cloneTechSpecs(sourceEventId, newEvent.id));
    }

    await Promise.all(clonePromises);

    // Update template usage count if cloning from a template
    const srcMeta = (sourceEvent.metadata as Record<string, unknown>) ?? {};
    if (srcMeta.is_template) {
      await this.incrementTemplateUsage(sourceEventId);
    }

    return newEvent;
  }

  /**
   * Clone runsheets and their items
   */
  private async cloneRunsheets(
    sourceEventId: string,
    targetEventId: string,
    dateOffsetMs: number,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: runsheets } = await this.supabase
      .from("runsheets")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!runsheets?.length) return;

    for (const runsheet of runsheets) {
      const newRunsheetData = {
        ...runsheet,
        id: undefined,
        event_id: targetEventId,
        date: this.offsetDate(runsheet.date, dateOffsetMs),
        status: (resetStatuses ? "draft" : runsheet.status) as Database["public"]["Enums"]["runsheet_status"],
        actual_start: null,
        actual_end: null,
        created_at: undefined,
        updated_at: undefined,
      };

      delete (newRunsheetData as Record<string, unknown>).id;
      delete (newRunsheetData as Record<string, unknown>).created_at;
      delete (newRunsheetData as Record<string, unknown>).updated_at;

      const { data: newRunsheet } = await this.supabase
        .from("runsheets")
        .insert(newRunsheetData as Database["public"]["Tables"]["runsheets"]["Insert"])
        .select()
        .single();

      if (newRunsheet) {
        // Clone runsheet items
        const { data: items } = await this.supabase
          .from("runsheet_items")
          .select("*")
          .eq("runsheet_id", runsheet.id);

        if (items?.length) {
          const newItems = items.map((item) => ({
            ...item,
            id: undefined,
            runsheet_id: newRunsheet.id,
            status: resetStatuses ? "pending" : item.status,
            start_time_actual: null,
            end_time_actual: null,
            created_at: undefined,
            updated_at: undefined,
          }));

          newItems.forEach((item) => {
            delete (item as Record<string, unknown>).id;
            delete (item as Record<string, unknown>).created_at;
            delete (item as Record<string, unknown>).updated_at;
          });

          await this.supabase.from("runsheet_items").insert(newItems as unknown as Database["public"]["Tables"]["runsheet_items"]["Insert"][]);
        }
      }
    }
  }

  /**
   * Clone work orders
   */
  private async cloneWorkOrders(
    sourceEventId: string,
    targetEventId: string,
    dateOffsetMs: number,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: workOrders } = await this.supabase
      .from("work_orders")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!workOrders?.length) return;

    const newWorkOrders = workOrders.map((wo) => ({
      ...wo,
      id: undefined,
      event_id: targetEventId,
      scheduled_start: wo.scheduled_start ? this.offsetDateTime(wo.scheduled_start, dateOffsetMs) : null,
      scheduled_end: wo.scheduled_end ? this.offsetDateTime(wo.scheduled_end, dateOffsetMs) : null,
      status: (resetStatuses ? "draft" : wo.status) as Database["public"]["Enums"]["work_order_status"],
      actual_start: null,
      actual_end: null,
      created_at: undefined,
      updated_at: undefined,
    }));

    newWorkOrders.forEach((wo) => {
      delete (wo as Record<string, unknown>).id;
      delete (wo as Record<string, unknown>).created_at;
      delete (wo as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("work_orders").insert(newWorkOrders as unknown as Database["public"]["Tables"]["work_orders"]["Insert"][]);
  }

  /**
   * Clone catering orders
   */
  private async cloneCateringOrders(
    sourceEventId: string,
    targetEventId: string,
    dateOffsetMs: number,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: orders } = await this.supabase
      .from("catering_orders")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!orders?.length) return;

    const newOrders = orders.map((order) => ({
      ...order,
      id: undefined,
      event_id: targetEventId,
      delivery_time: order.delivery_time ? this.offsetDateTime(order.delivery_time, dateOffsetMs) : null,
      status: (resetStatuses ? "pending" : order.status) as Database["public"]["Enums"]["catering_status"],
      created_at: undefined,
      updated_at: undefined,
    }));

    newOrders.forEach((order) => {
      delete (order as Record<string, unknown>).id;
      delete (order as Record<string, unknown>).created_at;
      delete (order as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("catering_orders").insert(newOrders as unknown as Database["public"]["Tables"]["catering_orders"]["Insert"][]);
  }

  /**
   * Clone guest lists
   */
  private async cloneGuestLists(
    sourceEventId: string,
    targetEventId: string,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: lists } = await this.supabase
      .from("guest_lists")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!lists?.length) return;

    const newLists = lists.map((list) => ({
      ...list,
      id: undefined,
      event_id: targetEventId,
      status: (resetStatuses ? "draft" : list.status) as Database["public"]["Enums"]["guest_list_status"],
      entries_count: resetStatuses ? 0 : list.entries_count,
      created_at: undefined,
      updated_at: undefined,
    }));

    newLists.forEach((list) => {
      delete (list as Record<string, unknown>).id;
      delete (list as Record<string, unknown>).created_at;
      delete (list as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("guest_lists").insert(newLists as unknown as Database["public"]["Tables"]["guest_lists"]["Insert"][]);
  }

  /**
   * Clone riders
   */
  private async cloneRiders(
    sourceEventId: string,
    targetEventId: string,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: riders } = await this.supabase
      .from("riders")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!riders?.length) return;

    const newRiders = riders.map((rider) => ({
      ...rider,
      id: undefined,
      event_id: targetEventId,
      status: (resetStatuses ? "draft" : rider.status) as Database["public"]["Enums"]["rider_status"],
      created_at: undefined,
      updated_at: undefined,
    }));

    newRiders.forEach((rider) => {
      delete (rider as Record<string, unknown>).id;
      delete (rider as Record<string, unknown>).created_at;
      delete (rider as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("riders").insert(newRiders as unknown as Database["public"]["Tables"]["riders"]["Insert"][]);
  }

  /**
   * Clone permits
   */
  private async clonePermits(
    sourceEventId: string,
    targetEventId: string,
    dateOffsetMs: number,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: permits } = await this.supabase
      .from("permits")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!permits?.length) return;

    const newPermits = permits.map((permit) => ({
      ...permit,
      id: undefined,
      event_id: targetEventId,
      approval_date: permit.approval_date ? this.offsetDate(permit.approval_date, dateOffsetMs) : null,
      expiration_date: permit.expiration_date ? this.offsetDate(permit.expiration_date, dateOffsetMs) : null,
      status: (resetStatuses ? "pending" : permit.status) as Database["public"]["Enums"]["permit_status"],
      permit_number: `CLONE-${Date.now()}`, // Placeholder until real number assigned
      created_at: undefined,
      updated_at: undefined,
    }));

    newPermits.forEach((permit) => {
      delete (permit as Record<string, unknown>).id;
      delete (permit as Record<string, unknown>).created_at;
      delete (permit as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("permits").insert(newPermits as unknown as Database["public"]["Tables"]["permits"]["Insert"][]);
  }

  /**
   * Clone inspections
   */
  private async cloneInspections(
    sourceEventId: string,
    targetEventId: string,
    dateOffsetMs: number,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: inspections } = await this.supabase
      .from("inspections")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!inspections?.length) return;

    const newInspections = inspections.map((inspection) => ({
      ...inspection,
      id: undefined,
      event_id: targetEventId,
      scheduled_date: inspection.scheduled_date ? this.offsetDateTime(inspection.scheduled_date, dateOffsetMs) : null,
      status: resetStatuses ? "scheduled" : inspection.status,
      actual_date: null,
      findings: resetStatuses ? null : inspection.findings,
      created_at: undefined,
      updated_at: undefined,
    }));

    newInspections.forEach((inspection) => {
      delete (inspection as Record<string, unknown>).id;
      delete (inspection as Record<string, unknown>).created_at;
      delete (inspection as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("inspections").insert(newInspections as unknown as Database["public"]["Tables"]["inspections"]["Insert"][]);
  }

  /**
   * Clone hospitality requests
   */
  private async cloneHospitalityRequests(
    sourceEventId: string,
    targetEventId: string,
    dateOffsetMs: number,
    resetStatuses?: boolean
  ): Promise<void> {
    const { data: requests } = await this.supabase
      .from("hospitality_requests")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!requests?.length) return;

    const newRequests = requests.map((request) => ({
      ...request,
      id: undefined,
      event_id: targetEventId,
      due_date: request.due_date ? this.offsetDateTime(request.due_date, dateOffsetMs) : null,
      status: (resetStatuses ? "pending" : request.status) as Database["public"]["Enums"]["hospitality_status"],
      created_at: undefined,
      updated_at: undefined,
    }));

    newRequests.forEach((request) => {
      delete (request as Record<string, unknown>).id;
      delete (request as Record<string, unknown>).created_at;
      delete (request as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("hospitality_requests").insert(newRequests as unknown as Database["public"]["Tables"]["hospitality_requests"]["Insert"][]);
  }

  /**
   * Clone tech specs
   */
  private async cloneTechSpecs(
    sourceEventId: string,
    targetEventId: string
  ): Promise<void> {
    const { data: specs } = await this.supabase
      .from("tech_specs")
      .select("*")
      .eq("event_id", sourceEventId);

    if (!specs?.length) return;

    const newSpecs = specs.map((spec) => ({
      ...spec,
      id: undefined,
      event_id: targetEventId,
      created_at: undefined,
      updated_at: undefined,
    }));

    newSpecs.forEach((spec) => {
      delete (spec as Record<string, unknown>).id;
      delete (spec as Record<string, unknown>).created_at;
      delete (spec as Record<string, unknown>).updated_at;
    });

    await this.supabase.from("tech_specs").insert(newSpecs as unknown as Database["public"]["Tables"]["tech_specs"]["Insert"][]);
  }

  /**
   * Increment template usage count
   */
  private async incrementTemplateUsage(templateId: string): Promise<void> {
    const { data } = await this.supabase
      .from("events")
      .select("metadata")
      .eq("id", templateId)
      .single();

    if (data) {
      const meta = (data.metadata as Record<string, unknown>) ?? {};
      await this.supabase
        .from("events")
        .update({
          metadata: { ...meta, usage_count: ((meta.usage_count as number) ?? 0) + 1 },
        })
        .eq("id", templateId);
    }
  }

  /**
   * Calculate end date based on source event duration
   */
  private calculateEndDate(sourceEvent: Event, newStartDate: string): string {
    if (!sourceEvent.start_date || !sourceEvent.end_date) {
      return newStartDate;
    }

    const sourceDuration = new Date(sourceEvent.end_date).getTime() - 
                          new Date(sourceEvent.start_date).getTime();
    const newEndDate = new Date(new Date(newStartDate).getTime() + sourceDuration);
    return newEndDate.toISOString().split("T")[0];
  }

  /**
   * Offset a date string by milliseconds
   */
  private offsetDate(dateStr: string, offsetMs: number): string {
    const date = new Date(dateStr);
    date.setTime(date.getTime() + offsetMs);
    return date.toISOString().split("T")[0];
  }

  /**
   * Offset a datetime string by milliseconds
   */
  private offsetDateTime(dateTimeStr: string, offsetMs: number): string {
    const date = new Date(dateTimeStr);
    date.setTime(date.getTime() + offsetMs);
    return date.toISOString();
  }
}

// Singleton instance
let eventTemplateServiceInstance: EventTemplateService | null = null;

export function getEventTemplateService(): EventTemplateService {
  if (!eventTemplateServiceInstance) {
    eventTemplateServiceInstance = new EventTemplateService();
  }
  return eventTemplateServiceInstance;
}
