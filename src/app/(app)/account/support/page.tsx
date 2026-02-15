'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PageShell } from '@/components/common/page-shell';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export default function SupportPage() {
  return (
    <PageShell
      title="Support"
      description="Get help and contact our support team"
      contentClassName="space-y-8"
    >
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
    </PageShell>
  );
}
