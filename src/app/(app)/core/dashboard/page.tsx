import { MetricsWidget } from "@/components/widgets/MetricsWidget";
import { QuickActionsWidget } from "@/components/widgets/QuickActionsWidget";
import { RecentActivityWidget } from "@/components/widgets/RecentActivityWidget";
import { TodayScheduleWidget } from "@/components/widgets/TodayScheduleWidget";
import { UpcomingTasksWidget } from "@/components/widgets/UpcomingTasksWidget";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Command Center
                </h1>
                <p className="text-lg text-muted-foreground">
                    Everything you need to manage your personal operations and team collaboration.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    <MetricsWidget />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TodayScheduleWidget />
                        <UpcomingTasksWidget />
                    </div>
                </div>

                {/* Sidebar Area */}
                <div className="lg:col-span-4 space-y-6">
                    <QuickActionsWidget />
                    <RecentActivityWidget limit={8} />
                </div>
            </div>
        </div>
    );
}
