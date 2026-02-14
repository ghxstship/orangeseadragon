"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactFormProps {
    profileId: string;
    leadCaptureType: "contact" | "newsletter" | "both";
    themeConfig?: {
        primary_color?: string;
    };
}

export function ContactForm({ profileId, leadCaptureType, themeConfig: _themeConfig }: ContactFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const showMessage = leadCaptureType === "contact" || leadCaptureType === "both";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            profileId,
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            message: showMessage ? (formData.get("message") as string) : undefined,
            leadType: leadCaptureType === "newsletter" ? "newsletter" : "contact",
        };

        try {
            const response = await fetch("/api/p/submit-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to submit");
            }

            setIsSuccess(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-card rounded-2xl p-6 shadow-sm border">
                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle className="h-12 w-12 text-semantic-success mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">
                        {leadCaptureType === "newsletter" ? "Subscribed!" : "Message Sent!"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {leadCaptureType === "newsletter"
                            ? "You'll receive updates soon."
                            : "We'll get back to you shortly."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                {leadCaptureType === "newsletter" ? "Stay Updated" : "Get in Touch"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                        Name
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        required
                        className="bg-muted/40"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="bg-muted/40"
                    />
                </div>
                {showMessage && (
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">
                            Message
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="How can we help?"
                            rows={3}
                            className="bg-muted/40 resize-none"
                        />
                    </div>
                )}
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    {leadCaptureType === "newsletter" ? "Subscribe" : "Send Message"}
                </Button>
            </form>
        </div>
    );
}
