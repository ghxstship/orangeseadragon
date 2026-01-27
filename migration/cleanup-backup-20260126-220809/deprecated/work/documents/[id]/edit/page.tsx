"use client";

import { useParams } from "next/navigation";
import { CrudForm } from '@/lib/crud/components';
import { documentSchema } from '@/schemas/document.schema';

/**
 * Document Edit Page
 *
 * Uses the generic CrudForm component with document schema.
 * No entity-specific logic required.
 */
export default function DocumentEditPage() {
  const params = useParams();
  const documentId = params.id as string;

  return <CrudForm schema={documentSchema} mode="edit" id={documentId} />;
}

interface DocumentFormData {
  id: string;
  name: string;
  description: string;
  folder: string;
  status: string;
  tags: string[];
}

const defaultFormData: DocumentFormData = {
  id: "",
  name: "",
  description: "",
  folder: "projects",
  status: "draft",
  tags: [],
};

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const documentId = params.id as string;

  const [formData, setFormData] = React.useState<DocumentFormData>(defaultFormData);
  const [loading, setLoading] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchDocument() {
      try {
        const response = await fetch(`/api/v1/documents/${documentId}`);
        if (!response.ok) throw new Error("Failed to fetch document");
        const result = await response.json();
        const doc = result.data;
        setFormData({
          id: doc.id,
          name: doc.name || "",
          description: doc.description || "",
          folder: doc.folder || "projects",
          status: doc.status || "draft",
          tags: doc.tags || [],
        });
      } catch {
        toast({ title: "Error", description: "Failed to load document data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchDocument();
  }, [documentId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = <K extends keyof DocumentFormData>(field: K, value: DocumentFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          folder: formData.folder,
          status: formData.status,
          tags: formData.tags,
        }),
      });
      if (!response.ok) throw new Error("Failed to update document");
      toast({ title: "Document updated", description: "Changes saved successfully." });
      router.push(`/documents/${documentId}`);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Documents", href: "/documents" },
    { label: formData.name || "Document", href: `/documents/${documentId}` },
    { label: "Edit" },
  ];

  const sections = [
    {
      id: "details",
      title: "Document Details",
      content: (
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
          </FormField>
          <FormField label="Description">
            <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
          </FormField>
          <FormRow>
            <FormField label="Folder">
              <Select value={formData.folder} onValueChange={(v) => updateField("folder", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormField label="Tags">
            <TagInput value={formData.tags} onChange={(tags) => updateField("tags", tags)} placeholder="Add tags..." />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <EntityFormPage
      title={`Edit Document`}
      breadcrumbs={breadcrumbs}
      backHref={`/documents/${documentId}`}
      sections={sections}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
    />
  );
}
