"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Inbox,
  Settings,
  HelpCircle,
  Globe,
  Sun,
  Moon,
  Search,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Building2,
  Activity,
  RefreshCw,
  Check,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguageStore, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-supabase";
import { useNotifications } from "@/hooks/use-notifications";
import { useInbox } from "@/hooks/use-inbox";
import { useUIStore } from "@/stores/ui-store";
import { OrgSwitcher } from "@/components/common/org-switcher";
import { useSupabase } from "@/hooks/use-supabase";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const [mounted, setMounted] = React.useState(false);
  const { setCommandPaletteOpen } = useUIStore();
  const supabase = useSupabase();

  // Live data hooks
  const { user, loading: userLoading } = useUser();
  const { 
    notifications, 
    unreadCount: notificationUnreadCount, 
    loading: notificationsLoading,
    markAsRead: markNotificationRead,
    markAllAsRead: markAllNotificationsRead,
  } = useNotifications({ limit: 5 });
  const { 
    items: inboxItems, 
    unreadCount: inboxUnreadCount, 
    loading: inboxLoading,
  } = useInbox({ limit: 5 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return "U";
    const names = user.user_metadata.full_name.split(" ");
    return names.map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // UUID pattern for detecting record detail pages
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const breadcrumbs = React.useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const isUUID = UUID_PATTERN.test(path);
      return {
        label: isUUID
          ? path.slice(0, 8) + "…"
          : path
              .replace(/-/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
        href: "/" + paths.slice(0, index + 1).join("/"),
        isLast: index === paths.length - 1,
        isRecord: isUUID,
        collectionPath: isUUID ? "/" + paths.slice(0, index).join("/") : undefined,
        recordId: isUUID ? path : undefined,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <header className="fixed top-0 z-40 flex h-14 w-full items-center border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Link href="/core/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            A
          </div>
          <span className="hidden font-semibold md:inline-block">ATLVS</span>
        </Link>
        <OrgSwitcher className="ml-2" />
      </div>

      <nav className="ml-6 hidden items-center gap-1 text-sm md:flex">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {crumb.isLast && crumb.isRecord ? (
              <BreadcrumbRecordSwitcher
                recordId={crumb.recordId!}
                collectionPath={crumb.collectionPath!}
                label={crumb.label}
              />
            ) : crumb.isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="outline"
          className="relative hidden h-9 w-64 items-center gap-2 overflow-hidden pl-3 pr-10 text-muted-foreground lg:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="flex-1 truncate text-left">Search or type a command...</span>
          <kbd className="pointer-events-none absolute right-2 top-1/2 inline-flex h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>
            <span className="text-xs">K</span>
          </kbd>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationUnreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 min-w-5 px-1"
                >
                  {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              {notificationUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    markAllNotificationsRead();
                  }}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={notification.read ? "opacity-60" : ""}
                  onClick={() => {
                    if (!notification.read) {
                      markNotificationRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      router.push(notification.actionUrl);
                    }
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {notification.message} - {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center"
              onClick={() => router.push("/account/history")}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Inbox className="h-5 w-5" />
              {inboxUnreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -right-1 -top-1 h-5 min-w-5 px-1"
                >
                  {inboxUnreadCount > 99 ? "99+" : inboxUnreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Inbox</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {inboxLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : inboxItems.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Your inbox is empty
              </div>
            ) : (
              inboxItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className={item.read ? "opacity-60" : ""}
                  onClick={() => {
                    if (item.actionUrl) {
                      router.push(item.actionUrl);
                    }
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {item.type}
                      </Badge>
                      <span className="font-medium text-sm truncate">{item.title}</span>
                    </div>
                    {item.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {item.sender?.name && `${item.sender.name} • `}{formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center"
              onClick={() => router.push("/account/support")}
            >
              View all messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/account/organization")}>
              Workspace settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/platform")}>
              Integrations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/platform")}>
              API keys
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/platform")}>
              Webhooks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/platform")}>
              Import/Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Support</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/account/resources")}>
              Documentation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/resources")}>
              Video tutorials
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/support")}>
              Contact support
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/support/tickets?type=bug")}>
              Report bug
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/support/tickets?type=feature")}>
              Feature request
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/support")}>
              System status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SUPPORTED_LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={language === lang.code ? "bg-accent" : ""}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.nativeName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url || "/avatars/user.png"} 
                  alt={getUserDisplayName()} 
                />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {userLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  getUserDisplayName()
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/account/profile")}>
              <User className="mr-2 h-4 w-4" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/organization")}>
              <Settings className="mr-2 h-4 w-4" />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/history")}>
              <Activity className="mr-2 h-4 w-4" />
              Activity log
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/account/organization")}>
              <Building2 className="mr-2 h-4 w-4" />
              Switch organization
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/profile")}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/**
 * BREADCRUMB RECORD SWITCHER
 *
 * Dropdown picker for switching between sibling records on detail pages.
 * Shows the current record ID truncated, with a chevron to open a popover
 * listing recent sibling records from the same collection.
 */
function BreadcrumbRecordSwitcher({
  recordId,
  collectionPath,
  label,
}: {
  recordId: string;
  collectionPath: string;
  label: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors rounded px-1.5 py-0.5 -mx-1.5 hover:bg-accent">
          <span>{label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs">
          Switch Record
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Current: {recordId.slice(0, 8)}…
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            router.push(collectionPath);
          }}
        >
          <Search className="mr-2 h-3.5 w-3.5" />
          <span className="text-sm">View all records</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
