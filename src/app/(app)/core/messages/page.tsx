'use client';

import * as React from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  AtSign,
  Star,
  Archive,
  MoreHorizontal,
  Circle,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Thread {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  starred: boolean;
  linkedRecord?: { type: string; name: string };
}

const threads: Thread[] = [
  {
    id: '1',
    subject: 'Budget approval needed for Acme Festival',
    participants: ['Sarah Chen', 'Mike Torres'],
    lastMessage: 'Can you review the updated line items? I\'ve adjusted the staging costs per our call.',
    timestamp: '10 min ago',
    unread: true,
    starred: true,
    linkedRecord: { type: 'budget', name: 'Acme Festival 2026' },
  },
  {
    id: '2',
    subject: 'Crew availability for March dates',
    participants: ['Alex Rivera', 'Jordan Lee', 'Pat Kim'],
    lastMessage: 'I\'ve confirmed 8 of the 12 crew members. Still waiting on lighting and rigging leads.',
    timestamp: '1 hr ago',
    unread: true,
    starred: false,
    linkedRecord: { type: 'project', name: 'TechStart Launch' },
  },
  {
    id: '3',
    subject: 'Invoice #INV-2026-0042 revision',
    participants: ['Finance Team'],
    lastMessage: 'Updated invoice attached with the corrected tax rate. Please review before sending to client.',
    timestamp: '3 hrs ago',
    unread: false,
    starred: false,
    linkedRecord: { type: 'invoice', name: 'INV-2026-0042' },
  },
  {
    id: '4',
    subject: 'Venue walkthrough photos',
    participants: ['Dana Park'],
    lastMessage: 'Here are the photos from yesterday\'s walkthrough. Loading dock access looks tight for the 53\' trailer.',
    timestamp: 'Yesterday',
    unread: false,
    starred: true,
    linkedRecord: { type: 'venue', name: 'Convention Center Hall B' },
  },
  {
    id: '5',
    subject: 'Equipment return checklist',
    participants: ['Warehouse Team'],
    lastMessage: 'All items from the GlobalFest show have been checked in. Two LED panels flagged for maintenance.',
    timestamp: 'Yesterday',
    unread: false,
    starred: false,
    linkedRecord: { type: 'asset', name: 'GlobalFest Equipment' },
  },
  {
    id: '6',
    subject: 'Weekly production sync notes',
    participants: ['Production Team'],
    lastMessage: 'Attached are the notes from today\'s sync. Action items assigned in the linked tasks.',
    timestamp: '2 days ago',
    unread: false,
    starred: false,
  },
];

export default function MessagesPage() {
  const [tab, setTab] = React.useState('inbox');
  const [search, setSearch] = React.useState('');
  const [selectedThread, setSelectedThread] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let result = threads;
    if (tab === 'starred') result = result.filter(t => t.starred);
    if (tab === 'unread') result = result.filter(t => t.unread);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.subject.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        t.participants.some(p => p.toLowerCase().includes(q))
      );
    }
    return result;
  }, [tab, search]);

  const selected = threads.find(t => t.id === selectedThread);

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">Internal messaging with threading and record linking</p>
          </div>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Thread List */}
        <div className="w-[400px] border-r flex flex-col">
          <div className="p-3 space-y-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full">
                <TabsTrigger value="inbox" className="flex-1">
                  Inbox
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                    {threads.filter(t => t.unread).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="starred" className="flex-1">Starred</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              filtered.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors",
                    selectedThread === thread.id && "bg-muted/50",
                    thread.unread && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {thread.unread && (
                      <Circle className="h-2 w-2 mt-2 fill-primary text-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("text-sm truncate", thread.unread && "font-bold")}>
                          {thread.participants.join(', ')}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{thread.timestamp}</span>
                      </div>
                      <p className={cn("text-sm truncate", thread.unread ? "font-semibold" : "text-muted-foreground")}>
                        {thread.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.lastMessage}</p>
                      {thread.linkedRecord && (
                        <Badge variant="outline" className="mt-1 text-[9px] h-4">
                          {thread.linkedRecord.type}: {thread.linkedRecord.name}
                        </Badge>
                      )}
                    </div>
                    {thread.starred && <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0 mt-1" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              <div className="border-b px-6 py-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{selected.subject}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.participants.join(', ')}
                    {selected.linkedRecord && (
                      <span className="ml-2">
                        · Linked to <span className="text-primary">{selected.linkedRecord.name}</span>
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Star className={cn("h-4 w-4", selected.starred && "text-amber-500 fill-amber-500")} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {selected.participants[0]?.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selected.participants[0]}</p>
                          <p className="text-[10px] text-muted-foreground">{selected.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selected.lastMessage}</p>
                    {selected.linkedRecord && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-primary cursor-pointer hover:underline">
                        <ChevronRight className="h-3 w-3" />
                        View linked {selected.linkedRecord.type}: {selected.linkedRecord.name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input placeholder="Type a message..." className="pr-20" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <AtSign className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Button size="sm">
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1">Choose a thread from the left to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
