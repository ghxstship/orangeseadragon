'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/common/page-shell';
import { DocumentManager } from '@/components/people/DocumentManager';
import { useUser } from '@/hooks/use-supabase';
import { useDocuments } from '@/hooks/use-documents';

type DocumentCategory = 'contract' | 'policy' | 'certification' | 'personal' | 'tax' | 'other';
type DocumentStatus = 'valid' | 'pending' | 'expired' | 'requires_signature';

interface MappedDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  expiresAt?: Date;
  status: DocumentStatus;
  uploadedBy: string;
  isRequired?: boolean;
}

function mapDocStatus(status: string | null): DocumentStatus {
  if (status === 'published') return 'valid';
  if (status === 'draft') return 'pending';
  if (status === 'archived') return 'expired';
  return 'pending';
}

function mapDocCategory(docType: string | null): DocumentCategory {
  if (!docType) return 'other';
  const t = docType.toLowerCase();
  if (t.includes('contract') || t.includes('agreement')) return 'contract';
  if (t.includes('policy') || t.includes('handbook')) return 'policy';
  if (t.includes('cert')) return 'certification';
  if (t.includes('tax') || t.includes('w-4') || t.includes('w-9')) return 'tax';
  if (t.includes('personal') || t.includes('review')) return 'personal';
  return 'other';
}

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const { data: rawDocs, refetch } = useDocuments(orgId);

  const handleUpload = async (files: FileList) => {
    const formData = new FormData();
    formData.append('entityId', orgId || '');
    Array.from(files).forEach((f) => formData.append('files', f));
    try {
      await fetch('/api/files/upload', { method: 'POST', body: formData });
      refetch?.();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDownload = (docId: string) => {
    window.open(`/api/documents/${docId}/download`, '_blank');
  };

  const handleDelete = async (docId: string) => {
    try {
      await fetch(`/api/files/${docId}`, { method: 'DELETE' });
      refetch?.();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleView = (docId: string) => {
    router.push(`/people/documents/${docId}`);
  };

  const documents: MappedDocument[] = React.useMemo(() => {
    if (!rawDocs) return [];
    return rawDocs.map((d) => {
      const ext = d.title?.split('.').pop()?.toLowerCase() ?? 'pdf';
      return {
        id: d.id,
        name: d.title,
        category: mapDocCategory(d.document_type),
        fileType: ext,
        fileSize: d.word_count ? d.word_count * 6 : 0,
        uploadedAt: d.created_at ? new Date(d.created_at) : new Date(),
        status: mapDocStatus(d.status),
        uploadedBy: (d as Record<string, unknown>).created_by_user
          ? ((d as Record<string, unknown>).created_by_user as { full_name?: string })?.full_name ?? 'Unknown'
          : 'Unknown',
      };
    });
  }, [rawDocs]);

  return (
    <PageShell title="Documents" description="Manage employee documents and files">
      <DocumentManager
        documents={documents.length > 0 ? documents : undefined}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onView={handleView}
      />
    </PageShell>
  );
}
