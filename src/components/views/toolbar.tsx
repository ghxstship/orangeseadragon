"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Search,
  Filter,
  SortAsc,
  Columns3,
  LayoutGrid,
  List,
  Table2,
  Calendar,
  Kanban,
  Map,
  Download,
  Upload,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  Archive,
  Tag,
  Users,
  ChevronDown,
  X,
  QrCode,
  GripVertical,
} from "lucide-react";

export type ViewType = "table" | "list" | "grid" | "kanban" | "calendar" | "timeline" | "gantt" | "map" | "workload" | "matrix";

export interface ToolbarFilter {
  id: string;
  label: string;
  field?: string;
  type?: string;
  operator?: string;
  value?: string | string[];
  options?: Array<{ label: string; value: string }>;
}

export interface ToolbarSort {
  field: string;
  direction: "asc" | "desc";
}

export interface ToolbarColumn {
  id: string;
  label: string;
  visible: boolean;
}

interface SortableColumnItemProps {
  column: ToolbarColumn;
  onVisibilityChange: (visible: boolean) => void;
}

function SortableColumnItem({ column, onVisibilityChange }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      <Label htmlFor={`toolbar-column-${column.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
        <Checkbox
          id={`toolbar-column-${column.id}`}
          checked={column.visible}
          onCheckedChange={(checked) => onVisibilityChange(Boolean(checked))}
        />
        <span className="text-sm">{column.label}</span>
      </Label>
    </div>
  );
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
}

interface ColumnsDropdownProps {
  columns: {
    items: ToolbarColumn[];
    onChange: (columns: ToolbarColumn[]) => void;
    onReorder?: (columnIds: string[]) => void;
  };
}

function ColumnsDropdown({ columns }: ColumnsDropdownProps) {
  const [localItems, setLocalItems] = React.useState(columns.items);
  
  // Sync local state with props
  React.useEffect(() => {
    setLocalItems(columns.items);
  }, [columns.items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);
      
      // Notify parent of reorder
      if (columns.onReorder) {
        columns.onReorder(newItems.map((item) => item.id));
      }
    }
  };

  const handleVisibilityChange = (columnId: string, visible: boolean) => {
    const newItems = localItems.map((item) =>
      item.id === columnId ? { ...item, visible } : item
    );
    setLocalItems(newItems);
    columns.onChange(newItems);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Columns3 className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[240px] p-2">
        <div className="mb-2 px-2 text-sm font-medium text-muted-foreground">
          Toggle & reorder columns
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0.5">
              {localItems.map((column) => (
                <SortableColumnItem
                  key={column.id}
                  column={column}
                  onVisibilityChange={(visible) =>
                    handleVisibilityChange(column.id, visible)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </PopoverContent>
    </Popover>
  );
}

export interface ToolbarProps {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: {
    active: ToolbarFilter[];
    available: ToolbarFilter[];
    onAdd: (filter: ToolbarFilter) => void;
    onRemove: (filterId: string) => void;
    onClear: () => void;
  };
  sort?: {
    value: ToolbarSort | null;
    options: Array<{ field: string; label: string }>;
    onChange: (sort: ToolbarSort | null) => void;
  };
  columns?: {
    items: ToolbarColumn[];
    onChange: (columns: ToolbarColumn[]) => void;
    onReorder?: (columnIds: string[]) => void;
  };
  view?: {
    current: ViewType;
    available: ViewType[];
    onChange: (view: ViewType) => void;
  };
  actions?: {
    primary?: ToolbarAction;
    secondary?: ToolbarAction[];
    bulk?: ToolbarAction[];
  };
  import?: {
    onImport: (file: File) => void;
    accept?: string;
  };
  export?: {
    formats: Array<"csv" | "xlsx" | "pdf" | "json">;
    onExport: (format: string) => void;
  };
  scan?: {
    onScan: () => void;
  };
  refresh?: {
    onRefresh: () => void;
    loading?: boolean;
  };
  selectedCount?: number;
  className?: string;
}

const viewIcons: Record<ViewType, React.ReactNode> = {
  table: <Table2 className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
  grid: <LayoutGrid className="h-4 w-4" />,
  kanban: <Kanban className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  timeline: <Columns3 className="h-4 w-4" />,
  gantt: <Columns3 className="h-4 w-4" />,
  map: <Map className="h-4 w-4" />,
  workload: <Users className="h-4 w-4" />,
  matrix: <Table2 className="h-4 w-4" />,
};

export function Toolbar({
  search,
  filters,
  sort,
  columns,
  view,
  actions,
  import: importConfig,
  export: exportConfig,
  scan,
  refresh,
  selectedCount = 0,
  className,
}: ToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && importConfig?.onImport) {
      importConfig.onImport(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {search && (
        <div className="relative flex-1 min-w-[150px] sm:min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={search.placeholder || "Search..."}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {filters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {filters.active.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.active.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="start">
              <div className="space-y-4">
                <div className="font-medium">Filters</div>
                {filters.active.length > 0 && (
                  <div className="space-y-2">
                    {filters.active.map((filter) => (
                      <div key={filter.id} className="flex items-center justify-between">
                        <span className="text-sm">
                          {filter.label}: {Array.isArray(filter.value) ? filter.value.join(", ") : filter.value}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => filters.onRemove(filter.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={filters.onClear}>
                      Clear all
                    </Button>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Add filter</div>
                  {filters.available.map((filter) => (
                    <Button
                      key={filter.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => filters.onAdd(filter)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {sort && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <SortAsc className="mr-2 h-4 w-4" />
                Sort
                {sort.value && (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sort.options.map((option) => (
                <DropdownMenuItem
                  key={option.field}
                  onClick={() =>
                    sort.onChange({
                      field: option.field,
                      direction: sort.value?.field === option.field && sort.value.direction === "asc" ? "desc" : "asc",
                    })
                  }
                >
                  {option.label}
                  {sort.value?.field === option.field && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {sort.value.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
              {sort.value && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => sort.onChange(null)}>
                    Clear sort
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {columns && (
          <ColumnsDropdown columns={columns} />
        )}

        {view && view.available.length > 1 && (
          <div className="flex items-center border rounded-md">
            {view.available.map((v) => (
              <Button
                key={v}
                variant={view.current === v ? "secondary" : "ghost"}
                size="sm"
                className="h-9 px-3 rounded-none first:rounded-l-md last:rounded-r-md"
                onClick={() => view.onChange(v)}
              >
                {viewIcons[v]}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {selectedCount > 0 && actions?.bulk && (
          <>
            <Badge variant="secondary">{selectedCount} selected</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.bulk.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={action.variant === "destructive" ? "text-destructive" : ""}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Desktop-only: scan, import, export, refresh */}
        {scan && (
          <Button variant="outline" size="sm" onClick={scan.onScan} className="hidden md:inline-flex">
            <QrCode className="mr-2 h-4 w-4" />
            Scan
          </Button>
        )}

        {importConfig && (
          <>
            <Input
              ref={fileInputRef}
              type="file"
              accept={importConfig.accept || ".csv,.xlsx,.json"}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="hidden md:inline-flex">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </>
        )}

        {exportConfig && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:inline-flex">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {exportConfig.formats.map((format) => (
                <DropdownMenuItem key={format} onClick={() => exportConfig.onExport(format)}>
                  Export as {format.toUpperCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {refresh && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 hidden md:inline-flex"
            onClick={refresh.onRefresh}
            disabled={refresh.loading}
          >
            <RefreshCw className={cn("h-4 w-4", refresh.loading && "animate-spin")} />
          </Button>
        )}

        {/* Overflow menu — always visible, includes mobile-only items */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Mobile-only items */}
            {scan && (
              <DropdownMenuItem className="md:hidden" onClick={scan.onScan}>
                <QrCode className="h-4 w-4 mr-2" />
                Scan
              </DropdownMenuItem>
            )}
            {importConfig && (
              <DropdownMenuItem className="md:hidden" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
            )}
            {exportConfig && exportConfig.formats.map((fmt) => (
              <DropdownMenuItem key={fmt} className="md:hidden" onClick={() => exportConfig.onExport(fmt)}>
                <Download className="h-4 w-4 mr-2" />
                Export {fmt.toUpperCase()}
              </DropdownMenuItem>
            ))}
            {refresh && (
              <DropdownMenuItem className="md:hidden" onClick={refresh.onRefresh} disabled={refresh.loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
            )}
            {/* Secondary actions — always visible */}
            {actions?.secondary && actions.secondary.length > 0 && (
              <>
                <DropdownMenuSeparator />
                {actions.secondary.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {actions?.primary && (
          <Button
            variant={actions.primary.variant || "default"}
            size="sm"
            onClick={actions.primary.onClick}
            disabled={actions.primary.disabled}
          >
            {actions.primary.icon || <Plus className="mr-2 h-4 w-4" />}
            {actions.primary.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export const defaultBulkActions: ToolbarAction[] = [
  { id: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, variant: "destructive" },
  { id: "duplicate", label: "Duplicate", icon: <Copy className="h-4 w-4" />, onClick: () => {} },
  { id: "archive", label: "Archive", icon: <Archive className="h-4 w-4" />, onClick: () => {} },
  { id: "tag", label: "Add Tag", icon: <Tag className="h-4 w-4" />, onClick: () => {} },
  { id: "assign", label: "Assign", icon: <Users className="h-4 w-4" />, onClick: () => {} },
];
