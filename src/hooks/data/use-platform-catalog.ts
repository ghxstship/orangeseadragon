import { useQuery } from '@tanstack/react-query';

export interface PlatformCatalogDivision {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  platform_catalog_categories?: PlatformCatalogCategory[];
}

export interface PlatformCatalogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  division_id: string;
  platform_catalog_divisions?: { slug: string; name: string };
  platform_catalog_items?: PlatformCatalogItem[];
}

export interface PlatformCatalogItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  default_unit_cost: number | null;
  default_rental_rate: number | null;
  currency: string;
  unit_of_measure: string | null;
  is_rentable: boolean;
  is_purchasable: boolean;
  is_service: boolean;
  specifications: Record<string, unknown> | null;
  tags: string[];
  sort_order: number;
  is_active: boolean;
  category_id: string;
  platform_catalog_categories?: PlatformCatalogCategory;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

export function usePlatformCatalogDivisions(options?: { includeCategories?: boolean }) {
  const include = options?.includeCategories ? '?include=categories' : '';
  return useQuery<PlatformCatalogDivision[]>({
    queryKey: ['platform-catalog', 'divisions', include],
    queryFn: () => fetchJson(`/api/platform-catalog/divisions${include}`),
    staleTime: 1000 * 60 * 30,
  });
}

export function usePlatformCatalogCategories(options?: { division?: string; includeItems?: boolean }) {
  const params = new URLSearchParams();
  if (options?.division) params.set('division', options.division);
  if (options?.includeItems) params.set('include', 'items');
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery<PlatformCatalogCategory[]>({
    queryKey: ['platform-catalog', 'categories', options?.division ?? 'all', options?.includeItems ?? false],
    queryFn: () => fetchJson(`/api/platform-catalog/categories${qs}`),
    staleTime: 1000 * 60 * 30,
  });
}

export function usePlatformCatalogItems(options?: {
  category?: string;
  division?: string;
  search?: string;
  rentable?: boolean;
  services?: boolean;
}) {
  const params = new URLSearchParams();
  if (options?.category) params.set('category', options.category);
  if (options?.division) params.set('division', options.division);
  if (options?.search) params.set('search', options.search);
  if (options?.rentable) params.set('rentable', 'true');
  if (options?.services) params.set('services', 'true');
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery<PlatformCatalogItem[]>({
    queryKey: ['platform-catalog', 'items', options ?? {}],
    queryFn: () => fetchJson(`/api/platform-catalog/items${qs}`),
    staleTime: 1000 * 60 * 30,
  });
}
