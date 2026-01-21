"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { timesheetsPageConfig } from "@/config/pages/timesheets";
import { TIMESHEET_STATUS, type TimesheetStatus } from "@/lib/enums";

interface Timesheet {
  id: string;
  employee_name: string;
  employee_id: string;
  week_starting: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  status: TimesheetStatus;
  projects: { name: string; hours: number }[];
  submitted_at?: string;
  approved_by?: string;
}

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = React.useState<Timesheet[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTimesheets() {
      try {
        const response = await fetch("/api/v1/timesheets");
        if (response.ok) {
          const result = await response.json();
          setTimesheets(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch timesheets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTimesheets();
  }, []);

  const stats = React.useMemo(() => {
    const totalHours = timesheets.reduce((acc, t) => acc + (t.total_hours || 0), 0);
    const overtimeHours = timesheets.reduce((acc, t) => acc + (t.overtime_hours || 0), 0);
    const pendingApproval = timesheets.filter((t) => t.status === TIMESHEET_STATUS.SUBMITTED).length;
    const approved = timesheets.filter((t) => t.status === TIMESHEET_STATUS.APPROVED || t.status === TIMESHEET_STATUS.PAID).length;
    return [
      { id: "hours", label: "Total Hours", value: totalHours },
      { id: "overtime", label: "Overtime Hours", value: overtimeHours },
      { id: "pending", label: "Pending Approval", value: pendingApproval },
      { id: "approved", label: "Approved", value: approved },
    ];
  }, [timesheets]);

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
    <DataViewPage<Timesheet>
      config={timesheetsPageConfig}
      data={timesheets}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["employee_name", "employee_id"]}
      onAction={handleAction}
    />
  );
}
