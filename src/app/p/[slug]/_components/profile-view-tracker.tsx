"use client";

import { useEffect } from "react";

interface ProfileViewTrackerProps {
    profileId: string;
}

export function ProfileViewTracker({ profileId }: ProfileViewTrackerProps) {
    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch("/api/p/track-view", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        profileId,
                        referrer: document.referrer || null,
                        userAgent: navigator.userAgent,
                    }),
                });
            } catch {
                // Silent fail
            }
        };

        trackView();
    }, [profileId]);

    return null;
}
