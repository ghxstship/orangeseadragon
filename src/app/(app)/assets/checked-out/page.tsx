"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { assetsCheckedOutPageConfig } from "@/config/pages/assets-checked-out";

interface CheckedOutItem {
  id: string;
  name: string;
  quantity: number;
  checked_out_by: string;
  event: string;
  due_date: string;
  status: string;
}

export default function AssetsCheckedOutPage() {
  const [checkedOutItems, setCheckedOutItems] = React.useState<CheckedOutItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCheckedOutItems() {
      try {
        const response = await fetch("/api/v1/assets/checked-out");
        if (response.ok) {
          const result = await response.json();
          setCheckedOutItems(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch checked out items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCheckedOutItems();
  }, []);

  const stats = React.useMemo(() => {
    const onTimeCount = checkedOutItems.filter((i) => i.status === "on_time").length;
    const overdueCount = checkedOutItems.filter((i) => i.status === "overdue").length;
    return [
      { id: "total", label: "Items Out", value: checkedOutItems.length },
      { id: "onTime", label: "On Time", value: onTimeCount },
      { id: "overdue", label: "Overdue", value: overdueCount },
    ];
  }, [checkedOutItems]);

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
    <DataViewPage<CheckedOutItem>
      config={assetsCheckedOutPageConfig}
      data={checkedOutItems}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["name", "checked_out_by", "event"]}
      onAction={handleAction}
    />
  );
}
