/**
 * Authentication Service
 * Handles user authentication, session management, and token operations
 */

import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/api/error-message";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  accountType: string;
  isActive: boolean;
  onboardingCompletedAt?: Date;
  profileCompletedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithMembership extends User {
  organizationId?: string;
  roleId?: string;
  roleName?: string;
  departmentId?: string;
  positionId?: string;
  memberStatus?: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  organizationName?: string;
  accountType?: string;
}

export interface InvitationData {
  token: string;
  password: string;
  fullName: string;
}

export interface AuthResult {
  success: boolean;
  session?: Session;
  user?: User;
  error?: string;
  requiresOnboarding?: boolean;
  redirectTo?: string;
}

export class AuthService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.session || !data.user) {
        return { success: false, error: "Authentication failed" };
      }

      const user = await this.getUserProfile(data.user.id);
      if (!user) {
        return { success: false, error: "User profile not found" };
      }

      return {
        success: true,
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at! * 1000),
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Login failed"),
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: "Registration failed" };
      }

      // Create user profile
      const { error: profileError } = await this.supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          account_type: data.accountType || "owner",
          is_active: true,
        });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      return {
        success: true,
        requiresOnboarding: true,
        redirectTo: "/onboarding/welcome",
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Registration failed"),
      };
    }
  }

  async acceptInvitation(data: InvitationData): Promise<AuthResult> {
    try {
      // Verify invitation token
      const { data: invitation, error: inviteError } = await this.supabase
        .from("organization_invitations")
        .select(`
          *,
          organization:organizations(id, name, slug),
          role:roles(id, name, slug)
        `)
        .eq("token", data.token)
        .is("accepted_at", null)
        .is("declined_at", null)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        return { success: false, error: "Invalid or expired invitation" };
      }

      // Create auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: invitation.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || "Registration failed" };
      }

      // Create user profile
      const { error: profileError } = await this.supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: invitation.email,
          full_name: data.fullName,
          account_type: invitation.account_type_slug || "member",
          is_active: true,
        });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      // Create organization membership
      const { error: memberError } = await this.supabase
        .from("organization_members")
        .insert({
          organization_id: invitation.organization_id,
          user_id: authData.user.id,
          role_id: invitation.role_id,
          department_id: invitation.department_id,
          position_id: invitation.position_id,
          status: "active",
          invited_by: invitation.invited_by,
        });

      if (memberError) {
        return { success: false, error: memberError.message };
      }

      // Mark invitation as accepted
      await this.supabase
        .from("organization_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      return {
        success: true,
        requiresOnboarding: true,
        redirectTo: "/onboarding/welcome",
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Invitation acceptance failed"),
      };
    }
  }

  async getInvitation(token: string) {
    const { data, error } = await this.supabase
      .from("organization_invitations")
      .select(`
        *,
        organization:organizations(id, name, slug, logo_url),
        role:roles(id, name, slug),
        inviter:users!organization_invitations_invited_by_fkey(id, full_name, avatar_url)
      `)
      .eq("token", token)
      .is("accepted_at", null)
      .is("declined_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.session || !data.user) {
        return { success: false, error: "Session refresh failed" };
      }

      const user = await this.getUserProfile(data.user.id);
      if (!user) {
        return { success: false, error: "User profile not found" };
      }

      return {
        success: true,
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at! * 1000),
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Session refresh failed"),
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) return null;

    return this.getUserProfile(user.id);
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      phone: data.phone,
      timezone: data.timezone,
      locale: data.locale,
      accountType: data.account_type || "member",
      isActive: data.is_active ?? true,
      onboardingCompletedAt: data.onboarding_completed_at ? new Date(data.onboarding_completed_at) : undefined,
      profileCompletedAt: data.profile_completed_at ? new Date(data.profile_completed_at) : undefined,
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getUserWithMembership(userId: string, organizationId?: string): Promise<UserWithMembership | null> {
    const user = await this.getUserProfile(userId);
    if (!user) return null;

    let membershipQuery = this.supabase
      .from("organization_members")
      .select(`
        organization_id,
        role_id,
        department_id,
        position_id,
        status,
        role:roles(name)
      `)
      .eq("user_id", userId);

    if (organizationId) {
      membershipQuery = membershipQuery.eq("organization_id", organizationId);
    }

    const { data: membership } = await membershipQuery.maybeSingle();

    return {
      ...user,
      organizationId: membership?.organization_id,
      roleId: membership?.role_id,
      roleName: (membership?.role as { name?: string } | null)?.name,
      departmentId: membership?.department_id,
      positionId: membership?.position_id,
      memberStatus: membership?.status,
    };
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResult> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
      if (updates.locale !== undefined) updateData.locale = updates.locale;

      const { error } = await this.supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Profile update failed"),
      };
    }
  }

  async markProfileComplete(userId: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase
        .from("users")
        .update({ profile_completed_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to mark profile complete"),
      };
    }
  }

  async markOnboardingComplete(userId: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase
        .from("users")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Failed to mark onboarding complete"),
      };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Password change failed"),
      };
    }
  }

  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Password reset request failed"),
      };
    }
  }

  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Email verification failed"),
      };
    }
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = await this.getUserProfile(session.user.id);
          if (user) {
            callback({
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: new Date(session.expires_at! * 1000),
              user,
            });
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }
}

export const authService = new AuthService();
