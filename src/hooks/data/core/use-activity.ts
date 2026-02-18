"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../auth/use-supabase";

export function useActivityFeed(organizationId: string | null, limit: number = 50) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["activity-feed", organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          user:users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Transform audit logs to activity feed format
      return data.map((log) => ({
        id: log.id,
        user_name: log.user?.full_name || "System",
        user_initials: log.user?.full_name
          ? log.user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
          : "SY",
        user_avatar: log.user?.avatar_url,
        action: log.action,
        target: log.entity_type,
        target_type: log.entity_type,
        target_id: log.entity_id,
        timestamp: log.created_at,
        metadata: log.new_values,
      }));
    },
    enabled: !!organizationId,
  });
}

export function useUserActivity(userId: string | null, limit: number = 20) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["user-activity", userId, limit],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          user:users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data.map((log) => ({
        id: log.id,
        user_name: log.user?.full_name || "You",
        user_initials: log.user?.full_name
          ? log.user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
          : "YO",
        action: log.action,
        target: log.entity_type,
        target_type: log.entity_type,
        target_id: log.entity_id,
        timestamp: log.created_at,
      }));
    },
    enabled: !!userId,
  });
}
