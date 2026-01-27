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
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Loader2,
} from "lucide-react";

interface WeatherForecast {
  date: string;
  condition: "sunny" | "partly_cloudy" | "cloudy" | "rain" | "storm";
  temp_high: number;
  temp_low: number;
  precipitation: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
}

interface EventWeather {
  id: string;
  event_name: string;
  venue: string;
  event_date: string;
  is_outdoor: boolean;
  forecast: WeatherForecast[];
  alerts: string[];
}

const conditionConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  sunny: { label: "Sunny", icon: Sun, color: "text-yellow-500" },
  partly_cloudy: { label: "Partly Cloudy", icon: Cloud, color: "text-blue-400" },
  cloudy: { label: "Cloudy", icon: Cloud, color: "text-gray-500" },
  rain: { label: "Rain", icon: CloudRain, color: "text-blue-600" },
  storm: { label: "Storm", icon: CloudRain, color: "text-purple-600" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WeatherPage() {
  const [eventWeatherData, setEventWeatherData] = React.useState<EventWeather[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWeatherData() {
      try {
        const response = await fetch("/api/v1/weather");
        if (response.ok) {
          const result = await response.json();
          setEventWeatherData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeatherData();
  }, []);

  const outdoorEvents = eventWeatherData.filter((e) => e.is_outdoor).length;
  const alertCount = eventWeatherData.reduce((acc, e) => acc + (e.alerts?.length || 0), 0);

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weather</h1>
          <p className="text-muted-foreground">
            Weather forecasts for upcoming events
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Forecasts
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tracked Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventWeatherData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outdoor Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{outdoorEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{alertCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {eventWeatherData.map((event) => (
          <Card key={event.id} className={(event.alerts?.length || 0) > 0 ? "border-orange-500" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {event.event_name}
                    {event.is_outdoor ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Outdoor
                      </Badge>
                    ) : (
                      <Badge variant="outline">Indoor</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {event.venue}
                  </CardDescription>
                </div>
                {(event.alerts?.length || 0) > 0 && (
                  <Badge className="bg-orange-500 text-white">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {event.alerts.length} Alert{event.alerts.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(event.alerts?.length || 0) > 0 && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  {event.alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-orange-700">
                      <AlertTriangle className="h-4 w-4" />
                      {alert}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                {(event.forecast || []).map((day) => {
                  const condition = conditionConfig[day.condition] || conditionConfig.cloudy;
                  const ConditionIcon = condition.icon;
                  const isEventDay = day.date === event.event_date;

                  return (
                    <Card key={day.date} className={isEventDay ? "ring-2 ring-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{formatDate(day.date)}</p>
                            {isEventDay && (
                              <Badge className="bg-primary text-primary-foreground text-xs mt-1">
                                Event Day
                              </Badge>
                            )}
                          </div>
                          <ConditionIcon className={`h-8 w-8 ${condition.color}`} />
                        </div>

                        <p className={`text-sm ${condition.color}`}>{condition.label}</p>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Thermometer className="h-4 w-4" />
                              Temp
                            </span>
                            <span className="font-medium">
                              {day.temp_high}° / {day.temp_low}°F
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CloudRain className="h-4 w-4" />
                              Precip
                            </span>
                            <span className={`font-medium ${day.precipitation > 50 ? "text-blue-600" : ""}`}>
                              {day.precipitation}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Droplets className="h-4 w-4" />
                              Humidity
                            </span>
                            <span className="font-medium">{day.humidity}%</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Wind className="h-4 w-4" />
                              Wind
                            </span>
                            <span className={`font-medium ${(day.wind_speed || 0) > 20 ? "text-orange-600" : ""}`}>
                              {day.wind_speed} mph {day.wind_direction}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
