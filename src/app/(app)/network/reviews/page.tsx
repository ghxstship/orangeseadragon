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
  Search,
  Star,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";

interface Review {
  id: string;
  title: string;
  rating: number;
  content: string;
  author: string;
  date: string;
  helpful: number;
  verified: boolean;
  response?: string;
}

const reviews: Review[] = [
  {
    id: "1",
    title: "Excellent event management platform",
    rating: 5,
    content: "This platform has transformed how we manage our events. The workflow automation is incredible.",
    author: "Sarah Chen",
    date: "2024-06-10",
    helpful: 45,
    verified: true,
    response: "Thank you for your kind words! We are glad the platform is helping your team.",
  },
  {
    id: "2",
    title: "Great features, minor learning curve",
    rating: 4,
    content: "Lots of powerful features. Took some time to learn but worth it.",
    author: "Mike Johnson",
    date: "2024-06-08",
    helpful: 23,
    verified: true,
  },
  {
    id: "3",
    title: "Good but could use improvements",
    rating: 3,
    content: "Solid platform overall. Would love to see better mobile support.",
    author: "Emily Watson",
    date: "2024-06-05",
    helpful: 12,
    verified: false,
  },
  {
    id: "4",
    title: "Best in class for event planning",
    rating: 5,
    content: "We have tried many platforms and this is by far the best for our needs.",
    author: "David Park",
    date: "2024-06-01",
    helpful: 67,
    verified: true,
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const verifiedCount = reviews.filter((r) => r.verified).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">
            Customer reviews and ratings
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{avgRating}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5-Star Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{fiveStarCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{verifiedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search reviews..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            All Reviews
          </CardTitle>
          <CardDescription>Customer feedback and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.verified && (
                        <Badge className="bg-green-500 text-white">Verified</Badge>
                      )}
                    </div>
                    <h4 className="font-medium mt-2">{review.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{review.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>By {review.author}</span>
                      <span>{formatDate(review.date)}</span>
                    </div>

                    {review.response && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium">Response from team:</p>
                        <p className="text-sm text-muted-foreground mt-1">{review.response}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {review.helpful}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
