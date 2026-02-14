"use client";

import { useState, useCallback } from "react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
    profileUrl: string;
    profileSlug: string;
    themeConfig?: {
        primary_color?: string;
    };
}

export function QRCodeDisplay({ profileUrl, profileSlug, themeConfig }: QRCodeDisplayProps) {
    const [copied, setCopied] = useState(false);
    const primaryColor = (themeConfig?.primary_color ?? "6366f1").replace("#", "");
    
    // Generate QR code using Google Charts API (no dependencies needed)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(profileUrl)}&color=${primaryColor}&bgcolor=ffffff`;
    const qrCodeUrlHiRes = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(profileUrl)}&color=${primaryColor}&bgcolor=ffffff`;

    const copyUrl = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = profileUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [profileUrl]);

    const downloadQR = useCallback(() => {
        const a = document.createElement("a");
        a.href = qrCodeUrlHiRes;
        a.download = `${profileSlug}-qr.png`;
        a.target = "_blank";
        a.click();
    }, [qrCodeUrlHiRes, profileSlug]);

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Share Profile
            </h3>
            <div className="flex flex-col items-center gap-4">
                <div className="bg-background p-3 rounded-xl shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={qrCodeUrl}
                        alt="Profile QR Code"
                        className="w-32 h-32"
                        loading="lazy"
                    />
                </div>
                <div className="w-full space-y-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={downloadQR}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download QR
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={copyUrl}
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2 text-semantic-success" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
