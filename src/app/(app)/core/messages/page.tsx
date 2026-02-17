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
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  name: string | null;
  type: string;
  participant_ids: string[];
  last_message_at: string | null;
  last_message_preview: string | null;
  is_archived: boolean;
  is_starred: boolean;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachments: unknown[] | null;
  created_at: string;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function MessagesPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState('inbox');
  const [search, setSearch] = React.useState('');
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [composeText, setComposeText] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const fetchConversations = React.useCallback(async () => {
    try {
      const archived = tab === 'archived';
      const res = await fetch(`/api/conversations?archived=${archived}`);
      if (!res.ok) {
        setConversations([]);
        return;
      }
      const json = await res.json();
      setConversations(json.data ?? []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  React.useEffect(() => {
    setLoading(true);
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = React.useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
      if (!res.ok) {
        setMessages([]);
        return;
      }
      const json = await res.json();
      setMessages(json.data ?? []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, fetchMessages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!composeText.trim() || !selectedConversationId) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversationId,
          content: composeText.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ variant: 'destructive', title: 'Failed to send', description: err?.error?.message || 'Please try again' });
        return;
      }
      setComposeText('');
      fetchMessages(selectedConversationId);
      fetchConversations();
    } catch {
      toast({ variant: 'destructive', title: 'Network error', description: 'Could not send message' });
    } finally {
      setSending(false);
    }
  };

  const handleStar = async (conv: Conversation) => {
    try {
      await fetch(`/api/[entity]/${conv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'conversations', is_starred: !conv.is_starred }),
      });
      fetchConversations();
    } catch { /* silent */ }
  };

  const handleArchive = async (conv: Conversation) => {
    try {
      await fetch(`/api/[entity]/${conv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'conversations', is_archived: !conv.is_archived }),
      });
      fetchConversations();
      if (selectedConversationId === conv.id) setSelectedConversationId(null);
    } catch { /* silent */ }
  };

  const filtered = React.useMemo(() => {
    let result = conversations;
    if (tab === 'starred') result = result.filter(c => c.is_starred);
    if (tab === 'unread') result = result.filter(c => !c.is_read);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        (c.name ?? '').toLowerCase().includes(q) ||
        (c.last_message_preview ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [conversations, tab, search]);

  const unreadCount = conversations.filter(c => !c.is_read).length;
  const selected = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">Internal messaging with threading and record linking</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => { setLoading(true); fetchConversations(); }}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
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
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="starred" className="flex-1">Starred</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <Button
                  key={conv.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={cn(
                    "h-auto w-full justify-start rounded-none text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors",
                    selectedConversationId === conv.id && "bg-muted/50",
                    !conv.is_read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!conv.is_read && (
                      <Circle className="h-2 w-2 mt-2 fill-primary text-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("text-sm truncate", !conv.is_read && "font-bold")}>
                          {conv.name || 'Direct Message'}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message_preview || 'No messages yet'}
                      </p>
                    </div>
                    {conv.is_starred && <Star className="h-3 w-3 text-semantic-warning fill-current flex-shrink-0 mt-1" />}
                  </div>
                </Button>
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
                  <h2 className="font-semibold">{selected.name || 'Direct Message'}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.participant_ids.length} participant{selected.participant_ids.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStar(selected)}>
                    <Star className={cn("h-4 w-4", selected.is_starred && "text-semantic-warning fill-current")} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchive(selected)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Send the first message below</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <Card key={msg.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {getInitials(msg.sender_id.slice(0, 4))}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{msg.sender_id.slice(0, 8)}…</p>
                              <p className="text-[10px] text-muted-foreground">{formatRelativeTime(msg.created_at)}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      className="pr-20"
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      disabled={sending}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                        <AtSign className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Button size="sm" type="submit" disabled={sending || !composeText.trim()}>
                    {sending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                    Send
                  </Button>
                </form>
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
