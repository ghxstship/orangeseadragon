"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Package,
  Layers,
  BookOpen,
  DollarSign,
  Plus,
  Search,
  MoreHorizontal,
  ChevronRight,
  Tag,
  TrendingUp,
  Star,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  category: "service" | "package" | "equipment" | "addon";
  price: number;
  unit: string;
  status: "active" | "draft" | "archived";
  popularity: number;
}

const products: Product[] = [
  {
    id: "1",
    name: "Full Event Production",
    description: "Complete event production including sound, lighting, and staging",
    category: "service",
    price: 15000,
    unit: "per event",
    status: "active",
    popularity: 95,
  },
  {
    id: "2",
    name: "Sound System Rental",
    description: "Professional PA system with engineer",
    category: "equipment",
    price: 2500,
    unit: "per day",
    status: "active",
    popularity: 88,
  },
  {
    id: "3",
    name: "Festival Package",
    description: "Multi-day festival production bundle",
    category: "package",
    price: 75000,
    unit: "per festival",
    status: "active",
    popularity: 72,
  },
  {
    id: "4",
    name: "Lighting Design",
    description: "Custom lighting design and operation",
    category: "service",
    price: 3500,
    unit: "per event",
    status: "active",
    popularity: 85,
  },
  {
    id: "5",
    name: "VIP Experience Add-on",
    description: "Premium VIP area setup and management",
    category: "addon",
    price: 5000,
    unit: "per event",
    status: "active",
    popularity: 65,
  },
  {
    id: "6",
    name: "Corporate Event Package",
    description: "Professional corporate event production",
    category: "package",
    price: 25000,
    unit: "per event",
    status: "draft",
    popularity: 0,
  },
];

const categoryConfig: Record<string, { label: string; color: string }> = {
  service: { label: "Service", color: "bg-blue-500" },
  package: { label: "Package", color: "bg-purple-500" },
  equipment: { label: "Equipment", color: "bg-green-500" },
  addon: { label: "Add-on", color: "bg-orange-500" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500" },
  draft: { label: "Draft", color: "bg-yellow-500" },
  archived: { label: "Archived", color: "bg-gray-500" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductsPage() {
  const activeProducts = products.filter((p) => p.status === "active").length;
  const serviceCount = products.filter((p) => p.category === "service").length;
  const packageCount = products.filter((p) => p.category === "package").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your products, services, and pricing"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Package}
        />
        <StatCard
          title="Active"
          value={activeProducts}
          valueClassName="text-green-500"
          icon={Tag}
        />
        <StatCard
          title="Services"
          value={serviceCount}
          icon={Layers}
        />
        <StatCard
          title="Packages"
          value={packageCount}
          icon={BookOpen}
        />
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/products/services">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Services
              </CardTitle>
              <CardDescription>Service offerings</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/products/packages">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-500" />
                Packages
              </CardTitle>
              <CardDescription>Service bundles</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/products/catalog">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                Catalog
              </CardTitle>
              <CardDescription>Product catalog</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/products/pricing">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-500" />
                Pricing
              </CardTitle>
              <CardDescription>Pricing rules</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            All Products
          </CardTitle>
          <CardDescription>Your products and services catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => {
              const category = categoryConfig[product.category];
              const status = statusConfig[product.status];

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{product.name}</h4>
                        <Badge className={`${category.color} text-white`}>
                          {category.label}
                        </Badge>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      {product.popularity > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span>{product.popularity}% popularity</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-muted-foreground">{product.unit}</p>
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
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
