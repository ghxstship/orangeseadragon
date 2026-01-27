import React from 'react';
import { usePageLayout, usePageLayouts, useDefaultPageLayout } from '@/hooks/use-configuration';
import { useSupabase } from '@/hooks/use-supabase';
import { useUser } from '@/hooks/use-supabase';
import { useOrganization } from '@/hooks/use-organization';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

// Registry of available components that can be rendered from configuration
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Layout Components
  'container': React.lazy(() => import('./layout/Container').then(m => ({ default: m.Container }))),
  'grid': React.lazy(() => import('./layout/Grid').then(m => ({ default: m.Grid }))),
  'section': React.lazy(() => import('./layout/Section').then(m => ({ default: m.Section }))),

  // UI Components
  'card': React.lazy(() => import('./ui/card').then(m => ({ default: m.Card }))),
  'button': React.lazy(() => import('./ui/button').then(m => ({ default: m.Button }))),
  'input': React.lazy(() => import('./ui/input').then(m => ({ default: m.Input }))),
  'select': React.lazy(() => import('./ui/select').then(m => ({ default: m.Select }))),
  'table': React.lazy(() => import('./ui/table').then(m => ({ default: m.Table }))),

  // Dashboard Widgets
  'metrics': React.lazy(() => import('./widgets/MetricsWidget').then(m => ({ default: m.MetricsWidget }))),
  'recent_activity': React.lazy(() => import('./widgets/RecentActivityWidget').then(m => ({ default: m.RecentActivityWidget }))),
  'quick_actions': React.lazy(() => import('./widgets/QuickActionsWidget').then(m => ({ default: m.QuickActionsWidget }))),
  'active_events': React.lazy(() => import('./widgets/ActiveEventsWidget').then(m => ({ default: m.ActiveEventsWidget }))),
  'upcoming_tasks': React.lazy(() => import('./widgets/UpcomingTasksWidget').then(m => ({ default: m.UpcomingTasksWidget }))),
  'crew_status': React.lazy(() => import('./widgets/CrewStatusWidget').then(m => ({ default: m.CrewStatusWidget }))),
  'today_schedule': React.lazy(() => import('./widgets/TodayScheduleWidget').then(m => ({ default: m.TodayScheduleWidget }))),
  'my_tasks': React.lazy(() => import('./widgets/MyTasksWidget').then(m => ({ default: m.MyTasksWidget }))),
  'quick_stats': React.lazy(() => import('./widgets/QuickStatsWidget').then(m => ({ default: m.QuickStatsWidget }))),

  // Form Components
  'form_step': React.lazy(() => import('./forms/FormStep').then(m => ({ default: m.FormStep }))),
  'welcome_screen': React.lazy(() => import('./onboarding/WelcomeScreen').then(m => ({ default: m.WelcomeScreen }))),
  'account_type_selector': React.lazy(() => import('./onboarding/AccountTypeSelector').then(m => ({ default: m.AccountTypeSelector }))),
  'profile_form': React.lazy(() => import('./onboarding/ProfileForm').then(m => ({ default: m.ProfileForm }))),
  'permission_review': React.lazy(() => import('./onboarding/PermissionReview').then(m => ({ default: m.PermissionReview }))),
  'onboarding_complete': React.lazy(() => import('./onboarding/OnboardingComplete').then(m => ({ default: m.OnboardingComplete }))),
};

// ============================================================================
// CONFIGURATION-DRIVEN COMPONENT RENDERER
// ============================================================================

interface ComponentRendererProps {
  componentType: string;
  config?: Record<string, any>;
  data?: Record<string, any>;
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
      <Alert className={className}>
        <AlertDescription>
          Unknown component type: {componentType}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <React.Suspense fallback={<Skeleton className={className} />}>
      <Component
        {...config}
        {...data}
        className={className}
      />
    </React.Suspense>
  );
}

// ============================================================================
// PAGE LAYOUT RENDERER
// ============================================================================

interface PageLayoutRendererProps {
  layoutSlug?: string;
  layoutType?: string;
  contextData?: Record<string, any>;
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
  const { data: layoutBySlug, isLoading: loadingSlug, error: errorSlug } = usePageLayout(layoutSlug || '');

  const { data: defaultLayout, isLoading: loadingDefault, error: errorDefault } = useDefaultPageLayout(layoutType || '');

  const layout = layoutBySlug || defaultLayout;
  const isLoading = loadingSlug || loadingDefault;
  const error = errorSlug || errorDefault;

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  if (error || !layout) {
    return (
      <Alert className={className}>
        <AlertDescription>
          {error ? `Failed to load layout: ${error.message}` : 'No layout found'}
        </AlertDescription>
      </Alert>
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
        <Alert className={className}>
          <AlertDescription>
            You don't have permission to view this page.
          </AlertDescription>
        </Alert>
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
        <Alert className={className}>
          <AlertDescription>
            This page is not available for your account type.
          </AlertDescription>
        </Alert>
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
  config: any,
  contextData: Record<string, any>
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
              {config.widgets.map((widget: any, index: number) => (
                <div
                  key={index}
                  className={`col-span-${widget.span || 12} ${widget.position || ''}`}
                >
                  <ComponentRenderer
                    componentType={widget.type}
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
            {config.steps.map((step: any, index: number) => (
              <ComponentRenderer
                key={index}
                componentType={step.component || 'form_step'}
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

function generateThemeClasses(themeConfig: Record<string, any>): string {
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

export function useDynamicComponent(componentType: string, props: Record<string, any> = {}) {
  const Component = COMPONENT_REGISTRY[componentType];

  if (!Component) {
    return {
      Component: () => (
        <Alert>
          <AlertDescription>
            Component "{componentType}" not found in registry.
          </AlertDescription>
        </Alert>
      ),
      isValid: false
    };
  }

  return {
    Component: (additionalProps: Record<string, any> = {}) => (
      <React.Suspense fallback={<Skeleton />}>
        <Component {...props} {...additionalProps} />
      </React.Suspense>
    ),
    isValid: true
  };
}
