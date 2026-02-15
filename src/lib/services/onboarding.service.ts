/**
 * Onboarding Service
 * Handles user onboarding flow, progress tracking, and account type configuration
 */

import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/api/error-message";

export interface OnboardingStep {
  id: string;
  slug: string;
  name: string;
  description?: string;
  helpText?: string;
  icon?: string;
  position: number;
  isRequired: boolean;
  isSkippable: boolean;
  estimatedMinutes: number;
}

export interface OnboardingProgress {
  stepId: string;
  stepSlug: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  startedAt?: Date;
  completedAt?: Date;
  skippedAt?: Date;
  data?: Record<string, unknown>;
}

export interface OnboardingState {
  userId: string;
  organizationId?: string;
  accountTypeSlug: string;
  currentStepSlug?: string;
  isCompleted: boolean;
  completedAt?: Date;
  dismissedAt?: Date;
}

export interface AccountTypeConfig {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  defaultRoleSlug?: string;
  onboardingSteps: string[];
  requiredFields: string[];
  featureFlags: Record<string, boolean>;
  isInternal: boolean;
  isActive: boolean;
}

export interface OnboardingResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export class OnboardingService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get all available account types
   */
  async getAccountTypes(): Promise<AccountTypeConfig[]> {
    const { data, error } = await this.supabase
      .from("account_type_configs")
      .select("*")
      .eq("is_active", true)
      .eq("is_internal", false)
      .order("position");

    if (error || !data) return [];

    return data.map(this.mapAccountTypeConfig);
  }

  /**
   * Get a specific account type configuration
   */
  async getAccountTypeConfig(slug: string): Promise<AccountTypeConfig | null> {
    const { data, error } = await this.supabase
      .from("account_type_configs")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;

    return this.mapAccountTypeConfig(data);
  }

  /**
   * Get onboarding steps for a specific account type
   */
  async getOnboardingSteps(accountTypeSlug: string): Promise<OnboardingStep[]> {
    const { data, error } = await this.supabase
      .from("onboarding_steps")
      .select("*")
      .contains("applicable_account_types", [accountTypeSlug])
      .order("position");

    if (error || !data) return [];

    return data.map(this.mapOnboardingStep);
  }

  /**
   * Get user's onboarding state
   */
  async getOnboardingState(userId: string, organizationId?: string): Promise<OnboardingState | null> {
    let query = this.supabase
      .from("user_onboarding_state")
      .select("*")
      .eq("user_id", userId);

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    } else {
      query = query.is("organization_id", null);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      organizationId: data.organization_id,
      accountTypeSlug: data.account_type_slug,
      currentStepSlug: data.current_step_slug,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      dismissedAt: data.dismissed_at ? new Date(data.dismissed_at) : undefined,
    };
  }

  /**
   * Initialize onboarding for a user
   */
  async initializeOnboarding(
    userId: string,
    accountTypeSlug: string,
    organizationId?: string
  ): Promise<OnboardingResult> {
    try {
      // Get the account type config
      const accountType = await this.getAccountTypeConfig(accountTypeSlug);
      if (!accountType) {
        return { success: false, error: "Invalid account type" };
      }

      // Get the first step
      const steps = await this.getOnboardingSteps(accountTypeSlug);
      const firstStep = steps[0];

      // Create onboarding state
      const { error: stateError } = await this.supabase
        .from("user_onboarding_state")
        .upsert({
          user_id: userId,
          organization_id: organizationId || null,
          account_type_slug: accountTypeSlug,
          current_step_slug: firstStep?.slug || null,
          is_completed: false,
        });

      if (stateError) {
        return { success: false, error: stateError.message };
      }

      // Create progress entries for each step
      const progressEntries = steps.map((step) => ({
        user_id: userId,
        organization_id: organizationId || null,
        step_id: step.id,
        status: "pending",
      }));

      if (progressEntries.length > 0) {
        const { error: progressError } = await this.supabase
          .from("user_onboarding_progress")
          .upsert(progressEntries, {
            onConflict: "user_id,organization_id,step_id",
          });

        if (progressError) {
          return { success: false, error: progressError.message };
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to initialize onboarding"),
      };
    }
  }

  /**
   * Get user's progress on all onboarding steps
   */
  async getProgress(userId: string, organizationId?: string): Promise<OnboardingProgress[]> {
    let query = this.supabase
      .from("user_onboarding_progress")
      .select(`
        *,
        step:onboarding_steps(slug)
      `)
      .eq("user_id", userId);

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    } else {
      query = query.is("organization_id", null);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((item) => ({
      stepId: item.step_id,
      stepSlug: (item.step as { slug?: string } | null)?.slug || "",
      status: item.status,
      startedAt: item.started_at ? new Date(item.started_at) : undefined,
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      skippedAt: item.skipped_at ? new Date(item.skipped_at) : undefined,
      data: item.data,
    }));
  }

  /**
   * Start a specific onboarding step
   */
  async startStep(
    userId: string,
    stepSlug: string,
    organizationId?: string
  ): Promise<OnboardingResult> {
    try {
      // Get the step
      const { data: step, error: stepError } = await this.supabase
        .from("onboarding_steps")
        .select("id")
        .eq("slug", stepSlug)
        .single();

      if (stepError || !step) {
        return { success: false, error: "Step not found" };
      }

      // Update progress
      const { error } = await this.supabase
        .from("user_onboarding_progress")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("step_id", step.id)
        .eq("organization_id", organizationId || null);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update current step in state
      await this.supabase
        .from("user_onboarding_state")
        .update({ current_step_slug: stepSlug })
        .eq("user_id", userId)
        .eq("organization_id", organizationId || null);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to start step"),
      };
    }
  }

  /**
   * Complete a specific onboarding step
   */
  async completeStep(
    userId: string,
    stepSlug: string,
    data?: Record<string, unknown>,
    organizationId?: string
  ): Promise<OnboardingResult> {
    try {
      // Get the step
      const { data: step, error: stepError } = await this.supabase
        .from("onboarding_steps")
        .select("id")
        .eq("slug", stepSlug)
        .single();

      if (stepError || !step) {
        return { success: false, error: "Step not found" };
      }

      // Update progress
      const { error } = await this.supabase
        .from("user_onboarding_progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          data: data || {},
        })
        .eq("user_id", userId)
        .eq("step_id", step.id)
        .eq("organization_id", organizationId || null);

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if all required steps are complete
      await this.checkAndUpdateCompletion(userId, organizationId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to complete step"),
      };
    }
  }

  /**
   * Skip a specific onboarding step
   */
  async skipStep(
    userId: string,
    stepSlug: string,
    organizationId?: string
  ): Promise<OnboardingResult> {
    try {
      // Get the step
      const { data: step, error: stepError } = await this.supabase
        .from("onboarding_steps")
        .select("id, is_skippable")
        .eq("slug", stepSlug)
        .single();

      if (stepError || !step) {
        return { success: false, error: "Step not found" };
      }

      if (!step.is_skippable) {
        return { success: false, error: "This step cannot be skipped" };
      }

      // Update progress
      const { error } = await this.supabase
        .from("user_onboarding_progress")
        .update({
          status: "skipped",
          skipped_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("step_id", step.id)
        .eq("organization_id", organizationId || null);

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if all required steps are complete
      await this.checkAndUpdateCompletion(userId, organizationId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to skip step"),
      };
    }
  }

  /**
   * Get the next incomplete step for a user
   */
  async getNextStep(userId: string, organizationId?: string): Promise<OnboardingStep | null> {
    // Get user's onboarding state
    const state = await this.getOnboardingState(userId, organizationId);
    if (!state || state.isCompleted) return null;

    // Get all steps for this account type
    const steps = await this.getOnboardingSteps(state.accountTypeSlug);
    if (steps.length === 0) return null;

    // Get progress
    const progress = await this.getProgress(userId, organizationId);
    const progressMap = new Map(progress.map((p) => [p.stepSlug, p]));

    // Find first incomplete step
    for (const step of steps) {
      const stepProgress = progressMap.get(step.slug);
      if (!stepProgress || stepProgress.status === "pending" || stepProgress.status === "in_progress") {
        return step;
      }
    }

    return null;
  }

  /**
   * Check if onboarding is complete and update state
   */
  async isOnboardingComplete(userId: string, organizationId?: string): Promise<boolean> {
    const state = await this.getOnboardingState(userId, organizationId);
    return state?.isCompleted ?? false;
  }

  /**
   * Dismiss onboarding (user can complete later)
   */
  async dismissOnboarding(userId: string, organizationId?: string): Promise<OnboardingResult> {
    try {
      const { error } = await this.supabase
        .from("user_onboarding_state")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("organization_id", organizationId || null);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to dismiss onboarding"),
      };
    }
  }

  /**
   * Resume onboarding (after dismissal)
   */
  async resumeOnboarding(userId: string, organizationId?: string): Promise<OnboardingResult> {
    try {
      const { error } = await this.supabase
        .from("user_onboarding_state")
        .update({ dismissed_at: null })
        .eq("user_id", userId)
        .eq("organization_id", organizationId || null);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to resume onboarding"),
      };
    }
  }

  /**
   * Get onboarding summary for dashboard display
   */
  async getOnboardingSummary(userId: string, organizationId?: string) {
    const state = await this.getOnboardingState(userId, organizationId);
    if (!state) return null;

    const steps = await this.getOnboardingSteps(state.accountTypeSlug);
    const progress = await this.getProgress(userId, organizationId);

    const completedCount = progress.filter(
      (p) => p.status === "completed" || p.status === "skipped"
    ).length;

    const totalRequired = steps.filter((s) => s.isRequired).length;
    const completedRequired = progress.filter(
      (p) =>
        (p.status === "completed" || p.status === "skipped") &&
        steps.find((s) => s.slug === p.stepSlug)?.isRequired
    ).length;

    return {
      accountType: state.accountTypeSlug,
      currentStep: state.currentStepSlug,
      isCompleted: state.isCompleted,
      isDismissed: !!state.dismissedAt,
      totalSteps: steps.length,
      completedSteps: completedCount,
      totalRequired,
      completedRequired,
      percentComplete: steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0,
      steps: steps.map((step) => {
        const stepProgress = progress.find((p) => p.stepSlug === step.slug);
        return {
          ...step,
          status: stepProgress?.status || "pending",
          completedAt: stepProgress?.completedAt,
        };
      }),
    };
  }

  // Private helper methods

  private async checkAndUpdateCompletion(userId: string, organizationId?: string): Promise<void> {
    const state = await this.getOnboardingState(userId, organizationId);
    if (!state) return;

    const steps = await this.getOnboardingSteps(state.accountTypeSlug);
    const progress = await this.getProgress(userId, organizationId);

    // Check if all required steps are complete
    const requiredSteps = steps.filter((s) => s.isRequired);
    const allRequiredComplete = requiredSteps.every((step) => {
      const stepProgress = progress.find((p) => p.stepSlug === step.slug);
      return stepProgress?.status === "completed" || stepProgress?.status === "skipped";
    });

    if (allRequiredComplete && !state.isCompleted) {
      await this.supabase
        .from("user_onboarding_state")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("organization_id", organizationId || null);

      // Also update the user's onboarding_completed_at
      await this.supabase
        .from("users")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", userId);
    }
  }

  private mapAccountTypeConfig(data: Record<string, unknown>): AccountTypeConfig {
    return {
      id: data.id as string,
      slug: data.slug as string,
      name: data.name as string,
      description: data.description as string | undefined,
      icon: data.icon as string | undefined,
      color: data.color as string | undefined,
      defaultRoleSlug: data.default_role_slug as string | undefined,
      onboardingSteps: (data.onboarding_steps as string[]) || [],
      requiredFields: (data.required_fields as string[]) || [],
      featureFlags: (data.feature_flags as Record<string, boolean>) || {},
      isInternal: data.is_internal as boolean,
      isActive: data.is_active as boolean,
    };
  }

  private mapOnboardingStep(data: Record<string, unknown>): OnboardingStep {
    return {
      id: data.id as string,
      slug: data.slug as string,
      name: data.name as string,
      description: data.description as string | undefined,
      helpText: data.help_text as string | undefined,
      icon: data.icon as string | undefined,
      position: data.position as number,
      isRequired: data.is_required as boolean,
      isSkippable: data.is_skippable as boolean,
      estimatedMinutes: data.estimated_minutes as number,
    };
  }
}

export const onboardingService = new OnboardingService();
