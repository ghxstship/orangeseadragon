"use client";

import * as React from "react";
import { DataViewPage } from "@/components/common/data-view-page";
import { customFieldsPageConfig } from "@/config/pages/custom-fields";
import { Loader2 } from "lucide-react";

interface CustomField {
  id: string;
  name: string;
  key: string;
  type: "text" | "number" | "date" | "boolean" | "select" | "multiselect";
  entity: "event" | "contact" | "vendor" | "venue" | "task";
  required: boolean;
  description?: string;
  options?: string[];
}

export default function CustomFieldsPage() {
  const [customFieldsData, setCustomFieldsData] = React.useState<CustomField[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCustomFields() {
      try {
        const response = await fetch("/api/v1/custom-fields");
        if (response.ok) {
          const result = await response.json();
          setCustomFieldsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch custom fields:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomFields();
  }, []);

  const stats = React.useMemo(() => {
    const requiredFields = customFieldsData.filter((f) => f.required).length;

    return [
      { id: "total", label: "Total Fields", value: customFieldsData.length },
      { id: "required", label: "Required", value: requiredFields },
      { id: "entities", label: "Entities", value: 5 },
      { id: "types", label: "Field Types", value: 6 },
    ];
  }, [customFieldsData]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<CustomField>
      config={customFieldsPageConfig}
      data={customFieldsData}
      stats={stats}
      getRowId={(f) => f.id}
      searchFields={["name", "key", "description"]}
      onAction={handleAction}
    />
  );
}
