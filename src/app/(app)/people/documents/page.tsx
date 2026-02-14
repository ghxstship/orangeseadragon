'use client';

import * as React from 'react';
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
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const { data: rawDocs } = useDocuments(orgId);

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
    <div className="container mx-auto py-6 px-4">
      <DocumentManager
        documents={documents.length > 0 ? documents : undefined}
        onUpload={() => { /* TODO: implement file upload */ }}
        onDownload={() => { /* TODO: implement download */ }}
        onDelete={() => { /* TODO: implement delete */ }}
        onView={() => { /* TODO: implement view */ }}
      />
    </div>
  );
}
