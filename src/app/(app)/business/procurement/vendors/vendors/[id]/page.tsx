"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Building2, Mail, Phone, MapPin, Star, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Vendor {
  id: string;
  name: string;
  category?: string;
  status: string;
  rating?: number;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  tax_id?: string;
  payment_terms?: string;
  notes?: string;
  total_spend?: number;
  project_count?: number;
  metadata?: Record<string, unknown>;
}

const categoryConfig: Record<string, { label: string; className: string }> = {
  audio: { label: "Audio", className: "bg-blue-500 text-white" },
  lighting: { label: "Lighting", className: "bg-yellow-500 text-white" },
  video: { label: "Video", className: "bg-purple-500 text-white" },
  staging: { label: "Staging", className: "bg-orange-500 text-white" },
  catering: { label: "Catering", className: "bg-green-500 text-white" },
  transport: { label: "Transport", className: "bg-gray-500 text-white" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "outline" | "destructive" }> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
};

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [vendor, setVendor] = React.useState<Vendor | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchVendor() {
      try {
        const response = await fetch(`/api/v1/vendors/${vendorId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vendor");
        }
        const result = await response.json();
        setVendor(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Vendor not found"}</p>
      </div>
    );
  }

  const category = categoryConfig[vendor.category || "audio"] || categoryConfig.audio;
  const status = statusConfig[vendor.status] || statusConfig.pending;
  const services = (vendor.metadata?.services as Array<{ id: string; name: string; rate: string }>) || [];
  const tags = (vendor.metadata?.tags as string[]) || [];
  const totalSpend = vendor.total_spend || 0;
  const projectCount = vendor.project_count || 0;

  const breadcrumbs = [
    { label: "Vendors", href: "/vendors" },
    { label: vendor.name },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{vendor.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{vendor.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{vendor.contact_name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{vendor.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{vendor.notes || "No notes"}</p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "services",
      label: "Services",
      badge: services.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Services & Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.length > 0 ? services.map((service: { id: string; name: string; rate: string }) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{service.name}</span>
                  <Badge variant="secondary">{service.rate}</Badge>
                </div>
              )) : (
                <p className="text-muted-foreground">No services listed</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge className={category.className}>{category.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rating</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{vendor.rating || "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Spend</span>
            <span className="font-medium">${totalSpend.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Projects</span>
            <span className="font-medium">{projectCount}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment Terms</span>
            <span className="font-medium">{vendor.payment_terms || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? tags.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            )) : (
              <p className="text-sm text-muted-foreground">No tags</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={vendor.name}
      subtitle={`${category.label} Vendor • ${vendor.contact_name || "Unknown Contact"}`}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/vendors"
      editHref={`/vendors/${vendorId}/edit`}
      onDelete={() => console.log("Delete vendor")}
      tabs={tabs}
      defaultTab="overview"
      sidebarContent={sidebarContent}
      actions={[
        { id: "email", label: "Send Email", onClick: () => console.log("Email") },
        { id: "order", label: "Create Order", onClick: () => console.log("Order") },
      ]}
    />
  );
}
