"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
  ColumnSizingState,
  GroupingState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MoreHorizontal,
} from "lucide-react";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface RowAction<TData> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
  disabled?: boolean | ((row: TData) => boolean);
  hidden?: boolean | ((row: TData) => boolean);
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  showColumnToggle?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  selectable?: boolean;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowActions?: RowAction<TData>[];
  getRowId?: (row: TData) => string;
  density?: "comfortable" | "compact";
  resizable?: boolean;
  grouping?: string[];
  onGroupingChange?: (grouping: string[]) => void;
  /** Optional wrapper around each data row (e.g. RecordContextMenu) */
  renderRowWrapper?: (row: TData, children: React.ReactNode) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showColumnToggle = true,
  showPagination = true,
  showSearch = true,
  selectable = false,
  onRowClick,
  onSelectionChange,
  loading = false,
  emptyMessage = "No results found.",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rowActions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRowId,
  density = "comfortable",
  resizable = true,
  grouping: externalGrouping,
  onGroupingChange,
  renderRowWrapper,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>(externalGrouping || []);

  // Sync external grouping
  React.useEffect(() => {
    if (externalGrouping) setGrouping(externalGrouping);
  }, [externalGrouping]);

  const selectColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const actionsColumn: ColumnDef<TData, TValue> = {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const rowData = row.original;
      const visibleActions = rowActions?.filter((action) => {
        if (typeof action.hidden === "function") return !action.hidden(rowData);
        return !action.hidden;
      });

      if (!visibleActions || visibleActions.length === 0) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {visibleActions.map((action) => {
              const isDisabled = typeof action.disabled === "function"
                ? action.disabled(rowData)
                : action.disabled;

              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(rowData);
                  }}
                  disabled={isDisabled}
                  className={action.variant === "destructive" ? "text-destructive" : undefined}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  };

  const tableColumns = React.useMemo(() => {
    let cols = [...columns];
    if (selectable) {
      cols = [selectColumn, ...cols];
    }
    if (rowActions && rowActions.length > 0) {
      cols = [...cols, actionsColumn];
    }
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, selectable, rowActions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    onGroupingChange: (updater) => {
      const next = typeof updater === "function" ? updater(grouping) : updater;
      setGrouping(next);
      onGroupingChange?.(next);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    columnResizeMode: "onChange",
    onColumnSizingChange: setColumnSizing,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnSizing,
      grouping,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {showSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchKey ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? "" : globalFilter}
              onChange={(event) =>
                searchKey
                  ? table.getColumn(searchKey)?.setFilterValue(event.target.value)
                  : setGlobalFilter(event.target.value)
              }
              className="pl-9"
            />
          </div>
        )}
        {showColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="relative overflow-auto max-h-[50vh] sm:max-h-[70vh]">
          <Table className="relative w-full border-collapse" style={{ width: resizable ? table.getCenterTotalSize() : "100%" }}>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="relative p-0 h-10 border-b bg-card/50 backdrop-blur-md"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="group flex h-full items-center px-4">
                            <div
                              className={cn(
                                "flex items-center gap-2 flex-1",
                                header.column.getCanSort() && "cursor-pointer select-none"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <span className="text-muted-foreground">
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ArrowUp className="h-4 w-4" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ArrowDown className="h-4 w-4" />
                                  ) : (
                                    <ArrowUpDown className="h-4 w-4 hidden group-hover:block" />
                                  )}
                                </span>
                              )}
                            </div>
                            {resizable && header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={cn(
                                  "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border opacity-0 hover:opacity-100 transition-opacity",
                                  header.column.getIsResizing() && "bg-primary opacity-100 w-1"
                                )}
                              />
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  if (row.getIsGrouped()) {
                    return (
                      <TableRow key={row.id} className="bg-muted/30 group hover:bg-muted/50">
                        <TableCell
                          colSpan={row.getVisibleCells().length}
                          className="px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground"
                          onClick={() => row.toggleExpanded()}
                        >
                          <div className="flex items-center gap-2 cursor-pointer">
                            {row.getIsExpanded() ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span>
                              {flexRender(
                                row.getVisibleCells()[0].column.columnDef.cell,
                                row.getVisibleCells()[0].getContext()
                              )}
                            </span>
                            <Badge variant="outline" className="ml-2 font-normal lowercase tracking-normal">
                              {row.subRows.length} items
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  const tableRow = (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "group border-b transition-colors",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        if (cell.getIsGrouped()) return null;
                        if (cell.getIsPlaceholder()) return <TableCell key={cell.id} />;

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "px-4 transition-all duration-200",
                              density === "compact" ? "py-1.5" : "py-4",
                              cell.column.id === "select" && "sticky left-0 z-20 bg-card/90 backdrop-blur-sm shadow-[1px_0_0_0_rgba(0,0,0,0.05)]"
                            )}
                            style={{ width: cell.column.getSize() }}
                          >
                            {cell.getIsAggregated()
                              ? flexRender(
                                cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                                cell.getContext()
                              )
                              : flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );

                  return renderRowWrapper
                    ? <React.Fragment key={row.id}>{renderRowWrapper(row.original, tableRow)}</React.Fragment>
                    : tableRow;
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {showPagination && (
        <div className="flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectable && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function createSortableHeader(label: string) {
  function SortableHeader({ column }: { column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void } }) {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        {label}
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    );
  }
  return SortableHeader;
}
