"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { memberDirectoryPageConfig } from "@/config/pages/member-directory";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "owner" | "admin" | "member" | "viewer";
  department: string;
  status: "active" | "invited" | "inactive";
  avatar?: string;
  joined_at: string;
  last_active: string;
}

export default function MemberDirectoryPage() {
  const [membersData, setMembersData] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/v1/member-directory");
        if (response.ok) {
          const result = await response.json();
          setMembersData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const stats = React.useMemo(() => {
    const activeMembers = membersData.filter((m) => m.status === "active").length;
    const adminCount = membersData.filter((m) => m.role === "admin" || m.role === "owner").length;
    const pendingInvites = membersData.filter((m) => m.status === "invited").length;

    return [
      { id: "total", label: "Total Members", value: membersData.length },
      { id: "active", label: "Active", value: activeMembers },
      { id: "admins", label: "Admins", value: adminCount },
      { id: "pending", label: "Pending Invites", value: pendingInvites },
    ];
  }, [membersData]);

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
    <DataViewPage<Member>
      config={memberDirectoryPageConfig}
      data={membersData}
      stats={stats}
      getRowId={(m) => m.id}
      searchFields={["name", "email", "department"]}
      onAction={handleAction}
    />
  );
}
