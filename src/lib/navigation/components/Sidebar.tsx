'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { informationArchitecture, SidebarGroupDefinition, PageDefinition } from '../ia-structure';
import { cn } from '@/lib/utils';

// Mock hooks - replace with actual implementations when available
const usePermissions = () => ({ hasPermission: (permission?: string) => true });
const useSWR = () => ({ data: null });

/**
 * CONSOLIDATED SIDEBAR
 *
 * Single source of truth for navigation.
 * Renders ONLY from informationArchitecture definition.
 * NO hardcoded links allowed.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  // Filter groups and pages by permission
  const visibleGroups = useMemo(() => {
    return (informationArchitecture.groups
      .filter((group: SidebarGroupDefinition) => !group.permission || hasPermission(group.permission))
      .map(group => ({
        ...group,
        pages: (group.pages as unknown as string[])
          .map((pageKey: string) => informationArchitecture.pages[pageKey as keyof typeof informationArchitecture.pages])
          .filter((page: PageDefinition) => !page.permission || hasPermission(page.permission)),
      })) as (SidebarGroupDefinition & { pages: PageDefinition[] })[])
      .filter(group => group.pages.length > 0);
  }, [hasPermission]);

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {visibleGroups.map(group => (
        <SidebarGroup
          key={group.key}
          group={group}
          currentPath={pathname}
        />
      ))}
    </nav>
  );
}

interface SidebarGroupProps {
  group: SidebarGroupDefinition & { pages: PageDefinition[] };
  currentPath: string;
}

function SidebarGroup({ group, currentPath }: SidebarGroupProps) {
  const isExpanded = group.defaultExpanded ?? true;
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <div className="sidebar-group">
      {group.collapsible !== false && (
        <button
          className="sidebar-group-header"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {/* Icon component - placeholder */}
          <div className="sidebar-group-icon">{group.icon}</div>
          <span className="sidebar-group-label">{group.label}</span>
          {/* Chevron icon - placeholder */}
          <div className="sidebar-group-chevron">{expanded ? '↓' : '→'}</div>
        </button>
      )}

      {(expanded || group.collapsible === false) && (
        <ul className="sidebar-group-pages">
          {group.pages.map((page: PageDefinition) => (
            <SidebarPage
              key={page.key}
              page={page}
              isActive={currentPath === page.path || currentPath.startsWith(`${page.path}/`)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SidebarPageProps {
  page: PageDefinition;
  isActive: boolean;
}

function SidebarPage({ page, isActive }: SidebarPageProps) {
  return (
    <li>
      <Link
        href={page.path}
        className={cn('sidebar-page', isActive && 'sidebar-page-active')}
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Icon component - placeholder */}
        <div className="sidebar-page-icon">{page.icon}</div>
        <span className="sidebar-page-label">{page.label}</span>
        {page.badge && <PageBadge config={page.badge} />}
      </Link>
    </li>
  );
}

function PageBadge({ config }: { config: PageDefinition['badge'] }) {
  const { data } = useSWR();

  if (!data) return null;

  return (
    <span className={cn('sidebar-badge', `sidebar-badge-${config?.type}`)}>
      {config?.type === 'count' ? (data as { count: number }).count : ''}
    </span>
  );
}
