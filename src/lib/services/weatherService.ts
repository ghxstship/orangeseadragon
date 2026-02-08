/**
 * Weather Integration Service
 * 
 * Provides weather data and automated alerts for outdoor events.
 * Integrates with weather APIs and triggers notifications based on thresholds.
 */

import { notificationService } from '../notifications/notificationService';

export interface WeatherData {
  timestamp: string;
  temperature: number;
  temperature_unit: 'C' | 'F';
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  wind_gust?: number;
  precipitation: number;
  precipitation_probability: number;
  uv_index: number;
  visibility: number;
  pressure: number;
  conditions: string;
  icon: string;
}

export interface WeatherForecast {
  hourly: WeatherData[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  conditions: string;
  precipitation_probability: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  event: string;
  headline: string;
  description: string;
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
  start: string;
  end: string;
  source: string;
}

export interface WeatherThreshold {
  id: string;
  name: string;
  condition: 'temperature' | 'wind_speed' | 'wind_gust' | 'precipitation' | 'uv_index' | 'visibility' | 'humidity';
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  value: number;
  severity: 'info' | 'warning' | 'critical';
  action: 'notify' | 'escalate' | 'pause_outdoor';
  message_template: string;
  is_active: boolean;
}

export interface EventWeatherConfig {
  event_id: string;
  venue_id: string;
  location: { lat: number; lng: number };
  is_outdoor: boolean;
  thresholds: WeatherThreshold[];
  check_interval_minutes: number;
  notify_roles: string[];
}

const DEFAULT_THRESHOLDS: WeatherThreshold[] = [
  {
    id: 'wind-high',
    name: 'High Wind Warning',
    condition: 'wind_speed',
    operator: 'gte',
    value: 40,
    severity: 'warning',
    action: 'notify',
    message_template: 'Wind speeds reaching {value} mph. Consider securing loose equipment.',
    is_active: true,
  },
  {
    id: 'wind-critical',
    name: 'Dangerous Wind',
    condition: 'wind_speed',
    operator: 'gte',
    value: 55,
    severity: 'critical',
    action: 'escalate',
    message_template: 'CRITICAL: Wind speeds at {value} mph. Evaluate outdoor operations.',
    is_active: true,
  },
  {
    id: 'temp-high',
    name: 'Extreme Heat',
    condition: 'temperature',
    operator: 'gte',
    value: 95,
    severity: 'warning',
    action: 'notify',
    message_template: 'Temperature reaching {value}°F. Ensure hydration stations are stocked.',
    is_active: true,
  },
  {
    id: 'rain-likely',
    name: 'Rain Likely',
    condition: 'precipitation',
    operator: 'gte',
    value: 70,
    severity: 'info',
    action: 'notify',
    message_template: '{value}% chance of precipitation. Prepare rain contingencies.',
    is_active: true,
  },
  {
    id: 'lightning',
    name: 'Lightning Risk',
    condition: 'visibility',
    operator: 'lte',
    value: 1,
    severity: 'critical',
    action: 'pause_outdoor',
    message_template: 'Severe weather conditions. Consider pausing outdoor activities.',
    is_active: true,
  },
  {
    id: 'uv-extreme',
    name: 'Extreme UV',
    condition: 'uv_index',
    operator: 'gte',
    value: 11,
    severity: 'warning',
    action: 'notify',
    message_template: 'UV Index at {value}. Advise sun protection for outdoor staff and guests.',
    is_active: true,
  },
];

class WeatherService {
  private static instance: WeatherService;
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastWeatherData: Map<string, WeatherData> = new Map();
  private triggeredAlerts: Set<string> = new Set();

  private constructor() {}

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Fetch current weather for a location
   */
  async getCurrentWeather(_lat: number, _lng: number): Promise<WeatherData> {
    // In production, this would call a weather API like OpenWeatherMap, WeatherAPI, etc.
    // Parameters _lat and _lng would be used in the API call
    // For now, return mock data
    const mockWeather: WeatherData = {
      timestamp: new Date().toISOString(),
      temperature: 78,
      temperature_unit: 'F',
      feels_like: 82,
      humidity: 65,
      wind_speed: 12,
      wind_direction: 'SW',
      wind_gust: 18,
      precipitation: 20,
      precipitation_probability: 20,
      uv_index: 7,
      visibility: 10,
      pressure: 1015,
      conditions: 'Partly Cloudy',
      icon: 'partly-cloudy',
    };

    return mockWeather;
  }

  /**
   * Fetch weather forecast for a location
   */
  async getForecast(lat: number, lng: number, days: number = 7): Promise<WeatherForecast> {
    const current = await this.getCurrentWeather(lat, lng);
    
    // Generate mock hourly forecast
    const hourly: WeatherData[] = [];
    for (let i = 0; i < 24; i++) {
      const hour = new Date();
      hour.setHours(hour.getHours() + i);
      hourly.push({
        ...current,
        timestamp: hour.toISOString(),
        temperature: current.temperature + Math.sin(i / 4) * 10,
        precipitation_probability: Math.max(0, Math.min(100, current.precipitation_probability + (Math.random() - 0.5) * 30)),
      });
    }

    // Generate mock daily forecast
    const daily: DailyForecast[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      daily.push({
        date: date.toISOString().split('T')[0],
        high: current.temperature + 5 + Math.random() * 10,
        low: current.temperature - 10 + Math.random() * 5,
        conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Scattered Showers'][Math.floor(Math.random() * 4)],
        precipitation_probability: Math.floor(Math.random() * 50),
        sunrise: '06:30',
        sunset: '20:15',
      });
    }

    return {
      hourly,
      daily,
      alerts: [],
    };
  }

