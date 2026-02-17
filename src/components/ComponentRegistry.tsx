import React from 'react';
import { usePageLayout, usePageLayouts, useDefaultPageLayout } from '@/hooks/use-configuration';
import { useUser } from '@/hooks/use-supabase';
import { useOrganization } from '@/hooks/use-organization';
import { Skeleton } from '@/components/ui/skeleton';
import { ContextualEmptyState, PageErrorState } from '@/components/common/contextual-empty-state';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getErrorMessage } from '@/lib/api/error-message';

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

// Registry of available components that can be rendered from configuration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  // ── Layout Components ────────────────────────────────────────────────
  'container': React.lazy(() => import('./layout/Container').then(m => ({ default: m.Container }))),
  'grid': React.lazy(() => import('./layout/Grid').then(m => ({ default: m.Grid }))),
  'section': React.lazy(() => import('./layout/Section').then(m => ({ default: m.Section }))),

  // ── UI Primitives ────────────────────────────────────────────────────
  'card': React.lazy(() => import('./ui/card').then(m => ({ default: m.Card }))),
  'button': React.lazy(() => import('./ui/button').then(m => ({ default: m.Button }))),
  'input': React.lazy(() => import('./ui/input').then(m => ({ default: m.Input }))),
  'select': React.lazy(() => import('./ui/select').then(m => ({ default: m.Select }))),
  'table': React.lazy(() => import('./ui/table').then(m => ({ default: m.Table }))),

  // ── Dashboard Widgets ────────────────────────────────────────────────
  'metrics': React.lazy(() => import('./widgets/MetricsWidget').then(m => ({ default: m.MetricsWidget }))),
  'recent_activity': React.lazy(() => import('./widgets/RecentActivityWidget').then(m => ({ default: m.RecentActivityWidget }))),
  'quick_actions': React.lazy(() => import('./widgets/QuickActionsWidget').then(m => ({ default: m.QuickActionsWidget }))),
  'active_events': React.lazy(() => import('./widgets/ActiveEventsWidget').then(m => ({ default: m.ActiveEventsWidget }))),
  'upcoming_tasks': React.lazy(() => import('./widgets/UpcomingTasksWidget').then(m => ({ default: m.UpcomingTasksWidget }))),
  'crew_status': React.lazy(() => import('./widgets/CrewStatusWidget').then(m => ({ default: m.CrewStatusWidget }))),
  'today_schedule': React.lazy(() => import('./widgets/TodayScheduleWidget').then(m => ({ default: m.TodayScheduleWidget }))),
  'my_tasks': React.lazy(() => import('./widgets/MyTasksWidget').then(m => ({ default: m.MyTasksWidget }))),
  'quick_stats': React.lazy(() => import('./widgets/QuickStatsWidget').then(m => ({ default: m.QuickStatsWidget }))),
  'inbox_summary': React.lazy(() => import('./widgets/InboxSummaryWidget').then(m => ({ default: m.InboxSummaryWidget }))),
  'project_progress': React.lazy(() => import('./widgets/ProjectProgressWidget').then(m => ({ default: m.ProjectProgressWidget }))),
  'setup_checklist': React.lazy(() => import('./widgets/SetupChecklistWidget').then(m => ({ default: m.SetupChecklistWidget }))),
  'dashboard_grid': React.lazy(() => import('./dashboard/DashboardGrid').then(m => ({ default: m.DashboardGrid }))),

  // ── Dashboard Chart Widgets ──────────────────────────────────────────
  'metric_widget': React.lazy(() => import('./views/dashboard-widgets').then(m => ({ default: m.MetricWidget }))),
  'progress_widget': React.lazy(() => import('./views/dashboard-widgets').then(m => ({ default: m.ProgressWidget }))),
  'list_widget': React.lazy(() => import('./views/dashboard-widgets').then(m => ({ default: m.ListWidget }))),
  'donut_widget': React.lazy(() => import('./views/dashboard-widgets').then(m => ({ default: m.DonutWidget }))),
  'sparkline_widget': React.lazy(() => import('./views/dashboard-widgets').then(m => ({ default: m.SparklineWidget }))),

  // ── View Components ──────────────────────────────────────────────────
  'data_view': React.lazy(() => import('./views/data-view').then(m => ({ default: m.DataView }))),
  'data_table': React.lazy(() => import('./views/data-table').then(m => ({ default: m.DataTable }))),
  'kanban_board': React.lazy(() => import('./views/kanban-board').then(m => ({ default: m.KanbanBoard }))),
  'calendar_view': React.lazy(() => import('./views/calendar-view').then(m => ({ default: m.CalendarView }))),
  'gantt_view': React.lazy(() => import('./views/gantt-view').then(m => ({ default: m.GanttView }))),
  'list_view': React.lazy(() => import('./views/list-view').then(m => ({ default: m.ListView }))),
  'timeline_view': React.lazy(() => import('./views/timeline-view').then(m => ({ default: m.TimelineView }))),
  'matrix_view': React.lazy(() => import('./views/matrix-view').then(m => ({ default: m.MatrixView }))),
  'map_view': React.lazy(() => import('./views/map-view').then(m => ({ default: m.MapView }))),
  'workload_view': React.lazy(() => import('./views/workload-view').then(m => ({ default: m.WorkloadView }))),
  'activity_feed': React.lazy(() => import('./views/activity-feed').then(m => ({ default: m.ActivityFeed }))),
  'master_calendar': React.lazy(() => import('./views/MasterCalendar').then(m => ({ default: m.MasterCalendar }))),
  'toolbar': React.lazy(() => import('./views/toolbar').then(m => ({ default: m.Toolbar }))),
  'form_builder': React.lazy(() => import('./views/form-builder').then(m => ({ default: m.FormBuilder }))),
  'form_renderer': React.lazy(() => import('./views/form-builder').then(m => ({ default: m.FormRenderer }))),

  // ── Common Components ────────────────────────────────────────────────
  'page_header': React.lazy(() => import('./common/page-header').then(m => ({ default: m.PageHeader }))),
  'stat_card': React.lazy(() => import('./common/stat-card').then(m => ({ default: m.StatCard }))),
  'status_badge': React.lazy(() => import('./common/status-badge').then(m => ({ default: m.StatusBadge }))),
  'filter_panel': React.lazy(() => import('./common/filter-panel').then(m => ({ default: m.FilterPanel }))),
  'command_palette': React.lazy(() => import('./common/command-palette').then(m => ({ default: m.CommandPalette }))),
  'notification_center': React.lazy(() => import('./common/notification-center').then(m => ({ default: m.NotificationCenter }))),
  'file_upload': React.lazy(() => import('./common/file-upload').then(m => ({ default: m.FileUpload }))),
  'tag_input': React.lazy(() => import('./common/tag-input').then(m => ({ default: m.TagInput }))),
  'inline_edit': React.lazy(() => import('./common/inline-edit').then(m => ({ default: m.InlineEdit }))),
  'confirm_dialog': React.lazy(() => import('./common/confirm-dialog').then(m => ({ default: m.ConfirmDialog }))),
  'step_wizard': React.lazy(() => import('./common/step-wizard').then(m => ({ default: m.StepWizard }))),
  'checklist_widget': React.lazy(() => import('./common/checklist-widget').then(m => ({ default: m.ChecklistWidget }))),
  'subtask_list': React.lazy(() => import('./common/subtask-list').then(m => ({ default: m.SubtaskList }))),
  'dependency_picker': React.lazy(() => import('./common/dependency-picker').then(m => ({ default: m.DependencyPicker }))),
  'bulk_actions': React.lazy(() => import('./common/bulk-actions').then(m => ({ default: m.BulkActions }))),
  'export_modal': React.lazy(() => import('./common/export-modal').then(m => ({ default: m.ExportModal }))),
  'share_modal': React.lazy(() => import('./common/share-modal').then(m => ({ default: m.ShareModal }))),
  'saved_view_selector': React.lazy(() => import('./common/saved-view-selector').then(m => ({ default: m.SavedViewSelector }))),

  // ── Form Components ──────────────────────────────────────────────────
  'form_step': React.lazy(() => import('./forms/FormStep').then(m => ({ default: m.FormStep }))),
  'form_field': React.lazy(() => import('./forms/FormField').then(m => ({ default: m.FormField }))),

  // ── Onboarding Components ────────────────────────────────────────────
  'welcome_screen': React.lazy(() => import('./onboarding/WelcomeScreen').then(m => ({ default: m.WelcomeScreen }))),
  'account_type_selector': React.lazy(() => import('./onboarding/AccountTypeSelector').then(m => ({ default: m.AccountTypeSelector }))),
  'profile_form': React.lazy(() => import('./onboarding/ProfileForm').then(m => ({ default: m.ProfileForm }))),
  'permission_review': React.lazy(() => import('./onboarding/PermissionReview').then(m => ({ default: m.PermissionReview }))),
  'onboarding_complete': React.lazy(() => import('./onboarding/OnboardingComplete').then(m => ({ default: m.OnboardingComplete }))),

  // ── Operations Components ────────────────────────────────────────────
  'crew_checkin_kiosk': React.lazy(() => import('./operations/CrewCheckinKiosk').then(m => ({ default: m.CrewCheckinKiosk }))),
  'incident_control_room': React.lazy(() => import('./operations/IncidentControlRoom').then(m => ({ default: m.IncidentControlRoom }))),
  'runsheet_show_mode': React.lazy(() => import('./operations/RunsheetShowMode').then(m => ({ default: m.RunsheetShowMode }))),

  // ── Productions Components ───────────────────────────────────────────
  'run_of_show': React.lazy(() => import('./productions/RunOfShow').then(m => ({ default: m.RunOfShow }))),
  'show_calling_view': React.lazy(() => import('./productions/runsheet/ShowCallingView').then(m => ({ default: m.ShowCallingView }))),
  'active_production_card': React.lazy(() => import('./productions/widgets/ActiveProductionCard').then(m => ({ default: m.ActiveProductionCard }))),
  'live_clock_widget': React.lazy(() => import('./productions/widgets/LiveClockWidget').then(m => ({ default: m.LiveClockWidget }))),
  'weather_widget': React.lazy(() => import('./productions/widgets/WeatherWidget').then(m => ({ default: m.WeatherWidget }))),
  'curfew_countdown': React.lazy(() => import('./productions/widgets/CurfewCountdownWidget').then(m => ({ default: m.CurfewCountdownWidget }))),
  'curfew_countdown_timers': React.lazy(() => import('./productions/widgets/CurfewCountdown').then(m => ({ default: m.CurfewCountdown }))),
  'emergency_alert': React.lazy(() => import('./productions/widgets/EmergencyAlert').then(m => ({ default: m.EmergencyAlert }))),
  'live_show_cost': React.lazy(() => import('./productions/widgets/LiveShowCost').then(m => ({ default: m.LiveShowCost }))),

  // ── Scheduling Components ────────────────────────────────────────────
  'smart_rostering': React.lazy(() => import('./scheduling/SmartRostering').then(m => ({ default: m.SmartRostering }))),

  // ── Advancing Module ─────────────────────────────────────────────────
  'advancing_activity_feed': React.lazy(() => import('./modules/advancing/ActivityFeed').then(m => ({ default: m.ActivityFeed }))),
  'availability_timeline': React.lazy(() => import('./modules/advancing/AvailabilityTimeline').then(m => ({ default: m.AvailabilityTimeline }))),
  'conflict_panel': React.lazy(() => import('./modules/advancing/ConflictPanel').then(m => ({ default: m.ConflictPanel }))),
  'crew_scheduler': React.lazy(() => import('./modules/advancing/CrewScheduler').then(m => ({ default: m.CrewScheduler }))),
  'advancing_presence': React.lazy(() => import('./modules/advancing/PresenceIndicator').then(m => ({ default: m.PresenceIndicator }))),
  'scanner_modal': React.lazy(() => import('./modules/advancing/ScannerModal').then(m => ({ default: m.ScannerModal }))),

  // ── Business / CRM Module ────────────────────────────────────────────
  'business_activity_timeline': React.lazy(() => import('./modules/business/ActivityTimeline').then(m => ({ default: m.ActivityTimeline }))),
  'duplicate_detection_panel': React.lazy(() => import('./modules/business/DuplicateDetectionPanel').then(m => ({ default: m.DuplicateDetectionPanel }))),
  'email_composer': React.lazy(() => import('./modules/business/EmailComposer').then(m => ({ default: m.EmailComposer }))),
  'enrichment_panel': React.lazy(() => import('./modules/business/EnrichmentPanel').then(m => ({ default: m.EnrichmentPanel }))),
  'entity_profile_layout': React.lazy(() => import('./modules/business/EntityProfileLayout').then(m => ({ default: m.EntityProfileLayout }))),
  'forecast_dashboard': React.lazy(() => import('./modules/business/ForecastDashboard').then(m => ({ default: m.ForecastDashboard }))),
  'lead_score_card': React.lazy(() => import('./modules/business/LeadScoreCard').then(m => ({ default: m.LeadScoreCard }))),
  'pipeline_board': React.lazy(() => import('./modules/business/PipelineBoard').then(m => ({ default: m.PipelineBoard }))),
  'pipeline_selector': React.lazy(() => import('./modules/business/PipelineSelector').then(m => ({ default: m.PipelineSelector }))),
  'pipeline_stats': React.lazy(() => import('./modules/business/PipelineStats').then(m => ({ default: m.PipelineStats }))),
  'workflow_builder': React.lazy(() => import('./modules/business/WorkflowBuilder').then(m => ({ default: m.WorkflowBuilder }))),

  // ── People Module ────────────────────────────────────────────────────
  'compliance_dashboard': React.lazy(() => import('./people/ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard }))),
  'document_manager': React.lazy(() => import('./people/DocumentManager').then(m => ({ default: m.DocumentManager }))),
  'employee_portal': React.lazy(() => import('./people/EmployeePortal').then(m => ({ default: m.EmployeePortal }))),
  'holographic_directory': React.lazy(() => import('./people/HolographicDirectory').then(m => ({ default: m.HolographicDirectory }))),
  'leave_calendar': React.lazy(() => import('./people/LeaveCalendar').then(m => ({ default: m.LeaveCalendar }))),
  'leave_request_form': React.lazy(() => import('./people/LeaveRequestForm').then(m => ({ default: m.LeaveRequestForm }))),
  'life_stream_profile': React.lazy(() => import('./people/LifeStreamProfile').then(m => ({ default: m.LifeStreamProfile }))),
  'org_chart': React.lazy(() => import('./people/OrgChart').then(m => ({ default: m.OrgChart }))),
  'performance_review_dashboard': React.lazy(() => import('./people/PerformanceReviewDashboard').then(m => ({ default: m.PerformanceReviewDashboard }))),
  'time_clock': React.lazy(() => import('./people/TimeClock').then(m => ({ default: m.TimeClock }))),
  'workforce_analytics': React.lazy(() => import('./people/WorkforceAnalytics').then(m => ({ default: m.WorkforceAnalytics }))),

  // ── Realtime Components ──────────────────────────────────────────────
  'realtime_activity_feed': React.lazy(() => import('./realtime/ActivityFeed').then(m => ({ default: m.ActivityFeed }))),
  'comment_thread': React.lazy(() => import('./realtime/CommentThread').then(m => ({ default: m.CommentThread }))),
  'mention_input': React.lazy(() => import('./realtime/MentionInput').then(m => ({ default: m.MentionInput }))),
  'presence_indicator': React.lazy(() => import('./realtime/PresenceIndicator').then(m => ({ default: m.PresenceIndicator }))),

  // ── Workflow Components ──────────────────────────────────────────────
  'workflow_execution_monitor': React.lazy(() => import('./workflows/WorkflowExecutionMonitor').then(m => ({ default: m.WorkflowExecutionMonitor }))),
  'workflow_template_selector': React.lazy(() => import('./workflows/WorkflowTemplateSelector').then(m => ({ default: m.WorkflowTemplateSelector }))),
  'workflow_builder_engine': React.lazy(() => import('./workflows/WorkflowBuilder').then(m => ({ default: m.WorkflowBuilder }))),

  // ── Assets Module ────────────────────────────────────────────────────
  'asset_utilization_dashboard': React.lazy(() => import('./assets/AssetUtilizationDashboard').then(m => ({ default: m.AssetUtilizationDashboard }))),

  // ── Template Components ─────────────────────────────────────────────
  'auth_template': React.lazy(() => import('./templates/AuthTemplate').then(m => ({ default: m.AuthTemplate }))),
  'dashboard_template': React.lazy(() => import('./templates/DashboardTemplate').then(m => ({ default: m.DashboardTemplate }))),
  'entity_list_template': React.lazy(() => import('./templates/EntityListTemplate').then(m => ({ default: m.EntityListTemplate }))),
  'form_template': React.lazy(() => import('./templates/FormTemplate').then(m => ({ default: m.FormTemplate }))),
  'reports_template': React.lazy(() => import('./templates/ReportsTemplate').then(m => ({ default: m.ReportsTemplate }))),
  'settings_template': React.lazy(() => import('./templates/SettingsTemplate').then(m => ({ default: m.SettingsTemplate }))),
  'wizard_template': React.lazy(() => import('./templates/WizardTemplate').then(m => ({ default: m.WizardTemplate }))),

  // ── State Components ─────────────────────────────────────────────────
  'loading_state': React.lazy(() => import('./states/AsyncStates').then(m => ({ default: m.LoadingState }))),
  'empty_state': React.lazy(() => import('./states/AsyncStates').then(m => ({ default: m.EmptyState }))),
  'error_state': React.lazy(() => import('./states/AsyncStates').then(m => ({ default: m.ErrorState }))),

  // ── Error Handling ───────────────────────────────────────────────────
  'error_boundary': React.lazy(() => import('./error/ErrorBoundary')),

  // ── Additional Common Components ─────────────────────────────────────
  'contextual_empty_state': React.lazy(() => import('./common/contextual-empty-state').then(m => ({ default: m.ContextualEmptyState }))),
  'create_modal': React.lazy(() => import('./common/create-modal').then(m => ({ default: m.CreateModal }))),
  'edit_modal': React.lazy(() => import('./common/edit-modal').then(m => ({ default: m.EditModal }))),
  'preview_modal': React.lazy(() => import('./common/preview-modal').then(m => ({ default: m.PreviewModal }))),
  'loading_spinner': React.lazy(() => import('./common/loading-spinner').then(m => ({ default: m.LoadingSpinner }))),
  'quick_actions_editor': React.lazy(() => import('./widgets/QuickActionsEditor').then(m => ({ default: m.QuickActionsEditor }))),
};

// ============================================================================
// CONFIGURATION-DRIVEN COMPONENT RENDERER
// ============================================================================

interface ComponentRendererProps {
  componentType: string;
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  className?: string;
}

export function ComponentRenderer({
  componentType,
  config = {},
  data = {},
  className
}: ComponentRendererProps) {
  const Component = COMPONENT_REGISTRY[componentType];

  if (!Component) {
    return (
      <PageErrorState
        title="Unknown component"
        description={`Component "${componentType}" is not registered in the component registry.`}
        className={cn("min-h-[12rem]", className)}
      />
    );
  }

  return (
    <React.Suspense fallback={<Skeleton className={className} />}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="h-full w-full"
      >
        <Component
          {...config}
          {...data}
          className={cn(className)}
        />
      </motion.div>
    </React.Suspense>
  );
}

// ============================================================================
// PAGE LAYOUT RENDERER
// ============================================================================

interface PageLayoutRendererProps {
  layoutSlug?: string;
  layoutType?: string;
  contextData?: Record<string, unknown>;
  className?: string;
}

export function PageLayoutRenderer({
  layoutSlug,
  layoutType,
  contextData = {},
  className
}: PageLayoutRendererProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: organization } = useOrganization(organizationId);

  // Get layout by slug or default by type
  const { data: layoutBySlug, isLoading: loadingSlug, error: errorSlug, refetch: refetchSlug } = usePageLayout(layoutSlug || '');

  const { data: defaultLayout, isLoading: loadingDefault, error: errorDefault, refetch: refetchDefault } = useDefaultPageLayout(layoutType || '');

  const layout = layoutBySlug || defaultLayout;
  const isLoading = loadingSlug || loadingDefault;
  const error = errorSlug || errorDefault;

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  if (error || !layout) {
    return (
      <PageErrorState
        title={error ? 'Failed to load layout' : 'No layout found'}
        description={error ? getErrorMessage(error, 'We could not load this page layout.') : 'No layout configuration is available for this route.'}
        error={error || undefined}
        onRetry={() => {
          void refetchSlug();
          void refetchDefault();
        }}
        className={className}
      />
    );
  }

  // Check permissions
  if (layout.permissions?.length && user) {
    const hasPermission = layout.permissions.some((permission: string) =>
      // In a real app, check user's permissions here
      // For now, assume admin has all permissions
      user.user_metadata?.role === 'admin' || permission === 'user'
    );

    if (!hasPermission) {
      return (
        <ContextualEmptyState
          type="no-permission"
          title="Access restricted"
          description="You don&apos;t have permission to view this page."
          className={className}
        />
      );
    }
  }

  // Check account type compatibility
  if (layout.applicable_account_types?.length && user) {
    const userAccountType = user.user_metadata?.account_type;
    const isCompatible = !userAccountType ||
      layout.applicable_account_types.includes(userAccountType);

    if (!isCompatible) {
      return (
        <ContextualEmptyState
          type="no-permission"
          title="Unavailable for this account"
          description="This page is not available for your account type."
          className={className}
        />
      );
    }
  }

  // Render the layout
  const { component_config, theme_config } = layout;

  // Apply theme configuration
  const themeClasses = theme_config ? generateThemeClasses(theme_config) : '';

  return (
    <div className={`${themeClasses} ${className || ''}`}>
      {renderComponentConfig(component_config, {
        user,
        organization,
        ...contextData
      })}
    </div>
  );
}

