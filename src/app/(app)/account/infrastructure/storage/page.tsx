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
import { Progress } from "@/components/ui/progress";
import {
  HardDrive,
  FolderOpen,
  FileText,
  Image,
  Film,
  Archive,
  Trash2,
} from "lucide-react";

interface StorageBucket {
  id: string;
  name: string;
  type: "files" | "images" | "videos" | "backups";
  used: number;
  total: number;
  objects: number;
  region: string;
}

const storageBuckets: StorageBucket[] = [
  {
    id: "1",
    name: "user-uploads",
    type: "files",
    used: 245,
    total: 500,
    objects: 125000,
    region: "us-east-1",
  },
  {
    id: "2",
    name: "event-images",
    type: "images",
    used: 180,
    total: 300,
    objects: 85000,
    region: "us-east-1",
  },
  {
    id: "3",
    name: "video-content",
    type: "videos",
    used: 420,
    total: 1000,
    objects: 2500,
    region: "us-west-2",
  },
  {
    id: "4",
    name: "database-backups",
    type: "backups",
    used: 156,
    total: 200,
    objects: 365,
    region: "us-east-1",
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  files: { icon: FileText, color: "bg-blue-500" },
  images: { icon: Image, color: "bg-green-500" },
  videos: { icon: Film, color: "bg-purple-500" },
  backups: { icon: Archive, color: "bg-orange-500" },
};

export default function StorageManagementPage() {
  const totalUsed = storageBuckets.reduce((acc, b) => acc + b.used, 0);
  const totalCapacity = storageBuckets.reduce((acc, b) => acc + b.total, 0);
  const totalObjects = storageBuckets.reduce((acc, b) => acc + b.objects, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storage Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage file storage
          </p>
        </div>
        <Button>
          <FolderOpen className="mr-2 h-4 w-4" />
          Create Bucket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity} GB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed} GB</div>
            <Progress value={(totalUsed / totalCapacity) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalCapacity - totalUsed} GB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Objects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalObjects / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Buckets
          </CardTitle>
          <CardDescription>All storage buckets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storageBuckets.map((bucket) => {
              const type = typeConfig[bucket.type];
              const TypeIcon = type.icon;
              const usagePercent = (bucket.used / bucket.total) * 100;

              return (
                <div key={bucket.id} className={`p-4 border rounded-lg ${usagePercent > 80 ? "border-yellow-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono font-medium">{bucket.name}</h4>
                          <Badge variant="outline">{bucket.type}</Badge>
                          {usagePercent > 80 && (
                            <Badge className="bg-yellow-500 text-white">Low Space</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bucket.region} • {(bucket.objects / 1000).toFixed(0)}K objects
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Browse
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cleanup
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Storage Used</span>
                      <span>{bucket.used} GB / {bucket.total} GB ({Math.round(usagePercent)}%)</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Optimization</CardTitle>
          <CardDescription>Recommendations to optimize storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <p className="font-medium">Unused Files</p>
            <p className="text-sm text-muted-foreground">45 GB of files haven&apos;t been accessed in 90 days</p>
            <Button variant="outline" size="sm" className="mt-2">Review Files</Button>
          </div>
          <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <p className="font-medium">Duplicate Detection</p>
            <p className="text-sm text-muted-foreground">12 GB of potential duplicate files detected</p>
            <Button variant="outline" size="sm" className="mt-2">Review Duplicates</Button>
          </div>
          <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
            <p className="font-medium">Compression</p>
            <p className="text-sm text-muted-foreground">Enable compression to save up to 20% storage</p>
            <Button variant="outline" size="sm" className="mt-2">Enable</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
