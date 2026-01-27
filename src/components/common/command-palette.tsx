"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  User,
  Search,
  FileText,
  FolderOpen,
  Users,
  LayoutDashboard,
  CheckSquare,
  Package,
  MapPin,
  BarChart3,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";

interface CommandItem {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  action: () => void;
}

interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setCommandPaletteOpen(false);
      command();
    },
    [setCommandPaletteOpen]
  );

  const commandGroups: CommandGroup[] = [
    {
      heading: "Navigation",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          shortcut: "⌘D",
          action: () => router.push("/core/dashboard"),
        },
        {
          icon: CheckSquare,
          label: "Tasks",
          shortcut: "⌘T",
          action: () => router.push("/core/tasks"),
        },
        {
          icon: FolderOpen,
          label: "Projects",
          shortcut: "⌘P",
          action: () => router.push("/modules/projects"),
        },
        {
          icon: Calendar,
          label: "Calendar",
          action: () => router.push("/core/calendar"),
        },
        {
          icon: Users,
          label: "People",
          action: () => router.push("/modules/workforce/roster"),
        },
        {
          icon: FileText,
          label: "Documents",
          action: () => router.push("/core/documents"),
        },
      ],
    },
    {
      heading: "Resources",
      items: [
        {
          icon: Package,
          label: "Assets",
          action: () => router.push("/modules/assets"),
        },
        {
          icon: MapPin,
          label: "Places",
          action: () => router.push("/modules/operations/venues"),
        },
        {
          icon: BarChart3,
          label: "Reports",
          action: () => router.push("/modules/projects/reports"),
        },
      ],
    },
    {
      heading: "Quick Actions",
      items: [
        {
          icon: Search,
          label: "Search everything...",
          shortcut: "⌘/",
          action: () => console.log("Global search"),
        },
        {
          icon: Bell,
          label: "View notifications",
          action: () => useUIStore.getState().toggleNotificationsPanel(),
        },
        {
          icon: Calculator,
          label: "Quick calculator",
          action: () => console.log("Calculator"),
        },
      ],
    },
    {
      heading: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          shortcut: "⌘⇧P",
          action: () => router.push("/account/profile"),
        },
        {
          icon: CreditCard,
          label: "Billing",
          action: () => router.push("/account/billing"),
        },
        {
          icon: Settings,
          label: "Settings",
          shortcut: "⌘,",
          action: () => router.push("/account/organization"),
        },
        {
          icon: HelpCircle,
          label: "Help & Support",
          action: () => router.push("/account/support"),
        },
        {
          icon: LogOut,
          label: "Sign out",
          action: () => router.push("/login"),
        },
      ],
    },
  ];

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commandGroups.map((group, groupIndex) => (
          <React.Fragment key={group.heading}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.action)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
