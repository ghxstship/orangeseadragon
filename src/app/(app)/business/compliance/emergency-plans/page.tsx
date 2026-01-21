"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { emergencyPlansPageConfig } from "@/config/pages/emergency-plans";
import { EMERGENCY_PLAN_STATUS, type EmergencyPlanStatus, type EmergencyPlanType } from "@/lib/enums";

interface EmergencyPlan {
  id: string;
  name: string;
  event_name: string;
  type: EmergencyPlanType;
  version: string;
  status: EmergencyPlanStatus;
  last_updated: string;
  approved_by?: string;
  approved_date?: string;
  sections: number;
  contacts: number;
}

export default function EmergencyPlansPage() {
  const [emergencyPlansData, setEmergencyPlansData] = React.useState<EmergencyPlan[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEmergencyPlans() {
      try {
        const response = await fetch("/api/v1/emergency-plans");
        if (response.ok) {
          const result = await response.json();
          setEmergencyPlansData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch emergency plans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmergencyPlans();
  }, []);

  const stats = React.useMemo(() => {
    const activePlans = emergencyPlansData.filter((p) => p.status === EMERGENCY_PLAN_STATUS.ACTIVE).length;
    const draftPlans = emergencyPlansData.filter((p) => p.status === EMERGENCY_PLAN_STATUS.DRAFT).length;
    const totalContacts = emergencyPlansData.reduce((acc, p) => acc + (p.contacts || 0), 0);

    return [
      { id: "total", label: "Total Plans", value: emergencyPlansData.length },
      { id: "active", label: "Active", value: activePlans },
      { id: "drafts", label: "Drafts", value: draftPlans },
      { id: "contacts", label: "Emergency Contacts", value: totalContacts },
    ];
  }, [emergencyPlansData]);

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
    <DataViewPage<EmergencyPlan>
      config={emergencyPlansPageConfig}
      data={emergencyPlansData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "event_name"]}
      onAction={handleAction}
    />
  );
}
