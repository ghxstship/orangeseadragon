import {
  DetailTabDefinition,
  EntityRecord,
  EntitySchema,
  OverviewBlockDefinition,
  QuickStatDefinition,
} from '@/lib/schema/types';
import { CrudList } from './CrudList';
import { getSchema } from '@/lib/schemas';

interface TabRendererProps {
  schema: EntitySchema;
  tabConfig?: DetailTabDefinition;
  record: EntityRecord;
  onRefresh: () => void;
}

/**
 * TAB RENDERER COMPONENT
 *
 * Renders tab content based on schema configuration.
 * Supports overview, related entities, activity, comments, files, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TabRenderer({ schema, tabConfig, record, onRefresh }: TabRendererProps) {
  if (!tabConfig) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Tab configuration not found</p>
      </div>
    );
  }

  const { content } = tabConfig;

  switch (content.type) {
    case 'overview':
      return <OverviewTab schema={schema} record={record} />;

    case 'related':
      return (
        <RelatedTab
          relatedSchema={content.entity}
          foreignKey={content.foreignKey}
          record={record}
          defaultView={content.defaultView}
          allowCreate={content.allowCreate}
        />
      );

    case 'activity':
      return <ActivityTab record={record} />;

    case 'comments':
      return <CommentsTab record={record} />;

    case 'files':
      return <FilesTab record={record} />;

    case 'custom':
      // For custom components, we'd need a component registry
      return <div>Custom tab: {content.component}</div>;

    default:
      return (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Unknown tab type: {content.type}</p>
        </div>
      );
  }
}

/**
 * Overview tab showing stats and key information
 */
function OverviewTab({ schema, record }: { schema: EntitySchema; record: EntityRecord }) {
  const overview = schema.layouts.detail.overview;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {overview.stats && overview.stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overview.stats.map(stat => (
            <StatCard key={stat.key} stat={stat} record={record} />
          ))}
        </div>
      )}

      {/* Overview Blocks */}
      {overview.blocks.map(block => (
        <OverviewBlock key={block.key} block={block} record={record} />
      ))}
    </div>
  );
}

/**
 * Related entities tab
 */
interface RelatedTabProps {
  relatedSchema: string;
  foreignKey: string;
  record: EntityRecord;
  defaultView?: string;
  allowCreate?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RelatedTab({ relatedSchema, foreignKey, record, defaultView, allowCreate }: RelatedTabProps) {
  const schema = getSchema(relatedSchema);

  if (!schema) {
    return (
      <div className="p-6">
        <p className="text-destructive font-semibold">Schema for &quot;{relatedSchema}&quot; not found</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <CrudList
        schema={schema as EntitySchema<EntityRecord>}
        filter={{ [foreignKey]: record.id }}
      />
    </div>
  );
}

/**
 * Activity timeline tab
 */
function ActivityTab({ record }: { record: EntityRecord }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Activity</h3>
      <p className="text-muted-foreground">Activity timeline for {record.id}</p>
      {/* TODO: Implement activity timeline */}
    </div>
  );
}

/**
 * Comments tab
 */
function CommentsTab({ record }: { record: EntityRecord }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Comments</h3>
      <p className="text-muted-foreground">Comments for {record.id}</p>
      {/* TODO: Implement comments system */}
    </div>
  );
}

/**
 * Files tab
 */
function FilesTab({ record }: { record: EntityRecord }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Files</h3>
      <p className="text-muted-foreground">Files attached to {record.id}</p>
      {/* TODO: Implement file attachments */}
    </div>
  );
}

/**
 * Quick stat card component
 */
function StatCard({ stat, record }: { stat: QuickStatDefinition; record: EntityRecord }) {
  // Compute stat value
  let value: string | number = '';

  if (stat.value.type === 'field') {
    value = record[stat.value.field] || 0;
  } else if (stat.value.type === 'computed') {
    value = stat.value.compute(record);
  }

  // Format value
  if (stat.format === 'currency') {
    value = `$${value.toLocaleString()}`;
  } else if (stat.format === 'percentage') {
    value = `${value}%`;
  }

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
    </div>
  );
}

/**
 * Overview block component
 */
function OverviewBlock({ block, record }: { block: OverviewBlockDefinition; record: EntityRecord }) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h4 className="text-lg font-medium mb-4">{block.title || block.key}</h4>

      {block.content.type === 'fields' && (
        <div className="space-y-4">
          {block.content.fields.map((field: string) => (
            <div key={field} className="flex justify-between">
              <span className="text-muted-foreground">{field}:</span>
              <span className="font-medium">{record[field] || 'N/A'}</span>
            </div>
          ))}
        </div>
      )}

      {/* TODO: Implement other block types */}
    </div>
  );
}
