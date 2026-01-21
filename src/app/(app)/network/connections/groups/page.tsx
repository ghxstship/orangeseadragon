"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Group {
  id: string;
  name: string;
  members: number;
  type: string;
  joined: boolean;
}

export default function ConnectionsGroupsPage() {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch("/api/v1/network/connections/groups");
        if (response.ok) {
          const result = await response.json();
          setGroups(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Groups</h1><p className="text-muted-foreground">Professional groups and communities</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Group</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />All Groups</CardTitle><CardDescription>Groups you can join</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{group.name}</h4><Badge variant="outline">{group.type}</Badge>{group.joined && <Badge>Joined</Badge>}</div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Users className="h-3 w-3" />{group.members} members</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={group.joined ? "outline" : "default"} size="sm">{group.joined ? "Leave" : "Join"}</Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View</DropdownMenuItem><DropdownMenuItem>Invite</DropdownMenuItem></DropdownMenuContent>
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
