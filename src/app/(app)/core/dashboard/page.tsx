"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardGrid, DashboardGridSkeleton } from "@/components/dashboard/DashboardGrid";
import { DashboardLayout, defaultDashboardLayout } from "@/lib/dashboard/widget-registry";

export default function DashboardPage() {
    const [layout, setLayout] = useState<DashboardLayout>(defaultDashboardLayout);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [layoutId, setLayoutId] = useState<string | null>(null);

    // Fetch user's dashboard layout
    useEffect(() => {
        async function fetchLayout() {
            try {
                const response = await fetch("/api/dashboard-layouts");
                const result = await response.json();
                
                if (result.data && result.data.length > 0) {
                    // Use default layout or first available
                    const defaultLayout = result.data.find((l: DashboardLayout) => l.isDefault) || result.data[0];
                    setLayout({
                        ...defaultLayout,
                        widgets: defaultLayout.widgets || [],
                    });
                    setLayoutId(defaultLayout.id);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard layout:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLayout();
    }, []);

    const handleLayoutChange = useCallback((newLayout: DashboardLayout) => {
        setLayout(newLayout);
    }, []);

    const handleEditToggle = useCallback(async () => {
        if (isEditing) {
            // Save layout
            try {
                if (layoutId) {
                    await fetch(`/api/dashboard-layouts/${layoutId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            widgets: layout.widgets,
                            columns: layout.columns,
                        }),
                    });
                } else {
                    const response = await fetch("/api/dashboard-layouts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: "My Dashboard",
                            widgets: layout.widgets,
                            columns: layout.columns,
                            is_default: true,
                        }),
                    });
                    const result = await response.json();
                    if (result.data?.id) {
                        setLayoutId(result.data.id);
                    }
                }
            } catch (error) {
                console.error("Failed to save dashboard layout:", error);
            }
        }
        setIsEditing(!isEditing);
    }, [isEditing, layout, layoutId]);

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

            {isLoading ? (
                <DashboardGridSkeleton />
            ) : (
                <DashboardGrid
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    isEditing={isEditing}
                    onEditToggle={handleEditToggle}
                />
            )}
        </div>
    );
}
