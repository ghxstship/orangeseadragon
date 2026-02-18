"use client";

import React, { useState, useEffect, useMemo } from "react";
import { WorkloadView, TeamMember, WorkloadViewSkeleton } from "@/components/views/WorkloadView";
import { useUser } from "@/hooks/auth/use-supabase";
import { useTasks } from "@/hooks/data/core/use-tasks";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { captureError } from '@/lib/observability';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
        const response = await fetch(`/api/workload/team-members?organization_id=${organizationId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch team members (${response.status})`);
        }

        const payload = await response.json();
        const members: User[] = (payload?.data ?? []).map((member: User) => ({
          id: member.id,
          full_name: member.full_name,
          email: member.email,
          avatar_url: member.avatar_url,
        }));

        setTeamMembers(members);
      } catch (error) {
        captureError(error, 'workload.fetchTeamMembers');
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
    router.push(`/people/rosters/${member.id}`);
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
            <h1 className="text-2xl font-bold tracking-tight">Team Workload</h1>
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
