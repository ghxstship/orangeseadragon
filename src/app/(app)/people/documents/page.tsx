'use client';

import { DocumentManager } from '@/components/people/DocumentManager';

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <DocumentManager 
        onUpload={(files) => console.log('Upload files:', files)}
        onDownload={(id) => console.log('Download:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        onView={(id) => console.log('View:', id)}
      />
    </div>
  );
}
