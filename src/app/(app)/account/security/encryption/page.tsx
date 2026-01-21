"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { encryptionPageConfig } from "@/config/pages/encryption";

interface EncryptionKey {
  id: string;
  name: string;
  type: string;
  algorithm: string;
  status: "active" | "rotating" | "expired";
  created_at: string;
  expires_at: string;
  last_rotated?: string;
}

export default function EncryptionPage() {
  const [encryptionKeysData, setEncryptionKeysData] = React.useState<EncryptionKey[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEncryptionKeys() {
      try {
        const response = await fetch("/api/v1/encryption");
        if (response.ok) {
          const result = await response.json();
          setEncryptionKeysData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch encryption keys:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEncryptionKeys();
  }, []);

  const stats = React.useMemo(() => {
    const activeKeys = encryptionKeysData.filter((k) => k.status === "active").length;

    return [
      { id: "status", label: "Encryption Status", value: "Enabled" },
      { id: "active", label: "Active Keys", value: activeKeys },
      { id: "algorithm", label: "Algorithm", value: "AES-256-GCM" },
      { id: "lastRotation", label: "Last Rotation", value: "June 10, 2024" },
    ];
  }, [encryptionKeysData]);

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
    <DataViewPage<EncryptionKey>
      config={encryptionPageConfig}
      data={encryptionKeysData}
      stats={stats}
      getRowId={(k) => k.id}
      searchFields={["name", "type"]}
      onAction={handleAction}
    />
  );
}
