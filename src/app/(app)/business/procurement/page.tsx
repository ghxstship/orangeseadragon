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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Plus,
  MoreHorizontal,
  ShoppingCart,
  Package,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import { PURCHASE_ORDER_STATUS, type PurchaseOrderStatus } from "@/lib/enums";
import { formatCurrency as formatCurrencyUtil, DEFAULT_CURRENCY } from "@/lib/config";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  description: string;
  amount: number;
  status: PurchaseOrderStatus;
  requestedBy: string;
  createdAt: string;
  items: number;
}

const purchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    vendor: "Audio Equipment Co",
    description: "Sound system rental for summer festival",
    amount: 45000,
    status: PURCHASE_ORDER_STATUS.APPROVED,
    requestedBy: "Sarah Chen",
    createdAt: "2024-06-10",
    items: 12,
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    vendor: "Stage Lighting Inc",
    description: "LED lighting fixtures",
    amount: 28500,
    status: PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
    requestedBy: "Mike Johnson",
    createdAt: "2024-06-12",
    items: 8,
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    vendor: "Catering Supplies Ltd",
    description: "Event catering supplies",
    amount: 12000,
    status: PURCHASE_ORDER_STATUS.ORDERED,
    requestedBy: "Emily Watson",
    createdAt: "2024-06-08",
    items: 25,
  },
  {
    id: "4",
    poNumber: "PO-2024-004",
    vendor: "Furniture Rentals",
    description: "Tables and chairs for corporate event",
    amount: 8500,
    status: PURCHASE_ORDER_STATUS.RECEIVED,
    requestedBy: "David Park",
    createdAt: "2024-06-05",
    items: 150,
  },
  {
    id: "5",
    poNumber: "PO-2024-005",
    vendor: "Print Shop Pro",
    description: "Event signage and banners",
    amount: 3200,
    status: PURCHASE_ORDER_STATUS.DRAFT,
    requestedBy: "Lisa Brown",
    createdAt: "2024-06-14",
    items: 15,
  },
];

const statusConfig: Record<PurchaseOrderStatus, { label: string; color: string }> = {
  [PURCHASE_ORDER_STATUS.DRAFT]: { label: "Draft", color: "bg-gray-500" },
  [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: { label: "Pending", color: "bg-yellow-500" },
  [PURCHASE_ORDER_STATUS.APPROVED]: { label: "Approved", color: "bg-blue-500" },
  [PURCHASE_ORDER_STATUS.ORDERED]: { label: "Ordered", color: "bg-purple-500" },
  [PURCHASE_ORDER_STATUS.RECEIVED]: { label: "Received", color: "bg-green-500" },
  [PURCHASE_ORDER_STATUS.CANCELLED]: { label: "Cancelled", color: "bg-red-500" },
};

function formatCurrency(amount: number): string {
  return formatCurrencyUtil(amount, DEFAULT_CURRENCY);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ProcurementPage() {
  const totalValue = purchaseOrders.reduce((acc, po) => acc + po.amount, 0);
  const pendingOrders = purchaseOrders.filter((po) => po.status === PURCHASE_ORDER_STATUS.PENDING_APPROVAL).length;
  const activeOrders = purchaseOrders.filter((po) => 
    po.status !== PURCHASE_ORDER_STATUS.RECEIVED && 
    po.status !== PURCHASE_ORDER_STATUS.CANCELLED && 
    po.status !== PURCHASE_ORDER_STATUS.DRAFT
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement"
        description="Purchasing and vendor management"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create PO
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Orders"
          value={purchaseOrders.length}
          icon={FileText}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Approval"
          value={pendingOrders}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
        <StatCard
          title="Active Orders"
          value={activeOrders}
          valueClassName="text-blue-500"
          icon={ShoppingCart}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Orders
          </CardTitle>
          <CardDescription>All purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchaseOrders.map((po) => {
              const status = statusConfig[po.status];

              return (
                <div key={po.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{po.poNumber}</span>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </div>
                      <h4 className="font-medium mt-1">{po.description}</h4>
                      <p className="text-sm text-muted-foreground">{po.vendor}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(po.amount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {po.items} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(po.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Requested by {po.requestedBy}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        {po.status === PURCHASE_ORDER_STATUS.PENDING_APPROVAL && (
                          <DropdownMenuItem>Approve</DropdownMenuItem>
                        )}
                        {po.status === PURCHASE_ORDER_STATUS.APPROVED && (
                          <DropdownMenuItem>Mark as Ordered</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
