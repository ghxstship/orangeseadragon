import { AppShell } from "@/components/layout/app-shell";

// Force dynamic rendering for all app pages since they use client-side auth and navigation
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
