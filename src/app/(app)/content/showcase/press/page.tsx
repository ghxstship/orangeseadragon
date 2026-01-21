"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, Calendar } from "lucide-react";

const pressItems = [
  { id: "1", title: "Events Pro Named Top Event Company", publication: "Event Industry News", date: "Jun 15, 2024", type: "Feature" },
  { id: "2", title: "Innovative Approach to Virtual Events", publication: "Tech Today", date: "May 28, 2024", type: "Interview" },
  { id: "3", title: "Sustainability in Event Planning", publication: "Green Business", date: "Apr 10, 2024", type: "Article" },
];

export default function ShowcasePressPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Press</h1><p className="text-muted-foreground">Media coverage and mentions</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" />Press Coverage</CardTitle><CardDescription>Recent media mentions</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pressItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{item.title}</h4><Badge variant="outline">{item.type}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{item.publication}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{item.date}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-2" />Read</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
