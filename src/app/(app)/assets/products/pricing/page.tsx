"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, DollarSign, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PricingRule {
  id: string;
  name: string;
  description: string;
  type: string;
  discount: string;
  status: string;
}

export default function ProductsPricingPage() {
  const [pricingRules, setPricingRules] = React.useState<PricingRule[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch("/api/v1/assets/products/pricing");
        if (response.ok) {
          const result = await response.json();
          setPricingRules(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
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
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Pricing</h1><p className="text-muted-foreground">Pricing rules and discounts</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Rule</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search pricing..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Pricing Rules</CardTitle><CardDescription>Manage pricing and discounts</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricingRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{rule.name}</h4><Badge variant={rule.type === "discount" ? "default" : rule.type === "premium" ? "destructive" : "secondary"}>{rule.type}</Badge></div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${rule.type === "discount" ? "text-green-500" : rule.type === "premium" ? "text-red-500" : ""}`}>{rule.discount}</span>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
