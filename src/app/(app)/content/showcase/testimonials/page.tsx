"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Star, Quote, Loader2 } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
  rating: number;
}

export default function ShowcaseTestimonialsPage() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch("/api/v1/content/showcase/testimonials");
        if (response.ok) {
          const result = await response.json();
          setTestimonials(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Testimonials</h1><p className="text-muted-foreground">What our clients say</p></div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader>
              <Quote className="h-8 w-8 text-muted-foreground mb-2" />
              <CardDescription className="text-base italic">&quot;{testimonial.quote}&quot;</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 mb-2">{Array.from({ length: testimonial.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="font-medium">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">{testimonial.company}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
