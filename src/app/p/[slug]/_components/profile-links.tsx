"use client";

import { ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileLink {
    id: string;
    title: string;
    url: string;
    icon?: string;
    description?: string;
    is_featured: boolean;
    click_count: number;
}

interface ProfileLinksProps {
    links: ProfileLink[];
    themeConfig?: {
        primary_color?: string;
        card_style?: string;
    };
}

export function ProfileLinks({ links, themeConfig }: ProfileLinksProps) {
    if (!links || links.length === 0) return null;

    const handleLinkClick = async (linkId: string, url: string) => {
        try {
            await fetch("/api/p/track-click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkId }),
            });
        } catch {
            // Silent fail - don't block navigation
        }
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const cardStyle = themeConfig?.card_style || "rounded";
    const primaryColor = themeConfig?.primary_color || "#6366f1";

    return (
        <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Links</h2>
            <div className="space-y-3">
                {links.map((link) => {
                    return (
                        <button
                            key={link.id}
                            onClick={() => handleLinkClick(link.id, link.url)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] text-left group",
                                cardStyle === "rounded" && "rounded-xl",
                                cardStyle === "sharp" && "rounded-none",
                                cardStyle === "glass" && "rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
                                link.is_featured && "ring-2 ring-indigo-500"
                            )}
                        >
                            <div
                                className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <Link2
                                    className="h-5 w-5 transition-colors"
                                    style={{ color: primaryColor }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 dark:text-white truncate">
                                    {link.title}
                                </div>
                                {link.description && (
                                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {link.description}
                                    </div>
                                )}
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0" />
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
