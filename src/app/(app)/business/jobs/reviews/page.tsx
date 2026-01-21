"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Review {
  id: string;
  employee: string;
  type: string;
  due_date: string;
  status: string;
  last_review: string;
}

export default function JobsReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/v1/business/jobs/reviews");
        if (response.ok) {
          const result = await response.json();
          setReviews(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Performance Reviews</h1><p className="text-muted-foreground">Employee performance reviews</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Upcoming Reviews</CardTitle><CardDescription>Scheduled performance reviews</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{review.employee}</h4><Badge variant="outline">{review.type}</Badge><Badge variant={review.status === "in_progress" ? "default" : "secondary"}>{review.status.replace("_", " ")}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due: {review.due_date}</span>
                    <span>Last: {review.last_review}</span>
                  </div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>Start Review</DropdownMenuItem><DropdownMenuItem>Reschedule</DropdownMenuItem><DropdownMenuItem>View History</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
