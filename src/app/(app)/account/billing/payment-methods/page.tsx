"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common";
import { CreditCard, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  is_default: boolean;
}

export default function AccountBillingPaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const response = await fetch("/api/v1/account/billing/payment-methods");
        if (response.ok) {
          const result = await response.json();
          setPaymentMethods(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPaymentMethods();
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
      <PageHeader
        title="Payment Methods"
        description="Manage payment methods"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        }
      />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Saved Cards</CardTitle><CardDescription>Your payment methods</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8" />
                  <div><p className="font-medium">{method.type} ending in {method.last4}</p><p className="text-sm text-muted-foreground">Expires {method.expiry}</p></div>
                  {method.is_default && <Badge>Default</Badge>}
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>Set as Default</DropdownMenuItem><DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
