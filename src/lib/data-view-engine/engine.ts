/**
 * Data View Engine
 * Core engine for data querying and view management
 */

import {
  DataSource,
  DataView,
  ColumnDefinition,
  FilterDefinition,
  FilterGroup,
  SortDefinition,
  CompiledQuery,
  QueryResult,
  FilterOperator,
  AggregateFunction,
  JoinDefinition,
} from "./types";

export class DataViewEngine {
  private dataSources: Map<string, DataSource>;
  private dataViews: Map<string, DataView>;

  constructor() {
    this.dataSources = new Map();
    this.dataViews = new Map();
  }

  registerDataSource(source: DataSource): void {
    this.dataSources.set(source.id, source);
  }

  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.get(id);
  }

  registerDataView(view: DataView): void {
    this.dataViews.set(view.id, view);
  }

  getDataView(id: string): DataView | undefined {
    return this.dataViews.get(id);
  }

  createQueryBuilder(sourceId: string): QueryBuilderImpl {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      throw new Error(`Data source not found: ${sourceId}`);
    }
    return new QueryBuilderImpl(source);
  }

  async executeQuery<T = Record<string, unknown>>(
    query: CompiledQuery,
    executor: QueryExecutor
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    const result = await executor.execute<T>(query);
    
    result.metadata = {
      executionTime: Date.now() - startTime,
      cached: false,
      source: query.source,
    };

    return result;
  }

  compileViewQuery(viewId: string, overrides?: QueryOverrides): CompiledQuery {
    const view = this.dataViews.get(viewId);
    if (!view) {
      throw new Error(`Data view not found: ${viewId}`);
    }

    const builder = new QueryBuilderImpl(view.source);

    // Select columns
    const fields = view.columns
      .filter((col) => col.visible !== false)
      .map((col) => col.field);
    builder.select(fields);

    // Apply filters
    const filters = this.mergeFilters(view.filters, overrides?.filters);
    if (filters) {
      builder.where(filters);
    }

    // Apply sorts
    const sorts = overrides?.sorts ?? view.sorts;
    if (sorts && sorts.length > 0) {
      builder.orderBy(sorts);
    }

    // Apply pagination
    if (view.pagination?.enabled) {
      const page = overrides?.page ?? 1;
      const pageSize = overrides?.pageSize ?? view.pagination.pageSize;
      builder.limit(pageSize);
      builder.offset((page - 1) * pageSize);
    }

    return builder.build();
  }

  private mergeFilters(
    viewFilters?: FilterGroup,
    overrideFilters?: FilterGroup
  ): FilterGroup | undefined {
    if (!viewFilters && !overrideFilters) return undefined;
    if (!viewFilters) return overrideFilters;
    if (!overrideFilters) return viewFilters;

    return {
      logic: "and",
      filters: [viewFilters, overrideFilters],
    };
  }

  evaluateFilter(record: Record<string, unknown>, filter: FilterDefinition): boolean {
    const value = this.getNestedValue(record, filter.field);
    return this.compareValues(value, filter.operator, filter.value);
  }

  evaluateFilterGroup(record: Record<string, unknown>, group: FilterGroup): boolean {
    const results = group.filters.map((f) => {
      if ("logic" in f) {
        return this.evaluateFilterGroup(record, f);
      }
      return this.evaluateFilter(record, f);
    });

    return group.logic === "and"
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split(".");
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private compareValues(
    value: unknown,
    operator: FilterOperator,
    compareValue: unknown
  ): boolean {
    switch (operator) {
      case "eq":
        return value === compareValue;
      case "ne":
        return value !== compareValue;
      case "gt":
        return (value as number) > (compareValue as number);
      case "gte":
        return (value as number) >= (compareValue as number);
      case "lt":
        return (value as number) < (compareValue as number);
      case "lte":
        return (value as number) <= (compareValue as number);
      case "contains":
        return String(value).toLowerCase().includes(String(compareValue).toLowerCase());
      case "notContains":
        return !String(value).toLowerCase().includes(String(compareValue).toLowerCase());
      case "startsWith":
        return String(value).toLowerCase().startsWith(String(compareValue).toLowerCase());
      case "endsWith":
        return String(value).toLowerCase().endsWith(String(compareValue).toLowerCase());
      case "in":
        return (compareValue as unknown[]).includes(value);
      case "notIn":
        return !(compareValue as unknown[]).includes(value);
      case "isNull":
        return value === null || value === undefined;
      case "isNotNull":
        return value !== null && value !== undefined;
      case "between":
        const [min, max] = compareValue as [number, number];
        return (value as number) >= min && (value as number) <= max;
      case "regex":
        return new RegExp(compareValue as string).test(String(value));
      default:
        return false;
    }
  }

  sortRecords<T extends Record<string, unknown>>(
    records: T[],
    sorts: SortDefinition[]
  ): T[] {
    return [...records].sort((a, b) => {
      for (const sort of sorts) {
        const aVal = this.getNestedValue(a, sort.field);
        const bVal = this.getNestedValue(b, sort.field);

        if (aVal === bVal) continue;

        if (aVal === null || aVal === undefined) {
          return sort.nullsFirst ? -1 : 1;
        }
        if (bVal === null || bVal === undefined) {
          return sort.nullsFirst ? 1 : -1;
        }

        const comparison = aVal < bVal ? -1 : 1;
        return sort.direction === "asc" ? comparison : -comparison;
      }
      return 0;
    });
  }

  aggregate<T extends Record<string, unknown>>(
    records: T[],
    field: string,
    func: AggregateFunction
  ): unknown {
    if (records.length === 0) return null;

    const values = records
      .map((r) => this.getNestedValue(r, field))
      .filter((v) => v !== null && v !== undefined);

    switch (func) {
      case "count":
        return values.length;
      case "sum":
        return values.reduce((acc: number, v) => acc + (v as number), 0);
      case "avg":
        const sum = values.reduce((acc: number, v) => acc + (v as number), 0);
        return values.length > 0 ? sum / values.length : 0;
      case "min":
        return Math.min(...(values as number[]));
      case "max":
        return Math.max(...(values as number[]));
      case "first":
        return values[0];
      case "last":
        return values[values.length - 1];
      default:
        return null;
    }
  }

  groupRecords<T extends Record<string, unknown>>(
    records: T[],
    groupFields: string[]
  ): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    for (const record of records) {
      const key = groupFields
        .map((f) => String(this.getNestedValue(record, f)))
        .join("|");

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    return groups;
  }

  formatColumnValue(
    value: unknown,
    column: ColumnDefinition
  ): string {
    if (value === null || value === undefined) return "";

    if (!column.format) return String(value);

    switch (column.format.type) {
      case "currency":
        const currency = (column.format.options?.currency as string) ?? "USD";
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
        }).format(value as number);

      case "number":
        const decimals = (column.format.options?.decimals as number) ?? 0;
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value as number);

      case "date":
        return new Date(value as string).toLocaleDateString();

      case "datetime":
        return new Date(value as string).toLocaleString();

      case "boolean":
        return value ? "Yes" : "No";

      default:
        return String(value);
    }
  }
}

