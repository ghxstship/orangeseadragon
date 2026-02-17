import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

interface TeamMemberDto {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organization_id") ?? undefined;

  const auth = await requirePolicy('entity.read', { orgId: organizationId });
  if (auth.error) return auth.error;

  const { supabase, membership } = auth;

  try {
    const { data, error } = await supabase
      .from("organization_members")
      .select(
        `
          user_id,
          user:users!organization_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `
      )
      .eq("organization_id", membership.organization_id)
      .eq("status", "active");

    if (error) {
      return supabaseError(error);
    }

    const members: TeamMemberDto[] = (data ?? []).map((member) => {
      const user = member.user as
        | {
            id?: string;
            full_name?: string | null;
            email?: string | null;
            avatar_url?: string | null;
          }
        | null;

      return {
        id: user?.id ?? member.user_id,
        full_name: user?.full_name ?? undefined,
        email: user?.email ?? undefined,
        avatar_url: user?.avatar_url ?? undefined,
      };
    });

    return apiSuccess(members);
  } catch (error) {
    captureError(error, 'api.workload.team-members.error');
    return serverError("Failed to fetch workload team members");
  }
}