  /**
   * Start monitoring weather for an event
   */
  startMonitoring(config: EventWeatherConfig): void {
    const key = config.event_id;
    
    // Clear existing interval if any
    this.stopMonitoring(config.event_id);

    // Initial check
    this.checkWeather(config);

    // Set up recurring checks
    const interval = setInterval(
      () => this.checkWeather(config),
      config.check_interval_minutes * 60 * 1000
    );

    this.checkIntervals.set(key, interval);
  }

  /**
   * Stop monitoring weather for an event
   */
  stopMonitoring(eventId: string): void {
    const interval = this.checkIntervals.get(eventId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(eventId);
    }
  }

  /**
   * Check weather and evaluate thresholds
   */
  private async checkWeather(config: EventWeatherConfig): Promise<void> {
    try {
      const weather = await this.getCurrentWeather(
        config.location.lat,
        config.location.lng
      );

      this.lastWeatherData.set(config.event_id, weather);

      // Evaluate thresholds
      const thresholds = config.thresholds.length > 0 
        ? config.thresholds 
        : DEFAULT_THRESHOLDS;

      for (const threshold of thresholds) {
        if (!threshold.is_active) continue;

        const triggered = this.evaluateThreshold(weather, threshold);
        const alertKey = `${config.event_id}-${threshold.id}`;

        if (triggered && !this.triggeredAlerts.has(alertKey)) {
          // New alert triggered
          this.triggeredAlerts.add(alertKey);
          await this.handleThresholdTriggered(config, weather, threshold);
        } else if (!triggered && this.triggeredAlerts.has(alertKey)) {
          // Alert cleared
          this.triggeredAlerts.delete(alertKey);
          await this.handleThresholdCleared(config, threshold);
        }
      }
    } catch (error) {
      console.error('Weather check failed:', error);
    }
  }

  /**
   * Evaluate if a threshold is triggered
   */
  private evaluateThreshold(weather: WeatherData, threshold: WeatherThreshold): boolean {
    const value = this.getWeatherValue(weather, threshold.condition);
    if (value === null) return false;

    switch (threshold.operator) {
      case 'gt': return value > threshold.value;
      case 'lt': return value < threshold.value;
      case 'gte': return value >= threshold.value;
      case 'lte': return value <= threshold.value;
      case 'eq': return value === threshold.value;
      default: return false;
    }
  }

  /**
   * Get weather value for a condition
   */
  private getWeatherValue(weather: WeatherData, condition: string): number | null {
    switch (condition) {
      case 'temperature': return weather.temperature;
      case 'wind_speed': return weather.wind_speed;
      case 'wind_gust': return weather.wind_gust ?? weather.wind_speed;
      case 'precipitation': return weather.precipitation_probability;
      case 'uv_index': return weather.uv_index;
      case 'visibility': return weather.visibility;
      case 'humidity': return weather.humidity;
      default: return null;
    }
  }

  /**
   * Handle threshold triggered
   */
  private async handleThresholdTriggered(
    config: EventWeatherConfig,
    weather: WeatherData,
    threshold: WeatherThreshold
  ): Promise<void> {
    const value = this.getWeatherValue(weather, threshold.condition);
    const message = threshold.message_template.replace('{value}', String(value));

    // Send notification
    await notificationService.show({
      id: `weather-${config.event_id}-${threshold.id}`,
      type: threshold.severity === 'critical' ? 'incident_critical' : 'schedule_change',
      title: `🌤️ Weather Alert: ${threshold.name}`,
      body: message,
      requireInteraction: threshold.severity === 'critical',
      data: {
        url: `/operations/weather/${config.event_id}`,
        eventId: config.event_id,
        thresholdId: threshold.id,
      },
    });

    // Log the alert
    console.log(`Weather alert triggered: ${threshold.name} for event ${config.event_id}`);
  }

  /**
   * Handle threshold cleared
   */
  private async handleThresholdCleared(
    config: EventWeatherConfig,
    threshold: WeatherThreshold
  ): Promise<void> {
    await notificationService.show({
      id: `weather-clear-${config.event_id}-${threshold.id}`,
      type: 'schedule_change',
      title: `✅ Weather Alert Cleared: ${threshold.name}`,
      body: `Conditions have returned to normal.`,
      data: {
        url: `/operations/weather/${config.event_id}`,
        eventId: config.event_id,
      },
    });
  }

  /**
   * Get last known weather for an event
   */
  getLastWeather(eventId: string): WeatherData | null {
    return this.lastWeatherData.get(eventId) ?? null;
  }

  /**
   * Get active monitoring count
   */
  getActiveMonitoringCount(): number {
    return this.checkIntervals.size;
  }

  /**
   * Get triggered alerts for an event
   */
  getTriggeredAlerts(eventId: string): string[] {
    return Array.from(this.triggeredAlerts)
      .filter((key) => key.startsWith(`${eventId}-`))
      .map((key) => key.replace(`${eventId}-`, ''));
  }

  /**
   * Format weather for display
   */
  formatWeatherSummary(weather: WeatherData): string {
    return `${weather.temperature}°${weather.temperature_unit} ${weather.conditions} | Wind: ${weather.wind_speed} mph ${weather.wind_direction} | Humidity: ${weather.humidity}%`;
  }
}

export const weatherService = WeatherService.getInstance();
export default weatherService;
