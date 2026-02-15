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
  DollarSign,
  Handshake,
  PlayCircle,
  Inbox,
  Clock,
  Plus,
  Wrench,
  Radio,
  Truck,
  Building2,
  Timer,
  Keyboard,
  Shield,
  PieChart,
  MessageSquare,
  History,
  Contact,
  Receipt,
  Ticket,
  Warehouse,
  Award,
  Banknote,
  Zap,
  Plug,
  Lock,
  Clapperboard,
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
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";

interface PaletteItem {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  action: () => void;
}

interface PaletteGroup {
  heading: string;
  items: PaletteItem[];
}

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

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

  const commandGroups: PaletteGroup[] = [
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
          label: "My Tasks",
          shortcut: "⌘T",
          action: () => router.push("/core/tasks/my-tasks"),
        },
        {
          icon: Timer,
          label: "My Timesheet",
          action: () => router.push("/core/tasks/my-timesheet"),
        },
        {
          icon: Inbox,
          label: "Inbox",
          shortcut: "⌘I",
          action: () => router.push("/core/inbox"),
        },
        {
          icon: Calendar,
          label: "Calendar",
          action: () => router.push("/core/calendar"),
        },
        {
          icon: FileText,
          label: "Documents",
          action: () => router.push("/core/documents"),
        },
        {
          icon: MessageSquare,
          label: "Messages",
          shortcut: "⌘M",
          action: () => router.push("/core/messages"),
        },
      ],
    },
    {
      heading: "Modules",
      items: [
        {
          icon: FolderOpen,
          label: "Productions",
          shortcut: "⌘P",
          action: () => router.push("/productions"),
        },
        {
          icon: FolderOpen,
          label: "Projects",
          action: () => router.push("/productions/projects"),
        },
        {
          icon: PlayCircle,
          label: "Operations",
          action: () => router.push("/operations"),
        },
        {
          icon: Users,
          label: "People",
          action: () => router.push("/people"),
        },
        {
          icon: DollarSign,
          label: "Finance",
          action: () => router.push("/finance"),
        },
        {
          icon: Handshake,
          label: "Business / CRM",
          action: () => router.push("/business"),
        },
        {
          icon: Package,
          label: "Assets",
          action: () => router.push("/assets"),
        },
        {
          icon: Truck,
          label: "Advancing",
          action: () => router.push("/productions/advancing"),
        },
        {
          icon: Radio,
          label: "Network",
          action: () => router.push("/network/feed"),
        },
        {
          icon: Contact,
          label: "Contacts",
          action: () => router.push("/business/contacts"),
        },
        {
          icon: Handshake,
          label: "Deals & Pipeline",
          action: () => router.push("/business/pipeline"),
        },
        {
          icon: Receipt,
          label: "Invoices",
          action: () => router.push("/finance/invoices"),
        },
        {
          icon: Ticket,
          label: "Events",
          action: () => router.push("/productions/events"),
        },
        {
          icon: Warehouse,
          label: "Warehouse",
          action: () => router.push("/assets/warehouse"),
        },
      ],
    },
    {
      heading: "Resources",
      items: [
        {
          icon: MapPin,
          label: "Venues",
          action: () => router.push("/operations/venues"),
        },
        {
          icon: Building2,
          label: "Companies",
          action: () => router.push("/business/companies"),
        },
        {
          icon: BarChart3,
          label: "Financial Reports",
          action: () => router.push("/finance/reports"),
        },
        {
          icon: Clock,
          label: "Time & Attendance",
          action: () => router.push("/people/timekeeping"),
        },
        {
          icon: Wrench,
          label: "Maintenance",
          action: () => router.push("/assets/maintenance"),
        },
        {
          icon: PieChart,
          label: "Analytics",
          action: () => router.push("/analytics"),
        },
        {
          icon: Shield,
          label: "Audit Log",
          action: () => router.push("/account/audit-log"),
        },
        {
          icon: History,
          label: "My Activity History",
          action: () => router.push("/account/history"),
        },
        {
          icon: Award,
          label: "Certifications",
          action: () => router.push("/people/certifications"),
        },
        {
          icon: Banknote,
          label: "Payroll",
          action: () => router.push("/people/payroll"),
        },
      ],
    },
    {
      heading: "Create",
      items: [
        {
          icon: Plus,
          label: "New Task",
          shortcut: "⌘N",
          action: () => useUIStore.getState().toggleQuickAddTask(),
        },
        {
          icon: FolderOpen,
          label: "New Project",
          action: () => router.push("/productions/projects/new"),
        },
        {
          icon: Handshake,
          label: "New Deal",
          action: () => router.push("/business/deals/new"),
        },
        {
          icon: Building2,
          label: "New Company",
          action: () => router.push("/business/companies/new"),
        },
        {
          icon: User,
          label: "New Contact",
          action: () => router.push("/business/contacts/new"),
        },
        {
          icon: DollarSign,
          label: "New Invoice",
          action: () => router.push("/finance/invoices/new"),
        },
        {
          icon: Package,
          label: "New Asset",
          action: () => router.push("/assets/inventory/new"),
        },
        {
          icon: Clapperboard,
          label: "New Event",
          action: () => router.push("/productions/events/new"),
        },
        {
          icon: Truck,
          label: "New Purchase Order",
          action: () => router.push("/operations/procurement/orders/new"),
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
        {
          icon: Keyboard,
          label: "Keyboard shortcuts",
          shortcut: "⌘?",
          action: () => setShortcutsOpen(true),
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
          icon: Lock,
          label: "Roles & Permissions",
          action: () => router.push("/account/roles"),
        },
        {
          icon: Plug,
          label: "Integrations",
          action: () => router.push("/account/integrations"),
        },
        {
          icon: Zap,
          label: "Automation Rules",
          action: () => router.push("/account/automations"),
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
    <>
    <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
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
    </>
  );
}
