"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common";
import { CheckCircle } from "lucide-react";

const plans = [
  { name: "Starter", price: "$29", features: ["5 team members", "10 events/month", "Basic analytics"], current: false },
  { name: "Professional", price: "$99", features: ["25 team members", "Unlimited events", "Advanced analytics", "Priority support"], current: true },
  { name: "Enterprise", price: "$299", features: ["Unlimited members", "Custom features", "Dedicated support", "SSO"], current: false },
];

export default function AccountBillingSubscriptionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Manage your subscription plan"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between"><CardTitle>{plan.name}</CardTitle>{plan.current && <Badge>Current</Badge>}</div>
              <CardDescription><span className="text-2xl font-bold">{plan.price}</span>/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />{feature}</li>
                ))}
              </ul>
              <Button variant={plan.current ? "outline" : "default"} className="w-full mt-4">{plan.current ? "Current Plan" : "Upgrade"}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
