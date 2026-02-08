'use client';

import React, { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Send,
    Paperclip,
    ChevronDown,
    ChevronUp,
    FileText,
    Loader2,
    AlertCircle,
} from 'lucide-react';

interface EmailRecipient {
    address: string;
    name?: string;
}

interface EmailComposerProps {
    open: boolean;
    onClose: () => void;
    defaultTo?: EmailRecipient[];
    defaultSubject?: string;
    defaultBody?: string;
    replyTo?: {
        messageId: string;
        subject: string;
        from: EmailRecipient;
    };
    contactId?: string;
    companyId?: string;
    dealId?: string;
    onSent?: (messageId: string) => void;
}

interface EmailAccount {
    id: string;
    email_address: string;
    display_name?: string;
    provider: string;
    is_default: boolean;
}

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    content_html: string;
}

export function EmailComposer({
    open,
    onClose,
    defaultTo = [],
    defaultSubject = '',
    defaultBody = '',
    replyTo,
    contactId,
    companyId,
    dealId,
    onSent,
}: EmailComposerProps) {
    const queryClient = useQueryClient();
    
    // Form state
    const [to, setTo] = useState<string>(defaultTo.map(r => r.address).join(', '));
    const [cc, setCc] = useState<string>('');
    const [bcc, setBcc] = useState<string>('');
    const [subject, setSubject] = useState<string>(
        replyTo ? `Re: ${replyTo.subject}` : defaultSubject
    );
    const [body, setBody] = useState<string>(defaultBody);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    // Fetch email accounts
    const { data: accountsData } = useQuery({
        queryKey: ['email-accounts'],
        queryFn: async () => {
            const res = await fetch('/api/email-accounts');
            if (!res.ok) throw new Error('Failed to load accounts');
            return res.json();
        },
    });

    const accounts: EmailAccount[] = accountsData?.records || [];

    // Auto-select default account
    React.useEffect(() => {
        if (!selectedAccountId && accounts.length > 0) {
            const defaultAccount = accounts.find(a => a.is_default) || accounts[0];
            if (defaultAccount) {
                setSelectedAccountId(defaultAccount.id);
            }
        }
    }, [accounts, selectedAccountId]);

    // Fetch email templates
    const { data: templatesData } = useQuery({
        queryKey: ['email-templates'],
        queryFn: async () => {
            const res = await fetch('/api/email-templates?is_active=true');
            if (!res.ok) throw new Error('Failed to load templates');
            return res.json();
        },
    });

    const templates: EmailTemplate[] = templatesData?.records || [];

    // Apply template
    const handleTemplateSelect = useCallback((templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSubject(template.subject);
            setBody(template.content_html);
            setSelectedTemplateId(templateId);
        }
    }, [templates]);

    // Send mutation
    const sendMutation = useMutation({
        mutationFn: async () => {
            const toAddresses = to.split(',').map(addr => ({
                address: addr.trim(),
            })).filter(a => a.address);

            const ccAddresses = cc ? cc.split(',').map(addr => ({
                address: addr.trim(),
            })).filter(a => a.address) : [];

            const bccAddresses = bcc ? bcc.split(',').map(addr => ({
                address: addr.trim(),
            })).filter(a => a.address) : [];

            const res = await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email_account_id: selectedAccountId,
                    to_addresses: toAddresses,
                    cc_addresses: ccAddresses,
                    bcc_addresses: bccAddresses,
                    subject,
                    body_html: body,
                    contact_id: contactId,
                    company_id: companyId,
                    deal_id: dealId,
                    in_reply_to: replyTo?.messageId,
                    template_id: selectedTemplateId || undefined,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to send email');
            }

            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            onSent?.(data.id);
            onClose();
        },
    });

    const handleSend = () => {
        if (!to.trim()) return;
        if (!selectedAccountId) return;
        sendMutation.mutate();
    };

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {replyTo ? 'Reply' : 'Compose Email'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto space-y-4">
                    {/* From Account */}
                    {accounts.length > 1 && (
                        <div className="space-y-1.5">
                            <Label className="text-xs">From</Label>
                            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(account => (
                                        <SelectItem key={account.id} value={account.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{account.display_name || account.email_address}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    ({account.email_address})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {accounts.length === 1 && selectedAccount && (
                        <div className="text-sm text-muted-foreground">
                            From: {selectedAccount.display_name || selectedAccount.email_address}
                        </div>
                    )}

                    {/* To */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">To</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setShowCcBcc(!showCcBcc)}
                            >
                                {showCcBcc ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                                Cc/Bcc
                            </Button>
                        </div>
                        <Input
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="recipient@example.com"
                            className="h-9"
                        />
                    </div>

                    {/* CC/BCC */}
                    {showCcBcc && (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Cc</Label>
                                <Input
                                    value={cc}
                                    onChange={(e) => setCc(e.target.value)}
                                    placeholder="cc@example.com"
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Bcc</Label>
                                <Input
                                    value={bcc}
                                    onChange={(e) => setBcc(e.target.value)}
                                    placeholder="bcc@example.com"
                                    className="h-9"
                                />
                            </div>
                        </>
                    )}

                    {/* Subject */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Subject</Label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email subject"
                            className="h-9"
                        />
                    </div>

                    {/* Template Selector */}
                    {templates.length > 0 && (
                        <div className="space-y-1.5">
                            <Label className="text-xs">Template</Label>
                            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select a template (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(template => (
                                        <SelectItem key={template.id} value={template.id}>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" />
                                                <span>{template.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Body */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Message</Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your message..."
                            className="min-h-[200px] resize-none"
                        />
                    </div>

                    {/* CRM Associations */}
                    {(contactId || companyId || dealId) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Linked to:</span>
                            {contactId && <Badge variant="secondary">Contact</Badge>}
                            {companyId && <Badge variant="secondary">Company</Badge>}
                            {dealId && <Badge variant="secondary">Deal</Badge>}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" disabled>
                            <Paperclip className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!to.trim() || !selectedAccountId || sendMutation.isPending}
                        >
                            {sendMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Error State */}
                {sendMutation.isError && (
                    <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                        <AlertCircle className="h-4 w-4" />
                        {sendMutation.error?.message || 'Failed to send email'}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default EmailComposer;
