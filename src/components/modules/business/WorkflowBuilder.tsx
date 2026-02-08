'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    Zap,
    Plus,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronUp,
    Mail,
    Bell,
    Tag,
    UserPlus,
    FileText,
    Clock,
    Webhook,
    Save,
    Loader2,
} from 'lucide-react';

interface WorkflowAction {
    id: string;
    action_type: string;
    action_config: Record<string, unknown>;
    position: number;
}

interface Workflow {
    id?: string;
    name: string;
    description: string;
    trigger_type: string;
    trigger_config: Record<string, unknown>;
    conditions: unknown[];
    is_active: boolean;
    actions: WorkflowAction[];
}

interface WorkflowBuilderProps {
    workflowId?: string;
    onSave?: (workflow: Workflow) => void;
    onCancel?: () => void;
}

const TRIGGER_TYPES = [
    { value: 'deal_stage_changed', label: 'Deal Stage Changed', icon: Zap },
    { value: 'deal_created', label: 'Deal Created', icon: Plus },
    { value: 'contact_created', label: 'Contact Created', icon: UserPlus },
    { value: 'lead_score_changed', label: 'Lead Score Changed', icon: Zap },
    { value: 'email_opened', label: 'Email Opened', icon: Mail },
    { value: 'meeting_booked', label: 'Meeting Booked', icon: Clock },
];

const ACTION_TYPES = [
    { value: 'send_email', label: 'Send Email', icon: Mail, color: 'bg-status-on-track', borderColor: 'border-l-status-on-track' },
    { value: 'send_notification', label: 'Send Notification', icon: Bell, color: 'bg-status-at-risk', borderColor: 'border-l-status-at-risk' },
    { value: 'create_task', label: 'Create Task', icon: FileText, color: 'bg-status-completed', borderColor: 'border-l-status-completed' },
    { value: 'add_tag', label: 'Add Tag', icon: Tag, color: 'bg-status-milestone', borderColor: 'border-l-status-milestone' },
    { value: 'update_field', label: 'Update Field', icon: FileText, color: 'bg-priority-high', borderColor: 'border-l-priority-high' },
    { value: 'webhook', label: 'Call Webhook', icon: Webhook, color: 'bg-muted-foreground', borderColor: 'border-l-muted-foreground' },
    { value: 'delay', label: 'Wait/Delay', icon: Clock, color: 'bg-accent', borderColor: 'border-l-accent' },
];

