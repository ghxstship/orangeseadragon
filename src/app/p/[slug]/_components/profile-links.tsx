"use client";

import { ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

    return (
        <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground mb-4">Links</h2>
            <div className="space-y-3">
                {links.map((link) => {
                    return (
                        <Button
                            type="button"
                            variant="outline"
                            key={link.id}
                            onClick={() => handleLinkClick(link.id, link.url)}
                            className={cn(
                                "h-auto w-full justify-start whitespace-normal flex items-center gap-4 p-4 bg-card border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] text-left group",
                                cardStyle === "rounded" && "rounded-xl",
                                cardStyle === "sharp" && "rounded-none",
                                cardStyle === "glass" && "rounded-xl bg-card/80 backdrop-blur-sm",
                                link.is_featured && "ring-2 ring-primary"
                            )}
                        >
                            <div
                                className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10"
                            >
                                <Link2 className="h-5 w-5 transition-colors text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground truncate">
                                    {link.title}
                                </div>
                                {link.description && (
                                    <div className="text-sm text-muted-foreground truncate">
                                        {link.description}
                                    </div>
                                )}
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                        </Button>
                    );
                })}
            </div>
        </section>
    );
}