// ============================================================================
// LAYOUT CONFIGURATION RENDERER
// ============================================================================

function renderComponentConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  contextData: Record<string, unknown>
): React.ReactNode {
  if (!config) return null;

  // Handle array of components
  if (Array.isArray(config)) {
    return config.map((item, index) => (
      <ComponentRenderer
        key={index}
        componentType={item.type}
        config={item}
        data={contextData}
      />
    ));
  }

  // Handle single component
  if (typeof config === 'object' && config.type) {
    return (
      <ComponentRenderer
        componentType={config.type}
        config={config}
        data={contextData}
      />
    );
  }

  // Handle layout object with header/widgets structure
  if (typeof config === 'object' && (config.header || config.widgets)) {
    return (
      <div className="min-h-screen bg-background">
        {config.header && (
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{config.header.title}</h1>
                {config.header.actions && (
                  <div className="flex gap-2">
                    {config.header.actions.map((action: string, index: number) => (
                      <ComponentRenderer
                        key={index}
                        componentType="button"
                        config={{ children: action, variant: 'outline' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {config.widgets && (
          <main className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {config.widgets.map((widget: Record<string, unknown>, index: number) => (
                <div
                  key={index}
                  className={`col-span-${widget.span || 12} ${widget.position || ''}`}
                >
                  <ComponentRenderer
                    componentType={String(widget.type)}
                    config={widget}
                    data={contextData}
                  />
                </div>
              ))}
            </div>
          </main>
        )}

        {config.steps && (
          <main className="container mx-auto px-4 py-6">
            {config.steps.map((step: Record<string, unknown>, index: number) => (
              <ComponentRenderer
                key={index}
                componentType={String(step.component || 'form_step')}
                config={step}
                data={contextData}
              />
            ))}
          </main>
        )}
      </div>
    );
  }

  return null;
}

// ============================================================================
// THEME UTILITIES
// ============================================================================

function generateThemeClasses(themeConfig: Record<string, unknown>): string {
  const classes: string[] = [];

  if (themeConfig.colors) {
    // Apply theme colors (would integrate with CSS custom properties or Tailwind)
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      classes.push(`theme-${key}-${value}`);
    });
  }

  if (themeConfig.spacing) {
    classes.push(`theme-spacing-${themeConfig.spacing}`);
  }

  if (themeConfig.fontSize) {
    classes.push(`theme-font-${themeConfig.fontSize}`);
  }

  return classes.join(' ');
}

// ============================================================================
// HOOKS FOR DYNAMIC PAGE RENDERING
// ============================================================================

export function useDynamicPage(route: string) {
  // Find layout by route pattern
  const { data: layouts, isLoading, error } = usePageLayouts();

  const layout = layouts?.find(l =>
    route.match(new RegExp(l.route.replace('*', '.*')))
  );

  return {
    layout,
    isLoading,
    error,
    hasLayout: !!layout
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDynamicComponent(componentType: string, props: Record<string, any> = {}) {
  const Component = COMPONENT_REGISTRY[componentType];

  if (!Component) {
    return {
      Component: () => (
        <PageErrorState
          title="Unknown component"
          description={`Component "${componentType}" was not found in the registry.`}
          className="min-h-[12rem]"
        />
      ),
      isValid: false
    };
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: (additionalProps: Record<string, any> = {}) => (
      <React.Suspense fallback={<Skeleton />}>
        <Component {...props} {...additionalProps} />
      </React.Suspense>
    ),
    isValid: true
  };
}