function ActionCard({
    action,
    index,
    onUpdate,
    onRemove,
    isExpanded,
    onToggleExpand,
}: {
    action: WorkflowAction;
    index: number;
    onUpdate: (id: string, updates: Partial<WorkflowAction>) => void;
    onRemove: (id: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}) {
    const actionType = ACTION_TYPES.find(t => t.value === action.action_type);
    const Icon = actionType?.icon || Zap;

    return (
        <Card className={cn("border-l-4", actionType?.borderColor || 'border-l-muted-foreground')}>
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <div className="cursor-grab text-muted-foreground">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <div className={cn("p-2 rounded-lg", actionType?.color || 'bg-muted-foreground')}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{actionType?.label || action.action_type}</p>
                        <p className="text-xs text-muted-foreground">Step {index + 1}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleExpand}
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(action.id)}
                    >
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </div>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                        {action.action_type === 'send_email' && (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Email Template</Label>
                                    <Select
                                        value={String(action.action_config.template_id || '')}
                                        onValueChange={(v) => onUpdate(action.id, {
                                            action_config: { ...action.action_config, template_id: v }
                                        })}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Select template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="welcome">Welcome Email</SelectItem>
                                            <SelectItem value="follow_up">Follow Up</SelectItem>
                                            <SelectItem value="thank_you">Thank You</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {action.action_type === 'send_notification' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">Message</Label>
                                <Input
                                    value={String(action.action_config.message || '')}
                                    onChange={(e) => onUpdate(action.id, {
                                        action_config: { ...action.action_config, message: e.target.value }
                                    })}
                                    placeholder="Notification message..."
                                    className="h-8"
                                />
                            </div>
                        )}

                        {action.action_type === 'create_task' && (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Task Title</Label>
                                    <Input
                                        value={String(action.action_config.title || '')}
                                        onChange={(e) => onUpdate(action.id, {
                                            action_config: { ...action.action_config, title: e.target.value }
                                        })}
                                        placeholder="Task title..."
                                        className="h-8"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Due in (days)</Label>
                                    <Input
                                        type="number"
                                        value={String(action.action_config.due_days || 1)}
                                        onChange={(e) => onUpdate(action.id, {
                                            action_config: { ...action.action_config, due_days: parseInt(e.target.value) }
                                        })}
                                        className="h-8"
                                    />
                                </div>
                            </>
                        )}

                        {action.action_type === 'add_tag' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">Tag Name</Label>
                                <Input
                                    value={String(action.action_config.tag || '')}
                                    onChange={(e) => onUpdate(action.id, {
                                        action_config: { ...action.action_config, tag: e.target.value }
                                    })}
                                    placeholder="Tag name..."
                                    className="h-8"
                                />
                            </div>
                        )}

                        {action.action_type === 'delay' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">Wait Duration (seconds)</Label>
                                <Input
                                    type="number"
                                    value={String(action.action_config.seconds || 60)}
                                    onChange={(e) => onUpdate(action.id, {
                                        action_config: { ...action.action_config, seconds: parseInt(e.target.value) }
                                    })}
                                    className="h-8"
                                />
                            </div>
                        )}

                        {action.action_type === 'webhook' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">Webhook URL</Label>
                                <Input
                                    value={String(action.action_config.url || '')}
                                    onChange={(e) => onUpdate(action.id, {
                                        action_config: { ...action.action_config, url: e.target.value }
                                    })}
                                    placeholder="https://..."
                                    className="h-8"
                                />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function WorkflowBuilder({ workflowId, onSave, onCancel }: WorkflowBuilderProps) {
    const queryClient = useQueryClient();
    const [expandedAction, setExpandedAction] = useState<string | null>(null);

    const [workflow, setWorkflow] = useState<Workflow>({
        name: '',
        description: '',
        trigger_type: '',
        trigger_config: {},
        conditions: [],
        is_active: false,
        actions: [],
    });

    // Load existing workflow
    const { isLoading } = useQuery({
        queryKey: ['workflow', workflowId],
        queryFn: async () => {
            if (!workflowId) return null;
            const res = await fetch(`/api/workflows/${workflowId}`);
            if (!res.ok) throw new Error('Failed to load workflow');
            const data = await res.json();
            setWorkflow(data);
            return data;
        },
        enabled: !!workflowId,
    });

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (data: Workflow) => {
            const url = workflowId ? `/api/workflows/${workflowId}` : '/api/workflows';
            const method = workflowId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!res.ok) throw new Error('Failed to save workflow');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            onSave?.(data);
        },
    });

    const handleAddAction = useCallback((actionType: string) => {
        const newAction: WorkflowAction = {
            id: crypto.randomUUID(),
            action_type: actionType,
            action_config: {},
            position: workflow.actions.length,
        };
        setWorkflow(prev => ({
            ...prev,
            actions: [...prev.actions, newAction],
        }));
        setExpandedAction(newAction.id);
    }, [workflow.actions.length]);

    const handleUpdateAction = useCallback((id: string, updates: Partial<WorkflowAction>) => {
        setWorkflow(prev => ({
            ...prev,
            actions: prev.actions.map(a => a.id === id ? { ...a, ...updates } : a),
        }));
    }, []);

    const handleRemoveAction = useCallback((id: string) => {
        setWorkflow(prev => ({
            ...prev,
            actions: prev.actions.filter(a => a.id !== id),
        }));
    }, []);

    const handleSave = () => {
        saveMutation.mutate(workflow);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        {workflowId ? 'Edit Workflow' : 'Create Workflow'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Automate actions based on triggers
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Switch
                            checked={workflow.is_active}
                            onCheckedChange={(checked) => setWorkflow(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label className="text-sm">
                            {workflow.is_active ? 'Active' : 'Inactive'}
                        </Label>
                    </div>
                    {onCancel && (
                        <Button variant="ghost" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Workflow
                    </Button>
                </div>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Workflow Name</Label>
                            <Input
                                value={workflow.name}
                                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Welcome New Leads"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Trigger</Label>
                            <Select
                                value={workflow.trigger_type}
                                onValueChange={(v) => setWorkflow(prev => ({ ...prev, trigger_type: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select trigger" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRIGGER_TYPES.map(trigger => (
                                        <SelectItem key={trigger.value} value={trigger.value}>
                                            <div className="flex items-center gap-2">
                                                <trigger.icon className="w-4 h-4" />
                                                {trigger.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Description (optional)</Label>
                        <Textarea
                            value={workflow.description}
                            onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="What does this workflow do?"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Trigger Config */}
            {workflow.trigger_type === 'deal_stage_changed' && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Trigger Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">From Stage (optional)</Label>
                                <Select
                                    value={String(workflow.trigger_config.from_stage || '')}
                                    onValueChange={(v) => setWorkflow(prev => ({
                                        ...prev,
                                        trigger_config: { ...prev.trigger_config, from_stage: v || undefined }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Any stage</SelectItem>
                                        <SelectItem value="prospecting">Prospecting</SelectItem>
                                        <SelectItem value="qualification">Qualification</SelectItem>
                                        <SelectItem value="proposal">Proposal</SelectItem>
                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">To Stage (optional)</Label>
                                <Select
                                    value={String(workflow.trigger_config.to_stage || '')}
                                    onValueChange={(v) => setWorkflow(prev => ({
                                        ...prev,
                                        trigger_config: { ...prev.trigger_config, to_stage: v || undefined }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Any stage</SelectItem>
                                        <SelectItem value="qualification">Qualification</SelectItem>
                                        <SelectItem value="proposal">Proposal</SelectItem>
                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                        <SelectItem value="closed-won">Closed Won</SelectItem>
                                        <SelectItem value="closed-lost">Closed Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Actions</CardTitle>
                        <Badge variant="secondary">{workflow.actions.length} steps</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {workflow.actions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No actions yet</p>
                            <p className="text-xs">Add actions to run when this workflow triggers</p>
                        </div>
                    ) : (
                        workflow.actions.map((action, index) => (
                            <ActionCard
                                key={action.id}
                                action={action}
                                index={index}
                                onUpdate={handleUpdateAction}
                                onRemove={handleRemoveAction}
                                isExpanded={expandedAction === action.id}
                                onToggleExpand={() => setExpandedAction(
                                    expandedAction === action.id ? null : action.id
                                )}
                            />
                        ))
                    )}

                    {/* Add Action */}
                    <div className="pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Add Action</p>
                        <div className="flex flex-wrap gap-2">
                            {ACTION_TYPES.map(action => (
                                <Button
                                    key={action.value}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddAction(action.value)}
                                    className="gap-1.5"
                                >
                                    <action.icon className="w-3.5 h-3.5" />
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default WorkflowBuilder;
