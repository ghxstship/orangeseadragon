/**
 * Supabase Storage Service
 *
 * Provides a complete wrapper around all Supabase Storage operations.
 * Consolidates bucket access and exposes: upload, download, getPublicUrl,
 * createSignedUrl, list, move, copy, remove.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { captureError } from '@/lib/observability';

export type StorageBucket = 'files' | 'avatars' | 'org-assets';

interface StorageListOptions {
  limit?: number;
  offset?: number;
  sortBy?: { column: string; order: 'asc' | 'desc' };
  search?: string;
}

interface StorageUploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export class StorageService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Upload a file to a bucket.
   */
  async upload(
    bucket: StorageBucket,
    path: string,
    file: File | Blob | ArrayBuffer,
    options?: StorageUploadOptions
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl ?? '3600',
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      });

    if (error) {
      captureError(error, 'storage.upload');
      return { data: null, error };
    }
    return { data, error: null };
  }

  /**
   * Download a file from a bucket.
   */
  async download(bucket: StorageBucket, path: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      captureError(error, 'storage.download');
      return { data: null, error };
    }
    return { data, error: null };
  }

  /**
   * Get a public URL for a file.
   */
  getPublicUrl(bucket: StorageBucket, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Create a signed URL for time-limited access to a private file.
   */
  async createSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      captureError(error, 'storage.createSignedUrl');
      return { signedUrl: null, error };
    }
    return { signedUrl: data.signedUrl, error: null };
  }

  /**
   * Create signed URLs for multiple files in a single request.
   */
  async createSignedUrls(
    bucket: StorageBucket,
    paths: string[],
    expiresIn: number = 3600
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrls(paths, expiresIn);

    if (error) {
      captureError(error, 'storage.createSignedUrls');
      return { data: null, error };
    }
    return { data, error: null };
  }

  /**
   * List files in a bucket folder.
   */
  async list(
    bucket: StorageBucket,
    folder?: string,
    options?: StorageListOptions
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folder ?? '', {
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
        sortBy: options?.sortBy ?? { column: 'name', order: 'asc' },
        search: options?.search,
      });

    if (error) {
      captureError(error, 'storage.list');
      return { data: null, error };
    }
    return { data, error: null };
  }

  /**
   * Move (rename) a file within a bucket.
   */
  async move(bucket: StorageBucket, fromPath: string, toPath: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      captureError(error, 'storage.move');
      return { data: null, error };
    }
    return { data, error: null };
  }

  /**
   * Copy a file within a bucket.
   */
  async copy(bucket: StorageBucket, fromPath: string, toPath: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) {
      captureError(error, 'storage.copy');
      return { data: null, error };
    }
    return { data, error: null };
  }

  /**
   * Remove one or more files from a bucket.
   */
  async remove(bucket: StorageBucket, paths: string[]) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      captureError(error, 'storage.remove');
      return { data: null, error };
    }
    return { data, error: null };
  }
}
