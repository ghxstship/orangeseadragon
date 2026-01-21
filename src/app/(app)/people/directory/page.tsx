"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { peopleDirectoryPageConfig } from "@/config/pages/people-directory";

interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
}

export default function PeopleDirectoryPage() {
  const [people, setPeople] = React.useState<Person[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPeople() {
      try {
        const response = await fetch("/api/v1/people/directory");
        if (response.ok) {
          const result = await response.json();
          setPeople(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch people:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPeople();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = people.filter((p) => p.status === "active").length;
    const awayCount = people.filter((p) => p.status === "away").length;
    return [
      { id: "total", label: "Total People", value: people.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "away", label: "Away", value: awayCount },
    ];
  }, [people]);

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
    <DataViewPage<Person>
      config={peopleDirectoryPageConfig}
      data={people}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "email", "role", "department"]}
      onAction={handleAction}
    />
  );
}
