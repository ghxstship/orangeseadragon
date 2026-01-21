"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Crown,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  current: boolean;
  icon: React.ElementType;
}

const plans: Plan[] = [
  {
    id: "1",
    name: "Starter",
    price: 0,
    period: "month",
    description: "For individuals getting started",
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "Email support",
      "1 team member",
    ],
    popular: false,
    current: false,
    icon: Zap,
  },
  {
    id: "2",
    name: "Pro",
    price: 49,
    period: "month",
    description: "For growing teams",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Up to 10 team members",
      "Custom integrations",
      "API access",
    ],
    popular: true,
    current: true,
    icon: Crown,
  },
  {
    id: "3",
    name: "Enterprise",
    price: 199,
    period: "month",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated support",
      "Custom contracts",
      "SLA guarantee",
      "On-premise option",
      "Advanced security",
    ],
    popular: false,
    current: false,
    icon: Building2,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">Pro Plan</h3>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">$49/month • Renews July 15, 2024</p>
              </div>
            </div>
            <Button variant="outline">Manage Billing</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;

              return (
                <div
                  key={plan.id}
                  className={`p-6 border rounded-lg relative ${plan.popular ? "border-primary border-2" : ""} ${plan.current ? "bg-primary/5" : ""}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.current ? "bg-primary" : "bg-muted"}`}>
                      <PlanIcon className={`h-5 w-5 ${plan.current ? "text-primary-foreground" : ""}`} />
                    </div>
                    <div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "Jun 15, 2024", amount: "$49.00", status: "Paid" },
              { date: "May 15, 2024", amount: "$49.00", status: "Paid" },
              { date: "Apr 15, 2024", amount: "$49.00", status: "Paid" },
            ].map((invoice, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Pro Plan - Monthly</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{invoice.amount}</span>
                  <Badge className="bg-green-500 text-white">{invoice.status}</Badge>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
