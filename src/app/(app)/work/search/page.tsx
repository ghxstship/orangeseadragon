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
import { PageHeader } from "@/components/common";
import {
  Search,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Building,
  Clock,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "event" | "contact" | "invoice" | "vendor" | "document";
  path: string;
  matchedField: string;
}

const searchResults: SearchResult[] = [
  {
    id: "1",
    title: "Summer Music Festival 2024",
    description: "Annual outdoor music event at Central Park",
    type: "event",
    path: "/events/evt_123",
    matchedField: "Title",
  },
  {
    id: "2",
    title: "John Smith",
    description: "john.smith@example.com • VIP Guest",
    type: "contact",
    path: "/contacts/con_456",
    matchedField: "Name",
  },
  {
    id: "3",
    title: "INV-2024-0089",
    description: "Invoice for Acme Corp - $2,500.00",
    type: "invoice",
    path: "/invoices/inv_789",
    matchedField: "Invoice Number",
  },
  {
    id: "4",
    title: "Premium Catering Co.",
    description: "Food & Beverage vendor",
    type: "vendor",
    path: "/vendors/vnd_abc",
    matchedField: "Company Name",
  },
  {
    id: "5",
    title: "Event Contract Template",
    description: "Standard event contract document",
    type: "document",
    path: "/documents/doc_def",
    matchedField: "Document Name",
  },
];

const recentSearches = [
  "Summer Festival",
  "John Smith",
  "Invoice 2024",
  "Catering vendor",
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  event: { icon: Calendar, color: "bg-blue-500", label: "Event" },
  contact: { icon: Users, color: "bg-green-500", label: "Contact" },
  invoice: { icon: DollarSign, color: "bg-orange-500", label: "Invoice" },
  vendor: { icon: Building, color: "bg-purple-500", label: "Vendor" },
  document: { icon: FileText, color: "bg-gray-500", label: "Document" },
};

export default function GlobalSearchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Search"
        description="Search across all your data"
      />

      <div className="relative max-w-3xl">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events, contacts, invoices, vendors..."
          className="pl-12 h-14 text-lg"
          autoFocus
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>{searchResults.length} results found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.map((result) => {
                  const type = typeConfig[result.type];
                  const TypeIcon = type.icon;

                  return (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${type.color}`}>
                          <TypeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{result.title}</h4>
                            <Badge variant="outline">{type.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Matched: {result.matchedField}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <Button key={idx} variant="ghost" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    {search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(typeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button key={key} variant="outline" className="w-full justify-start">
                      <Icon className={`mr-2 h-4 w-4`} />
                      {config.label}s
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Use quotes for exact matches</p>
              <p>• Type &quot;type:event&quot; to filter by type</p>
              <p>• Use &quot;date:today&quot; for date filters</p>
              <p>• Press Cmd+K anywhere to search</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
