'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PageShell } from '@/components/common/page-shell';
import { BookOpen, Video, HelpCircle } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <PageShell
      title="Resources"
      description="Documentation, guides, and help articles"
      contentClassName="space-y-8"
    >
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                <div><h3 className="font-semibold text-sm">Documentation</h3><p className="text-xs text-muted-foreground">Full platform docs</p></div>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><Video className="h-5 w-5" /></div>
                <div><h3 className="font-semibold text-sm">Video Tutorials</h3><p className="text-xs text-muted-foreground">Learn by watching</p></div>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><HelpCircle className="h-5 w-5" /></div>
                <div><h3 className="font-semibold text-sm">Help Center</h3><p className="text-xs text-muted-foreground">FAQs and support</p></div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Getting Started</h2>
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Guides for new users will appear here.</CardContent></Card>
        </div>
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Frequently Asked Questions</h2>
          <Card><CardContent className="p-6 text-muted-foreground text-sm">Quick answers to common questions will appear here.</CardContent></Card>
        </div>
    </PageShell>
  );
}