class QueryBuilderImpl {
  private source: DataSource;
  private query: Partial<CompiledQuery>;

  constructor(source: DataSource) {
    this.source = source;
    this.query = {
      source: source.id,
      fields: [],
    };
  }

  select(fields: string[]): QueryBuilderImpl {
    this.query.fields = fields;
    return this;
  }

  where(filter: FilterDefinition | FilterGroup): QueryBuilderImpl {
    if ("logic" in filter) {
      this.query.filters = filter;
    } else {
      this.query.filters = {
        logic: "and",
        filters: [filter],
      };
    }
    return this;
  }

  orderBy(sort: SortDefinition | SortDefinition[]): QueryBuilderImpl {
    this.query.sorts = Array.isArray(sort) ? sort : [sort];
    return this;
  }

  groupBy(fields: string[]): QueryBuilderImpl {
    this.query.groups = fields;
    return this;
  }

  having(filter: FilterGroup): QueryBuilderImpl {
    this.query.having = filter;
    return this;
  }

  limit(count: number): QueryBuilderImpl {
    this.query.limit = count;
    return this;
  }

  offset(count: number): QueryBuilderImpl {
    this.query.offset = count;
    return this;
  }

  join(relation: JoinDefinition): QueryBuilderImpl {
    if (!this.query.joins) {
      this.query.joins = [];
    }
    this.query.joins.push(relation);
    return this;
  }

  build(): CompiledQuery {
    return {
      source: this.query.source!,
      fields: this.query.fields!,
      filters: this.query.filters,
      sorts: this.query.sorts,
      groups: this.query.groups,
      having: this.query.having,
      limit: this.query.limit,
      offset: this.query.offset,
      joins: this.query.joins,
      sql: this.generateSQL(),
      params: this.generateParams(),
    };
  }

