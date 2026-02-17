/**
 * Predictive Budget Forecasting Service
 * Statistical forecasting engine for production budgets, revenue, and resource utilization.
 * Uses exponential smoothing, linear regression, and seasonal decomposition.
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface ForecastPoint extends TimeSeriesPoint {
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export interface ForecastResult {
  metric: string;
  historical: TimeSeriesPoint[];
  forecast: ForecastPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  trend_pct: number;
  seasonality_detected: boolean;
  model_accuracy: number;
  summary: string;
}

export interface BudgetForecast {
  project_id: string;
  project_name: string;
  budget_total: number;
  spent_to_date: number;
  committed: number;
  forecast_at_completion: number;
  variance: number;
  variance_pct: number;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  burn_rate_daily: number;
  days_remaining: number;
  projected_overrun: number;
  recommendations: string[];
  category_forecasts: CategoryForecast[];
}

export interface CategoryForecast {
  category: string;
  budgeted: number;
  actual: number;
  forecast: number;
  variance_pct: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface RevenueForecast {
  period: string;
  forecast: number;
  lower_bound: number;
  upper_bound: number;
  pipeline_weighted: number;
  confidence: number;
}

// ── Statistical Helpers ──────────────────────────────────────────────────

function linearRegression(points: TimeSeriesPoint[]): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.value || 0, r2: 0 };

  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.value);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const meanY = sumY / n;
  const ssRes = ys.reduce((a, y, i) => a + Math.pow(y - (slope * xs[i] + intercept), 2), 0);
  const ssTot = ys.reduce((a, y) => a + Math.pow(y - meanY, 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2: Math.max(0, r2) };
}

function exponentialSmoothing(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return [];
  const smoothed = [values[0]];
  for (let i = 1; i < values.length; i++) {
    smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

function detectSeasonality(values: number[], period: number = 7): boolean {
  if (values.length < period * 2) return false;

  // Simple autocorrelation at the given period
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n - period; i++) {
    numerator += (values[i] - mean) * (values[i + period] - mean);
  }
  for (let i = 0; i < n; i++) {
    denominator += Math.pow(values[i] - mean, 2);
  }

  const autocorrelation = denominator === 0 ? 0 : numerator / denominator;
  return autocorrelation > 0.3;
}

function standardDeviation(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / (n - 1);
  return Math.sqrt(variance);
}

// ── Forecast Generators ──────────────────────────────────────────────────

export function forecastTimeSeries(
  historical: TimeSeriesPoint[],
  periodsAhead: number,
  metric: string
): ForecastResult {
  if (historical.length < 3) {
    return {
      metric,
      historical,
      forecast: [],
      trend: 'stable',
      trend_pct: 0,
      seasonality_detected: false,
      model_accuracy: 0,
      summary: 'Insufficient data for forecasting (minimum 3 data points required).',
    };
  }

  const values = historical.map((p) => p.value);
  const { slope, intercept, r2 } = linearRegression(historical);
  const smoothed = exponentialSmoothing(values);
  const hasSeason = detectSeasonality(values);
  const stdDev = standardDeviation(values);

  // Determine trend
  const trendPct = values[0] !== 0 ? ((slope * values.length) / values[0]) * 100 : 0;
  const trend: ForecastResult['trend'] =
    trendPct > 5 ? 'increasing' : trendPct < -5 ? 'decreasing' : 'stable';

  // Generate forecast points
  const lastDate = new Date(historical[historical.length - 1].date);
  const forecast: ForecastPoint[] = [];

  for (let i = 1; i <= periodsAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i * 7); // Weekly periods

    const linearValue = slope * (values.length + i - 1) + intercept;
    const smoothedLast = smoothed[smoothed.length - 1];
    const blendedValue = 0.6 * linearValue + 0.4 * smoothedLast;

    // Widen confidence interval further into the future
    const uncertaintyMultiplier = 1 + (i * 0.15);
    const interval = stdDev * 1.96 * uncertaintyMultiplier;
    const confidence = Math.max(0.5, Math.min(0.95, r2 - (i * 0.05)));

    forecast.push({
      date: futureDate.toISOString().split('T')[0],
      value: Math.round(blendedValue * 100) / 100,
      lower_bound: Math.round((blendedValue - interval) * 100) / 100,
      upper_bound: Math.round((blendedValue + interval) * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
    });
  }

  const accuracy = Math.round(r2 * 100);
  const trendDir = trend === 'increasing' ? 'upward' : trend === 'decreasing' ? 'downward' : 'stable';

  return {
    metric,
    historical,
    forecast,
    trend,
    trend_pct: Math.round(trendPct * 10) / 10,
    seasonality_detected: hasSeason,
    model_accuracy: accuracy,
    summary: `${metric} shows a ${trendDir} trend (${trendPct > 0 ? '+' : ''}${Math.round(trendPct)}%). Model accuracy: ${accuracy}%.${hasSeason ? ' Seasonal patterns detected.' : ''}`,
  };
}

export function forecastBudget(
  projectName: string,
  projectId: string,
  budgetTotal: number,
  spentToDate: number,
  committed: number,
  daysElapsed: number,
  daysTotal: number,
  categoryData: { category: string; budgeted: number; actual: number }[]
): BudgetForecast {
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);
  const burnRateDaily = daysElapsed > 0 ? spentToDate / daysElapsed : 0;
  const forecastAtCompletion = spentToDate + committed + (burnRateDaily * daysRemaining * 0.8);
  const variance = budgetTotal - forecastAtCompletion;
  const variancePct = budgetTotal > 0 ? (variance / budgetTotal) * 100 : 0;

  // Risk level
  let riskLevel: BudgetForecast['risk_level'] = 'low';
  if (variancePct < -15) riskLevel = 'critical';
  else if (variancePct < -5) riskLevel = 'high';
  else if (variancePct < 0) riskLevel = 'medium';

  // Category forecasts
  const categoryForecasts: CategoryForecast[] = categoryData.map((cat) => {
    const catPct = cat.budgeted > 0 ? ((cat.actual / cat.budgeted) * 100) : 0;
    const progressPct = daysTotal > 0 ? (daysElapsed / daysTotal) * 100 : 0;
    const catForecast = daysElapsed > 0 ? (cat.actual / daysElapsed) * daysTotal : cat.budgeted;

    return {
      category: cat.category,
      budgeted: cat.budgeted,
      actual: cat.actual,
      forecast: Math.round(catForecast),
      variance_pct: Math.round((catForecast / cat.budgeted - 1) * 100 * 10) / 10,
      trend: catPct > progressPct + 10 ? 'increasing' as const : catPct < progressPct - 10 ? 'decreasing' as const : 'stable' as const,
    };
  });

  // Recommendations
  const recommendations: string[] = [];
  if (riskLevel === 'critical') {
    recommendations.push('Immediate budget review required — projected to exceed budget by more than 15%');
  }
  if (riskLevel === 'high') {
    recommendations.push('Schedule budget review meeting — spending is trending above forecast');
  }

  const overCategories = categoryForecasts.filter((c) => c.variance_pct > 10);
  if (overCategories.length > 0) {
    recommendations.push(`Review spending in: ${overCategories.map((c) => c.category).join(', ')}`);
  }

  const underCategories = categoryForecasts.filter((c) => c.variance_pct < -20);
  if (underCategories.length > 0) {
    recommendations.push(`Consider reallocating surplus from: ${underCategories.map((c) => c.category).join(', ')}`);
  }

  if (burnRateDaily > (budgetTotal / daysTotal) * 1.2) {
    recommendations.push('Daily burn rate exceeds sustainable level — implement cost controls');
  }

  if (recommendations.length === 0) {
    recommendations.push('Budget is on track — continue monitoring weekly');
  }

  return {
    project_id: projectId,
    project_name: projectName,
    budget_total: budgetTotal,
    spent_to_date: spentToDate,
    committed,
    forecast_at_completion: Math.round(forecastAtCompletion),
    variance: Math.round(variance),
    variance_pct: Math.round(variancePct * 10) / 10,
    confidence: Math.round(Math.max(0.6, 1 - Math.abs(variancePct) / 100) * 100) / 100,
    risk_level: riskLevel,
    burn_rate_daily: Math.round(burnRateDaily),
    days_remaining: daysRemaining,
    projected_overrun: Math.round(Math.max(0, -variance)),
    recommendations,
    category_forecasts: categoryForecasts,
  };
}

export function forecastRevenue(
  historicalRevenue: TimeSeriesPoint[],
  pipelineValue: number,
  winRate: number,
  periodsAhead: number = 4
): RevenueForecast[] {
  const result = forecastTimeSeries(historicalRevenue, periodsAhead, 'Revenue');
  const weightedPipeline = pipelineValue * winRate;

  return result.forecast.map((fp) => ({
    period: fp.date,
    forecast: Math.round(fp.value),
    lower_bound: Math.round(fp.lower_bound),
    upper_bound: Math.round(fp.upper_bound),
    pipeline_weighted: Math.round(weightedPipeline / periodsAhead),
    confidence: fp.confidence,
  }));
}
