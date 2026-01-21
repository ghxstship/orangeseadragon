"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";

interface Review {
  id: string;
  item: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

export default function MarketplaceReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/v1/network/marketplace/reviews");
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
      <div><h1 className="text-3xl font-bold tracking-tight">Reviews</h1><p className="text-muted-foreground">Reviews for your listings</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{reviews.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold flex items-center gap-1"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />4.7</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">5-Star Reviews</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{reviews.filter(r => r.rating === 5).length}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Recent Reviews</CardTitle><CardDescription>Customer feedback</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{review.item}</h4>
                  <div className="flex items-center gap-1">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                </div>
                <p className="text-sm mt-2">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">By {review.reviewer} on {review.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
