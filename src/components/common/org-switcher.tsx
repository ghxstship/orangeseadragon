"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useSupabase, useUser } from "@/hooks/use-supabase";
import { useQuery } from "@tanstack/react-query";

interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  role: string;
}

function useMyOrganizations() {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["my-organizations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("organization_members")
        .select(`
          role,
          organization:organizations(id, name, logo_url)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data ?? []) as any[]).map((m) => ({
        id: m.organization?.id,
        name: m.organization?.name ?? "Unknown",
        logo_url: m.organization?.logo_url ?? null,
        role: m.role ?? "member",
      })) as Organization[];
    },
    enabled: !!user?.id,
  });
}

export function OrgSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useSupabase();
  const { data: orgs, isLoading } = useMyOrganizations();

  const currentOrgId = user?.user_metadata?.organization_id;
  const currentOrg = orgs?.find((o) => o.id === currentOrgId);

  const handleSwitch = async (orgId: string) => {
    if (orgId === currentOrgId) return;

    await supabase.auth.updateUser({
      data: { organization_id: orgId },
    });

    router.refresh();
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-40" />;
  }

  if (!orgs || orgs.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-9 gap-2 px-3 text-sm font-medium hover:bg-accent",
            className
          )}
        >
          <Avatar className="h-5 w-5">
            {currentOrg?.logo_url && <AvatarImage src={currentOrg.logo_url} />}
            <AvatarFallback className="text-[9px] font-black bg-primary/10">
              {currentOrg?.name?.slice(0, 2).toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[120px] truncate">{currentOrg?.name ?? "Select Org"}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 glass-morphism border-border">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 px-3">
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitch(org.id)}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          >
            <Avatar className="h-7 w-7">
              {org.logo_url && <AvatarImage src={org.logo_url} />}
              <AvatarFallback className="text-[9px] font-black bg-primary/10">
                {org.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{org.name}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{org.role}</div>
            </div>
            {org.id === currentOrgId && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-muted-foreground cursor-pointer">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
