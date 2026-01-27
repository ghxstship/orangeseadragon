"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  CreditCard,
  History,
  BookOpen,
  Cpu,
  LifeBuoy,
} from "lucide-react";

const accountNavItems = [
  { path: "/account/profile", label: "Profile", icon: User },
  { path: "/account/organization", label: "Organization", icon: Building2 },
  { path: "/account/billing", label: "Billing", icon: CreditCard },
  { path: "/account/history", label: "History", icon: History },
  { path: "/account/resources", label: "Resources", icon: BookOpen },
  { path: "/account/platform", label: "Platform", icon: Cpu },
  { path: "/account/support", label: "Support", icon: LifeBuoy },
];

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="md:w-64 shrink-0">
          <nav className="space-y-1">
            {accountNavItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
