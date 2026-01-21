"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Download, Loader2 } from "lucide-react";

interface BrandAsset {
  name: string;
  format: string;
  size: string;
}

export default function ContentBrandPage() {
  const [brandAssets, setBrandAssets] = React.useState<BrandAsset[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBrandAssets() {
      try {
        const response = await fetch("/api/v1/content/brand");
        if (response.ok) {
          const result = await response.json();
          setBrandAssets(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch brand assets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrandAssets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Brand Assets</h1><p className="text-muted-foreground">Brand guidelines and assets</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Brand Kit</CardTitle><CardDescription>Download brand assets</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brandAssets.map((asset) => (
              <div key={asset.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">{asset.name}</h4><p className="text-sm text-muted-foreground">{asset.format} • {asset.size}</p></div>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Download</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