  private generateSQL(): string {
    const parts: string[] = [];

    // SELECT
    const fields = this.query.fields?.length ? this.query.fields.join(", ") : "*";
    parts.push(`SELECT ${fields}`);

    // FROM
    parts.push(`FROM ${this.source.entity ?? this.source.id}`);

    // JOINS
    if (this.query.joins) {
      for (const join of this.query.joins) {
        parts.push(
          `${join.type.toUpperCase()} JOIN ${join.source} ON ${join.on.leftField} = ${join.on.rightField}`
        );
      }
    }

    // WHERE
    if (this.query.filters) {
      parts.push(`WHERE ${this.filterGroupToSQL(this.query.filters)}`);
    }

    // GROUP BY
    if (this.query.groups?.length) {
      parts.push(`GROUP BY ${this.query.groups.join(", ")}`);
    }

    // HAVING
    if (this.query.having) {
      parts.push(`HAVING ${this.filterGroupToSQL(this.query.having)}`);
    }

    // ORDER BY
    if (this.query.sorts?.length) {
      const orderBy = this.query.sorts
        .map((s) => `${s.field} ${s.direction.toUpperCase()}`)
        .join(", ");
      parts.push(`ORDER BY ${orderBy}`);
    }

    // LIMIT & OFFSET
    if (this.query.limit !== undefined) {
      parts.push(`LIMIT ${this.query.limit}`);
    }
    if (this.query.offset !== undefined) {
      parts.push(`OFFSET ${this.query.offset}`);
    }

    return parts.join(" ");
  }

  private filterGroupToSQL(group: FilterGroup): string {
    const conditions = group.filters.map((f) => {
      if ("logic" in f) {
        return `(${this.filterGroupToSQL(f)})`;
      }
      return this.filterToSQL(f);
    });

    return conditions.join(` ${group.logic.toUpperCase()} `);
  }

  private filterToSQL(filter: FilterDefinition): string {
    const field = filter.field;
    const value = filter.value;

    switch (filter.operator) {
      case "eq":
        return `${field} = ?`;
      case "ne":
        return `${field} != ?`;
      case "gt":
        return `${field} > ?`;
      case "gte":
        return `${field} >= ?`;
      case "lt":
        return `${field} < ?`;
      case "lte":
        return `${field} <= ?`;
      case "contains":
        return `${field} LIKE ?`;
      case "startsWith":
        return `${field} LIKE ?`;
      case "endsWith":
        return `${field} LIKE ?`;
      case "in":
        const placeholders = (value as unknown[]).map(() => "?").join(", ");
        return `${field} IN (${placeholders})`;
      case "notIn":
        const notPlaceholders = (value as unknown[]).map(() => "?").join(", ");
        return `${field} NOT IN (${notPlaceholders})`;
      case "isNull":
        return `${field} IS NULL`;
      case "isNotNull":
        return `${field} IS NOT NULL`;
      case "between":
        return `${field} BETWEEN ? AND ?`;
      default:
        return `${field} = ?`;
    }
  }

  private generateParams(): unknown[] {
    const params: unknown[] = [];

    if (this.query.filters) {
      this.collectFilterParams(this.query.filters, params);
    }

    if (this.query.having) {
      this.collectFilterParams(this.query.having, params);
    }

    return params;
  }

  private collectFilterParams(group: FilterGroup, params: unknown[]): void {
    for (const filter of group.filters) {
      if ("logic" in filter) {
        this.collectFilterParams(filter, params);
      } else {
        this.collectSingleFilterParams(filter, params);
      }
    }
  }

  private collectSingleFilterParams(filter: FilterDefinition, params: unknown[]): void {
    switch (filter.operator) {
      case "isNull":
      case "isNotNull":
        break;
      case "contains":
        params.push(`%${filter.value}%`);
        break;
      case "startsWith":
        params.push(`${filter.value}%`);
        break;
      case "endsWith":
        params.push(`%${filter.value}`);
        break;
      case "in":
      case "notIn":
        params.push(...(filter.value as unknown[]));
        break;
      case "between":
        params.push(...(filter.value as unknown[]));
        break;
      default:
        params.push(filter.value);
    }
  }
}

export interface QueryExecutor {
  execute<T>(query: CompiledQuery): Promise<QueryResult<T>>;
}

export interface QueryOverrides {
  filters?: FilterGroup;
  sorts?: SortDefinition[];
  page?: number;
  pageSize?: number;
}

export const dataViewEngine = new DataViewEngine();
