"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common";
import { Palette, Upload, Save } from "lucide-react";

export default function AccountOrganizationBrandingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding"
        description="Customize your organization branding"
        actions={
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        }
      />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Brand Settings</CardTitle><CardDescription>Logo and colors</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Logo</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Click to upload or drag and drop</p>
              <Button variant="outline" className="mt-4">Upload Logo</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Primary Color</Label><Input type="color" defaultValue="#000000" className="mt-2 h-10" /></div>
            <div><Label>Accent Color</Label><Input type="color" defaultValue="#3b82f6" className="mt-2 h-10" /></div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
