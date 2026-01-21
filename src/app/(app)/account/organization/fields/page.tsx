"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import { Plus, FormInput, MoreHorizontal, CheckCircle, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  used_in: string;
}

export default function AccountOrganizationFieldsPage() {
  const [customFields, setCustomFields] = React.useState<CustomField[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCustomFields() {
      try {
        const response = await fetch("/api/v1/account/organization/fields");
        if (response.ok) {
          const result = await response.json();
          setCustomFields(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch custom fields:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomFields();
  }, []);

  const requiredCount = customFields.filter((f) => f.required).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Fields"
        description="Manage custom data fields"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        }
      />

      <StatGrid columns={2}>
        <StatCard
          title="Total Fields"
          value={customFields.length}
          icon={FormInput}
        />
        <StatCard
          title="Required Fields"
          value={requiredCount}
          icon={CheckCircle}
        />
      </StatGrid>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FormInput className="h-5 w-5" />Custom Fields</CardTitle><CardDescription>Organization-wide custom fields</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{field.name}</h4>{field.required && <Badge variant="secondary">Required</Badge>}</div>
                  <p className="text-sm text-muted-foreground">Type: {field.type} • Used in: {field.used_in}</p>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
