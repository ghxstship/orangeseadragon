'use client';

import { EntitySchema } from '@/lib/schema/types';
import { cn } from '@/lib/utils';

// Mock hooks - replace with actual implementations when available
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useSWR = (_key: string | null) => ({ data: null });

// Mock type - replace with actual schema types when available
interface SubpageDefinition {
  key: string;
  label: string;
  icon?: string;
  showCount?: boolean;
  countHighlight?: string;
  query: {
    where: Record<string, unknown>;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  };
}

// Mock function - replace with actual utility when available
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const buildQueryString = (_query: Record<string, unknown>) => '';

/**
 * SUBPAGE NAVIGATION
 *
 * Renders subpage tabs from schema definition.
 * NO hardcoded subpages allowed.
 */

interface SubpageNavProps {
  schema: EntitySchema;
  currentSubpage: string;
  onSubpageChange: (subpage: string) => void;
}

export function SubpageNav({ schema, currentSubpage, onSubpageChange }: SubpageNavProps) {
  const subpages = (schema as { layouts?: { list?: { subpages?: SubpageDefinition[] } } }).layouts?.list?.subpages || [];

  return (
    <nav className="subpage-nav" aria-label="Data filters">
      <ul className="subpage-nav-list">
        {subpages.map((subpage: SubpageDefinition) => (
          <SubpageTab
            key={subpage.key}
            subpage={subpage}
            isActive={currentSubpage === subpage.key}
            onClick={() => onSubpageChange(subpage.key)}
            schema={schema}
          />
        ))}
      </ul>
    </nav>
  );
}

interface SubpageTabProps {
  subpage: SubpageDefinition;
  isActive: boolean;
  onClick: () => void;
  schema: EntitySchema;
}

function SubpageTab({ subpage, isActive, onClick, schema }: SubpageTabProps) {
  // Fetch count if enabled
  const { data: countData } = useSWR(
    subpage.showCount
      ? `${(schema as { data?: { endpoint?: string } }).data?.endpoint}/count?${buildQueryString(subpage.query)}`
      : null
  );

  return (
    <li>
      <button
        className={cn('subpage-tab', isActive && 'subpage-tab-active')}
        onClick={onClick}
        aria-pressed={isActive}
      >
        {subpage.icon && (
          /* Icon component - placeholder */
          <div className="subpage-tab-icon">{subpage.icon}</div>
        )}
        <span className="subpage-tab-label">{subpage.label}</span>
        {subpage.showCount && countData && (
          <span
            className={cn(
              'subpage-tab-count',
              subpage.countHighlight === 'when-nonzero' && (countData as { count: number }).count > 0 && 'highlighted'
            )}
          >
            {(countData as { count: number }).count}
          </span>
        )}
      </button>
    </li>
  );
}
