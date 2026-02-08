"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Database } from "@/types/database";

type _OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type _OrganizationMemberInsert = Database["public"]["Tables"]["organization_members"]["Insert"];
type _OrganizationMemberUpdate = Database["public"]["Tables"]["organization_members"]["Update"];

export function usePeople(organizationId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["people", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];

            const { data, error } = await supabase
                .from("organization_members")
                .select(`
          *,
          user:users!organization_members_user_id_fkey (
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
                .eq("organization_id", organizationId)
                .order("joined_at", { ascending: false });

            if (error) throw error;

            // Transform data for view consumption
            return data.map(member => ({
                id: member.id,
                user_id: member.user_id,
                name: member.user?.full_name || 'Unknown',
                email: member.user?.email || '',
                phone: member.user?.phone || '',
                avatar_url: member.user?.avatar_url,
                role: member.role_id, // Map this if roles table available
                department: member.department_id, // Map this if departments table available
                status: member.status,
                joined_at: member.joined_at,
                is_owner: member.is_owner
            }));
        },
        enabled: !!organizationId,
    });
}

export function usePerson(memberId: string | null) {
    const supabase = useSupabase();

    return useQuery({
        queryKey: ["person", memberId],
        queryFn: async () => {
            if (!memberId) return null;

            const { data, error } = await supabase
                .from("organization_members")
                .select(`
          *,
          user:users!organization_members_user_id_fkey (
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
                .eq("id", memberId)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                user_id: data.user_id,
                name: data.user?.full_name || 'Unknown',
                email: data.user?.email || '',
                phone: data.user?.phone || '',
                avatar_url: data.user?.avatar_url,
                role: data.role_id,
                department: data.department_id,
                status: data.status,
                joined_at: data.joined_at,
                is_owner: data.is_owner
            };
        },
        enabled: !!memberId,
    });
}

// Additional mutations (invite, update role, remove) would go here
