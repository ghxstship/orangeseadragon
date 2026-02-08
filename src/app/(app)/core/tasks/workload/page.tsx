"use client";

import React, { useState, useEffect, useMemo } from "react";
import { WorkloadView, TeamMember, WorkloadViewSkeleton } from "@/components/views/WorkloadView";
import { useUser } from "@/hooks/use-supabase";
import { useTasks } from "@/hooks/use-tasks";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
}

export default function WorkloadPage() {
  const router = useRouter();
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: tasks, isLoading: tasksLoading } = useTasks(organizationId);
  
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  // Fetch team members
  useEffect(() => {
    async function fetchTeamMembers() {
      if (!organizationId) {
        setIsLoadingMembers(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("organization_members")
          .select(`
            user_id,
            user:users!organization_members_user_id_fkey (
              id, full_name, email, avatar_url
            )
          `)
          .eq("organization_id", organizationId)
          .eq("status", "active");

        if (error) throw error;
        const members: User[] = (data ?? []).map((m) => {
          const u = m.user as unknown as { id: string; full_name: string; email: string; avatar_url: string | null } | null;
          return {
            id: u?.id ?? m.user_id,
            full_name: u?.full_name,
            email: u?.email,
            avatar_url: u?.avatar_url ?? undefined,
          };
        });
        setTeamMembers(members);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    }

    fetchTeamMembers();
  }, [organizationId]);

  // Transform to WorkloadView format
  const workloadMembers = useMemo<TeamMember[]>(() => {
    if (!teamMembers || !tasks) return [];

    return teamMembers.map((member) => {
      const memberTasks = tasks
        .filter((t) => t.task_assignments?.some((a: { user_id: string }) => a.user_id === member.id) && (t.start_date || t.due_date))
        .map((t) => ({
          id: t.id,
          title: t.title,
          startDate: t.start_date || t.due_date || new Date().toISOString(),
          endDate: t.due_date ?? undefined,
          dueDate: t.due_date ?? undefined,
          estimatedHours: t.estimated_hours || 4,
          status: t.status || "todo",
          priority: t.priority || "medium",
        }));

      return {
        id: member.id,
        name: member.full_name || member.email || "Unknown",
        email: member.email,
        avatarUrl: member.avatar_url,
        capacity: 8, // Default 8 hours per day
        tasks: memberTasks,
      };
    });
  }, [teamMembers, tasks]);

  const handleMemberClick = (member: TeamMember) => {
    router.push(`/core/people/${member.id}`);
  };

  const isLoading = tasksLoading || isLoadingMembers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/core/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Team Workload</h1>
            <p className="text-sm text-muted-foreground">
              View team capacity and task distribution
            </p>
          </div>
        </div>
      </div>

      {/* Workload View */}
      {isLoading ? (
        <WorkloadViewSkeleton />
      ) : (
        <WorkloadView
          members={workloadMembers}
          onMemberClick={handleMemberClick}
        />
      )}
    </div>
  );
}
