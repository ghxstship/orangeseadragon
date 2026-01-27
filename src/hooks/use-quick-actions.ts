'use client';

import { useState, useEffect, useCallback } from 'react';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  variant: 'default' | 'outline' | 'secondary';
  category: 'form' | 'workflow' | 'navigation';
}

const STORAGE_KEY = 'quick-actions-config';

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    icon: 'Plus',
    href: '/modules/projects/projects/new',
    variant: 'default',
    category: 'form',
  },
  {
    id: 'create-task',
    label: 'Create Task',
    icon: 'FileText',
    href: '/core/tasks/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/account/platform',
    variant: 'secondary',
    category: 'navigation',
  },
];

export const AVAILABLE_ACTIONS: QuickAction[] = [
  // Forms - Create entities
  {
    id: 'new-project',
    label: 'New Project',
    icon: 'Plus',
    href: '/modules/projects/projects/new',
    variant: 'default',
    category: 'form',
  },
  {
    id: 'create-task',
    label: 'Create Task',
    icon: 'FileText',
    href: '/core/tasks/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-event',
    label: 'New Event',
    icon: 'Calendar',
    href: '/modules/operations/events/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-contact',
    label: 'New Contact',
    icon: 'Users',
    href: '/modules/business/contacts/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-invoice',
    label: 'New Invoice',
    icon: 'Receipt',
    href: '/modules/finance/invoices/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-expense',
    label: 'New Expense',
    icon: 'CreditCard',
    href: '/modules/finance/expenses/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-document',
    label: 'New Document',
    icon: 'File',
    href: '/core/documents/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-asset',
    label: 'New Asset',
    icon: 'Package',
    href: '/modules/assets/inventory/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-venue',
    label: 'New Venue',
    icon: 'MapPin',
    href: '/modules/operations/venues/new',
    variant: 'outline',
    category: 'form',
  },
  {
    id: 'new-deal',
    label: 'New Deal',
    icon: 'Handshake',
    href: '/modules/business/deals/new',
    variant: 'outline',
    category: 'form',
  },
  // Workflows
  {
    id: 'run-workflow',
    label: 'Run Workflow',
    icon: 'Zap',
    href: '/core/workflows',
    variant: 'outline',
    category: 'workflow',
  },
  // Navigation
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/account/platform',
    variant: 'secondary',
    category: 'navigation',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'Calendar',
    href: '/core/calendar',
    variant: 'outline',
    category: 'navigation',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/core/dashboard',
    variant: 'outline',
    category: 'navigation',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'Activity',
    href: '/core/activity',
    variant: 'outline',
    category: 'navigation',
  },
];

export function useQuickActions() {
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setActions(parsed);
        } catch {
          setActions(DEFAULT_ACTIONS);
        }
      } else {
        setActions(DEFAULT_ACTIONS);
      }
      setIsLoaded(true);
    }
  }, []);

  const saveActions = useCallback((newActions: QuickAction[]) => {
    setActions(newActions);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newActions));
    }
  }, []);

  const addAction = useCallback((action: QuickAction) => {
    const newActions = [...actions, action];
    saveActions(newActions);
  }, [actions, saveActions]);

  const removeAction = useCallback((actionId: string) => {
    const newActions = actions.filter(a => a.id !== actionId);
    saveActions(newActions);
  }, [actions, saveActions]);

  const reorderActions = useCallback((fromIndex: number, toIndex: number) => {
    const newActions = [...actions];
    const [removed] = newActions.splice(fromIndex, 1);
    newActions.splice(toIndex, 0, removed);
    saveActions(newActions);
  }, [actions, saveActions]);

  const resetToDefaults = useCallback(() => {
    saveActions(DEFAULT_ACTIONS);
  }, [saveActions]);

  return {
    actions,
    isLoaded,
    addAction,
    removeAction,
    reorderActions,
    saveActions,
    resetToDefaults,
    availableActions: AVAILABLE_ACTIONS,
  };
}
