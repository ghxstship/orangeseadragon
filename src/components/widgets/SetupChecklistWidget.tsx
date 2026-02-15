"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Check,
  ChevronRight,
  X,
  Calendar,
  Users,
  Plug,
  User,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSetupChecklist } from '@/hooks/use-setup-checklist';

interface ChecklistItem {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  completed: boolean;
}

const defaultItems: Omit<ChecklistItem, 'completed'>[] = [
  {
    key: 'create_event',
    title: 'Create your first event',
    description: 'Set up a production or event',
    icon: <Calendar className="h-4 w-4" />,
    href: '/productions/events/new',
  },
  {
    key: 'invite_team',
    title: 'Invite a team member',
    description: 'Collaboration is better together',
    icon: <Users className="h-4 w-4" />,
    href: '/account/organization',
  },
  {
    key: 'connect_integration',
    title: 'Connect an integration',
    description: 'Sync with tools you use',
    icon: <Plug className="h-4 w-4" />,
    href: '/account/platform',
  },
  {
    key: 'customize_profile',
    title: 'Complete your profile',
    description: 'Add a photo and bio',
    icon: <User className="h-4 w-4" />,
    href: '/account/profile',
  },
  {
    key: 'explore_dashboard',
    title: 'Explore the dashboard',
    description: 'See your command center',
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: '/core/dashboard',
  },
];

interface SetupChecklistWidgetProps {
  className?: string;
  variant?: 'card' | 'sidebar';
  onDismiss?: () => void;
}

export function SetupChecklistWidget({
  className,
  variant = 'card',
  onDismiss,
}: SetupChecklistWidgetProps) {
  const { completedItems, isLoaded, isDismissed, markComplete, dismiss } = useSetupChecklist();

  const items: ChecklistItem[] = defaultItems.map((item) => ({
    ...item,
    completed: completedItems.includes(item.key),
  }));

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allComplete = completedCount === totalCount;

  const handleDismiss = () => {
    dismiss();
    onDismiss?.();
  };

  if (!isLoaded || isDismissed) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Getting Started</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            aria-label="Dismiss checklist"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedCount} of {totalCount} complete
            </span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        <ul className="space-y-1">
          <AnimatePresence>
            {items.map((item) => (
              <motion.li
                key={item.key}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Link
                  href={item.href}
                  onClick={() => !item.completed && markComplete(item.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    item.completed
                      ? "text-muted-foreground line-through"
                      : "hover:bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                      item.completed
                        ? "border-semantic-success bg-semantic-success text-white"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {item.completed && <Check className="h-3 w-3" />}
                  </div>
                  <span className="flex-1 truncate">{item.title}</span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md bg-semantic-success/10 p-3 text-center"
          >
            <p className="text-sm font-medium text-semantic-success">
              🎉 All done! You&apos;re all set.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={handleDismiss}
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Getting Started</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDismiss}
          aria-label="Dismiss checklist"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {totalCount} complete
            </span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <ul className="space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.li
                key={item.key}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  onClick={() => !item.completed && markComplete(item.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-all",
                    item.completed
                      ? "border-semantic-success/20 bg-semantic-success/5"
                      : "hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      item.completed
                        ? "bg-semantic-success text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        item.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  {!item.completed && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg bg-semantic-success/10 p-4 text-center"
          >
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm font-medium text-semantic-success">
              Congratulations! You&apos;re all set up.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleDismiss}
            >
              Dismiss Checklist
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
