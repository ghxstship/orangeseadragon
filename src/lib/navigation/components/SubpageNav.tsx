'use client';

import { EntitySchema } from '@/lib/schema/types';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/hooks/use-supabase';

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
  const supabase = useSupabase();
  const endpoint = (schema as { data?: { endpoint?: string } }).data?.endpoint;
  const table = endpoint?.replace('/api/', '').replace(/\//g, '_') ?? null;

  const { data: count } = useQuery({
    queryKey: ['subpage-count', table, subpage.key],
    queryFn: async () => {
      if (!table) return 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from as any)(table).select('id', { count: 'exact', head: true });
      if (subpage.query?.where) {
        for (const [field, value] of Object.entries(subpage.query.where)) {
          query = query.eq(field, value as string);
        }
      }
      const { count: c } = await query;
      return c ?? 0;
    },
    enabled: !!subpage.showCount && !!table,
    staleTime: 60 * 1000,
  });

  return (
    <li>
      <button
        className={cn('subpage-tab', isActive && 'subpage-tab-active')}
        onClick={onClick}
        aria-pressed={isActive}
      >
        {subpage.icon && (
          <div className="subpage-tab-icon">{subpage.icon}</div>
        )}
        <span className="subpage-tab-label">{subpage.label}</span>
        {subpage.showCount && count != null && count > 0 && (
          <span
            className={cn(
              'subpage-tab-count',
              subpage.countHighlight === 'when-nonzero' && count > 0 && 'highlighted'
            )}
          >
            {count}
          </span>
        )}
      </button>
    </li>
  );
}
