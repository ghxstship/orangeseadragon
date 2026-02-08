'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Video, HelpCircle } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">Documentation, guides, and help articles</p>
      </header>
      <div className="flex-1 overflow-auto p-6 space-y-8">
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
      </div>
    </div>
  );
}
