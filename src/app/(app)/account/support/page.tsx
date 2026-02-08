'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Get help and contact our support team</p>
      </header>
      <div className="flex-1 overflow-auto p-6 space-y-8">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Contact Options</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><MessageCircle className="h-5 w-5" /></div>
                <div><h3 className="font-semibold text-sm">Live Chat</h3><p className="text-xs text-muted-foreground">Available 24/7</p></div>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><Mail className="h-5 w-5" /></div>
                <div><h3 className="font-semibold text-sm">Email Support</h3><p className="text-xs text-muted-foreground">support@atlvs.com</p></div>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><Phone className="h-5 w-5" /></div>
                <div><h3 className="font-semibold text-sm">Phone Support</h3><p className="text-xs text-muted-foreground">Pro plan only</p></div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Submit a Support Ticket</h2>
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Describe your issue and we&apos;ll get back to you within 24 hours.</CardContent></Card>
        </div>
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Your Support Tickets</h2>
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Track the status of your support requests.</CardContent></Card>
        </div>
      </div>
    </div>
  );
}
