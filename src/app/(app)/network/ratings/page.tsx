"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface RatingCategory {
  name: string;
  rating: number;
  reviews: number;
  trend: "up" | "down" | "stable";
}

const ratingCategories: RatingCategory[] = [
  { name: "Overall Experience", rating: 4.7, reviews: 1250, trend: "up" },
  { name: "Customer Service", rating: 4.8, reviews: 890, trend: "up" },
  { name: "Value for Money", rating: 4.3, reviews: 756, trend: "stable" },
  { name: "Ease of Use", rating: 4.5, reviews: 1100, trend: "up" },
  { name: "Features", rating: 4.6, reviews: 945, trend: "down" },
];

const ratingDistribution = [
  { stars: 5, count: 650, percentage: 52 },
  { stars: 4, count: 375, percentage: 30 },
  { stars: 3, count: 150, percentage: 12 },
  { stars: 2, count: 50, percentage: 4 },
  { stars: 1, count: 25, percentage: 2 },
];

export default function RatingsPage() {
  const totalReviews = ratingDistribution.reduce((acc, r) => acc + r.count, 0);
  const avgRating = (ratingCategories.reduce((acc, c) => acc + c.rating, 0) / ratingCategories.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ratings</h1>
          <p className="text-muted-foreground">
            Rating analytics and breakdown
          </p>
        </div>
        <Badge className="bg-green-500 text-white">
          <TrendingUp className="mr-1 h-3 w-3" />
          Improving
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-bold">{avgRating}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5-Star Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{ratingDistribution[0].percentage}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">72</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown by star rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map((rating) => (
                <div key={rating.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="font-medium">{rating.stars}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <Progress value={rating.percentage} className="flex-1 h-3" />
                  <div className="w-20 text-right text-sm text-muted-foreground">
                    {rating.count} ({rating.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Categories</CardTitle>
            <CardDescription>Ratings by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratingCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {category.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : category.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{category.reviews} reviews</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl font-bold">{category.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
