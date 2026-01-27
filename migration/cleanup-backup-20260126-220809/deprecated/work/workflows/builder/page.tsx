"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Play,
  Plus,
  GitBranch,
  Mail,
  Clock,
  CheckSquare,
  MessageSquare,
  Zap,
  ArrowRight,
} from "lucide-react";

const stepTypes = [
  { id: "trigger", name: "Trigger", icon: Zap, color: "bg-yellow-500" },
  { id: "action", name: "Action", icon: CheckSquare, color: "bg-blue-500" },
  { id: "condition", name: "Condition", icon: GitBranch, color: "bg-purple-500" },
  { id: "delay", name: "Delay", icon: Clock, color: "bg-orange-500" },
  { id: "email", name: "Send Email", icon: Mail, color: "bg-green-500" },
  { id: "notification", name: "Notification", icon: MessageSquare, color: "bg-pink-500" },
];

const workflowSteps = [
  { id: "1", type: "trigger", name: "On Event Created", config: { event: "event.created" } },
  { id: "2", type: "condition", name: "Check Event Type", config: { field: "type", value: "conference" } },
  { id: "3", type: "email", name: "Send Confirmation", config: { template: "event_confirmation" } },
  { id: "4", type: "action", name: "Create Tasks", config: { template: "event_tasks" } },
];

export default function WorkflowBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Builder</h1>
          <p className="text-muted-foreground">
            Design and build automation workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Step Types</CardTitle>
            <CardDescription>Drag to add steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stepTypes.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-2 border rounded-lg cursor-move hover:bg-muted"
                >
                  <div className={`p-1.5 rounded ${step.color}`}>
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workflow Canvas</CardTitle>
                <CardDescription>Build your workflow visually</CardDescription>
              </div>
              <Input placeholder="Workflow name..." className="w-64" defaultValue="New Event Workflow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowSteps.map((step, index) => {
                const stepType = stepTypes.find(t => t.id === step.type);
                return (
                  <div key={step.id}>
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                      <div className={`p-2 rounded ${stepType?.color}`}>
                        {stepType && <stepType.icon className="h-5 w-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{step.name}</h4>
                          <Badge variant="outline">{stepType?.name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {JSON.stringify(step.config)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Trigger Type</label>
              <Input className="mt-1" defaultValue="Event-based" />
            </div>
            <div>
              <label className="text-sm font-medium">Run Limit</label>
              <Input className="mt-1" defaultValue="Unlimited" />
            </div>
            <div>
              <label className="text-sm font-medium">Error Handling</label>
              <Input className="mt-1" defaultValue="Retry 3 times" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
