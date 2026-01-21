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
import {
  Search,
  MoreHorizontal,
  Box,
  Tag,
  Download,
  Trash2,
} from "lucide-react";

interface ContainerImage {
  id: string;
  name: string;
  tags: string[];
  size: string;
  pushedAt: string;
  pulls: number;
  vulnerabilities: number;
}

const containerImages: ContainerImage[] = [
  {
    id: "1",
    name: "atlvs/api-gateway",
    tags: ["v2.4.1", "latest", "stable"],
    size: "245 MB",
    pushedAt: "2024-06-15T14:30:00",
    pulls: 1250,
    vulnerabilities: 0,
  },
  {
    id: "2",
    name: "atlvs/auth-service",
    tags: ["v1.8.0", "latest"],
    size: "180 MB",
    pushedAt: "2024-06-14T10:00:00",
    pulls: 890,
    vulnerabilities: 0,
  },
  {
    id: "3",
    name: "atlvs/user-service",
    tags: ["v2.1.3", "latest"],
    size: "195 MB",
    pushedAt: "2024-06-13T16:00:00",
    pulls: 720,
    vulnerabilities: 2,
  },
  {
    id: "4",
    name: "atlvs/event-service",
    tags: ["v3.0.2", "latest", "beta"],
    size: "210 MB",
    pushedAt: "2024-06-15T09:00:00",
    pulls: 650,
    vulnerabilities: 0,
  },
  {
    id: "5",
    name: "atlvs/notification-service",
    tags: ["v1.5.1"],
    size: "125 MB",
    pushedAt: "2024-06-10T12:00:00",
    pulls: 420,
    vulnerabilities: 1,
  },
];

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContainerRegistryPage() {
  const totalImages = containerImages.length;
  const totalPulls = containerImages.reduce((acc, i) => acc + i.pulls, 0);
  const imagesWithVulns = containerImages.filter((i) => i.vulnerabilities > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Container Registry</h1>
          <p className="text-muted-foreground">
            Manage Docker container images
          </p>
        </div>
        <Button>
          <Box className="mr-2 h-4 w-4" />
          Push Image
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pulls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPulls.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${imagesWithVulns > 0 ? "text-yellow-500" : "text-green-500"}`}>{imagesWithVulns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search images..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Container Images
          </CardTitle>
          <CardDescription>All container images in the registry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {containerImages.map((image) => (
              <div key={image.id} className={`p-4 border rounded-lg ${image.vulnerabilities > 0 ? "border-yellow-500" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-medium">{image.name}</h4>
                      {image.vulnerabilities > 0 && (
                        <Badge className="bg-yellow-500 text-white">
                          {image.vulnerabilities} vulnerabilities
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {image.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="font-mono">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{image.size}</span>
                      <span>Pushed {formatDateTime(image.pushedAt)}</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {image.pulls} pulls
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Layers</DropdownMenuItem>
                      <DropdownMenuItem>Scan for Vulnerabilities</DropdownMenuItem>
                      <DropdownMenuItem>Copy Pull Command</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
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
