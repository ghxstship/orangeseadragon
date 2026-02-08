/**
 * Asset Depreciation Calculation Utility
 * Supports multiple depreciation methods for financial tracking
 */

export type DepreciationMethod = 
  | 'straight_line' 
  | 'declining_balance' 
  | 'sum_of_years' 
  | 'units_of_production';

export interface DepreciationParams {
  purchase_price: number;
  salvage_value: number;
  useful_life_months: number;
  purchase_date: Date | string;
  depreciation_method: DepreciationMethod;
  units_produced?: number;
  total_units_expected?: number;
}

export interface DepreciationResult {
  book_value: number;
  accumulated_depreciation: number;
  monthly_depreciation: number;
  annual_depreciation: number;
  depreciation_rate: number;
  months_elapsed: number;
  remaining_life_months: number;
  is_fully_depreciated: boolean;
}

export interface DepreciationScheduleEntry {
  period: number;
  period_label: string;
  beginning_value: number;
  depreciation_expense: number;
  accumulated_depreciation: number;
  ending_value: number;
}

/**
 * Calculate months elapsed since purchase
 */
export function getMonthsElapsed(purchaseDate: Date | string): number {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  
  const yearsDiff = now.getFullYear() - purchase.getFullYear();
  const monthsDiff = now.getMonth() - purchase.getMonth();
  
  return Math.max(0, yearsDiff * 12 + monthsDiff);
}

/**
 * Straight-line depreciation
 * Equal depreciation each period
 */
export function calculateStraightLine(params: DepreciationParams): DepreciationResult {
  const { purchase_price, salvage_value, useful_life_months, purchase_date } = params;
  
  const depreciableAmount = purchase_price - salvage_value;
  const monthlyDepreciation = depreciableAmount / useful_life_months;
  const monthsElapsed = getMonthsElapsed(purchase_date);
  const effectiveMonths = Math.min(monthsElapsed, useful_life_months);
  
  const accumulatedDepreciation = monthlyDepreciation * effectiveMonths;
  const bookValue = Math.max(salvage_value, purchase_price - accumulatedDepreciation);
  
  return {
    book_value: Math.round(bookValue * 100) / 100,
    accumulated_depreciation: Math.round(accumulatedDepreciation * 100) / 100,
    monthly_depreciation: Math.round(monthlyDepreciation * 100) / 100,
    annual_depreciation: Math.round(monthlyDepreciation * 12 * 100) / 100,
    depreciation_rate: useful_life_months > 0 ? 1 / (useful_life_months / 12) : 0,
    months_elapsed: monthsElapsed,
    remaining_life_months: Math.max(0, useful_life_months - monthsElapsed),
    is_fully_depreciated: monthsElapsed >= useful_life_months,
  };
}

/**
 * Declining balance depreciation
 * Higher depreciation in early years
 */
export function calculateDecliningBalance(
  params: DepreciationParams,
  rate: number = 2 // Double declining by default
): DepreciationResult {
  const { purchase_price, salvage_value, useful_life_months, purchase_date } = params;
  
  const usefulLifeYears = useful_life_months / 12;
  const depreciationRate = (rate / usefulLifeYears);
  const monthsElapsed = getMonthsElapsed(purchase_date);
  const yearsElapsed = monthsElapsed / 12;
  
  let bookValue = purchase_price;
  let accumulatedDepreciation = 0;
  
  // Calculate year by year
  for (let year = 0; year < Math.floor(yearsElapsed); year++) {
    const yearDepreciation = Math.min(
      bookValue * depreciationRate,
      bookValue - salvage_value
    );
    accumulatedDepreciation += yearDepreciation;
    bookValue -= yearDepreciation;
    
    if (bookValue <= salvage_value) break;
  }
  
  // Partial year
  const partialYear = yearsElapsed % 1;
  if (partialYear > 0 && bookValue > salvage_value) {
    const partialDepreciation = Math.min(
      bookValue * depreciationRate * partialYear,
      bookValue - salvage_value
    );
    accumulatedDepreciation += partialDepreciation;
    bookValue -= partialDepreciation;
  }
  
  bookValue = Math.max(salvage_value, bookValue);
  
  const currentMonthlyDepreciation = bookValue > salvage_value 
    ? (bookValue * depreciationRate) / 12 
    : 0;
  
  return {
    book_value: Math.round(bookValue * 100) / 100,
    accumulated_depreciation: Math.round(accumulatedDepreciation * 100) / 100,
    monthly_depreciation: Math.round(currentMonthlyDepreciation * 100) / 100,
    annual_depreciation: Math.round(currentMonthlyDepreciation * 12 * 100) / 100,
    depreciation_rate: depreciationRate,
    months_elapsed: monthsElapsed,
    remaining_life_months: Math.max(0, useful_life_months - monthsElapsed),
    is_fully_depreciated: bookValue <= salvage_value,
  };
}

/**
 * Sum of years' digits depreciation
 * Accelerated depreciation based on remaining life
 */
export function calculateSumOfYears(params: DepreciationParams): DepreciationResult {
  const { purchase_price, salvage_value, useful_life_months, purchase_date } = params;
  
  const usefulLifeYears = Math.ceil(useful_life_months / 12);
  const depreciableAmount = purchase_price - salvage_value;
  const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
  
  const monthsElapsed = getMonthsElapsed(purchase_date);
  const yearsElapsed = Math.floor(monthsElapsed / 12);
  
  let accumulatedDepreciation = 0;
  
  // Calculate completed years
  for (let year = 1; year <= Math.min(yearsElapsed, usefulLifeYears); year++) {
    const remainingLife = usefulLifeYears - year + 1;
    const yearDepreciation = depreciableAmount * (remainingLife / sumOfYears);
    accumulatedDepreciation += yearDepreciation;
  }
  
  // Partial year
  const partialMonths = monthsElapsed % 12;
  if (partialMonths > 0 && yearsElapsed < usefulLifeYears) {
    const currentYear = yearsElapsed + 1;
    const remainingLife = usefulLifeYears - currentYear + 1;
    const yearDepreciation = depreciableAmount * (remainingLife / sumOfYears);
    accumulatedDepreciation += yearDepreciation * (partialMonths / 12);
  }
  
  accumulatedDepreciation = Math.min(accumulatedDepreciation, depreciableAmount);
  const bookValue = Math.max(salvage_value, purchase_price - accumulatedDepreciation);
  
  // Current year depreciation rate
  const currentYear = Math.min(yearsElapsed + 1, usefulLifeYears);
  const currentRemainingLife = usefulLifeYears - currentYear + 1;
  const currentYearDepreciation = depreciableAmount * (currentRemainingLife / sumOfYears);
  
  return {
    book_value: Math.round(bookValue * 100) / 100,
    accumulated_depreciation: Math.round(accumulatedDepreciation * 100) / 100,
    monthly_depreciation: Math.round((currentYearDepreciation / 12) * 100) / 100,
    annual_depreciation: Math.round(currentYearDepreciation * 100) / 100,
    depreciation_rate: currentRemainingLife / sumOfYears,
    months_elapsed: monthsElapsed,
    remaining_life_months: Math.max(0, useful_life_months - monthsElapsed),
    is_fully_depreciated: accumulatedDepreciation >= depreciableAmount,
  };
}

/**
 * Units of production depreciation
 * Based on actual usage
 */
export function calculateUnitsOfProduction(params: DepreciationParams): DepreciationResult {
  const { 
    purchase_price, 
    salvage_value, 
    useful_life_months,
    purchase_date,
    units_produced = 0, 
    total_units_expected = 1 
  } = params;
  
  const depreciableAmount = purchase_price - salvage_value;
  const depreciationPerUnit = depreciableAmount / total_units_expected;
  const accumulatedDepreciation = Math.min(depreciationPerUnit * units_produced, depreciableAmount);
  const bookValue = Math.max(salvage_value, purchase_price - accumulatedDepreciation);
  
  const monthsElapsed = getMonthsElapsed(purchase_date);
  const unitsPerMonth = monthsElapsed > 0 ? units_produced / monthsElapsed : 0;
  const monthlyDepreciation = depreciationPerUnit * unitsPerMonth;
  
  return {
    book_value: Math.round(bookValue * 100) / 100,
    accumulated_depreciation: Math.round(accumulatedDepreciation * 100) / 100,
    monthly_depreciation: Math.round(monthlyDepreciation * 100) / 100,
    annual_depreciation: Math.round(monthlyDepreciation * 12 * 100) / 100,
    depreciation_rate: units_produced / total_units_expected,
    months_elapsed: monthsElapsed,
    remaining_life_months: Math.max(0, useful_life_months - monthsElapsed),
    is_fully_depreciated: units_produced >= total_units_expected,
  };
}

/**
 * Calculate depreciation based on method
 */
export function calculateDepreciation(params: DepreciationParams): DepreciationResult {
  switch (params.depreciation_method) {
    case 'straight_line':
      return calculateStraightLine(params);
    case 'declining_balance':
      return calculateDecliningBalance(params);
    case 'sum_of_years':
      return calculateSumOfYears(params);
    case 'units_of_production':
      return calculateUnitsOfProduction(params);
    default:
      return calculateStraightLine(params);
  }
}

/**
 * Generate depreciation schedule
 */
export function generateDepreciationSchedule(
  params: DepreciationParams,
  periodType: 'monthly' | 'annual' = 'annual'
): DepreciationScheduleEntry[] {
  const { purchase_price, salvage_value, useful_life_months, depreciation_method } = params;
  
  const schedule: DepreciationScheduleEntry[] = [];
  const periods = periodType === 'monthly' ? useful_life_months : Math.ceil(useful_life_months / 12);
  
  let beginningValue = purchase_price;
  let totalAccumulated = 0;
  
  for (let period = 1; period <= periods; period++) {
    // Create params for this period
    const periodParams: DepreciationParams = {
      ...params,
      purchase_date: new Date(
        new Date(params.purchase_date).getTime() + 
        (period - 1) * (periodType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
      ),
    };
    
    // Calculate depreciation for this period
    let periodDepreciation: number;
    
    if (depreciation_method === 'straight_line') {
      const result = calculateStraightLine(params);
      periodDepreciation = periodType === 'monthly' 
        ? result.monthly_depreciation 
        : result.annual_depreciation;
    } else if (depreciation_method === 'declining_balance') {
      periodDepreciation = beginningValue * (2 / (useful_life_months / 12));
      if (periodType === 'monthly') periodDepreciation /= 12;
    } else {
      const result = calculateDepreciation(periodParams);
      periodDepreciation = periodType === 'monthly' 
        ? result.monthly_depreciation 
        : result.annual_depreciation;
    }
    
    // Don't depreciate below salvage value
    periodDepreciation = Math.min(periodDepreciation, beginningValue - salvage_value);
    periodDepreciation = Math.max(0, periodDepreciation);
    
    totalAccumulated += periodDepreciation;
    const endingValue = beginningValue - periodDepreciation;
    
    schedule.push({
      period,
      period_label: periodType === 'monthly' ? `Month ${period}` : `Year ${period}`,
      beginning_value: Math.round(beginningValue * 100) / 100,
      depreciation_expense: Math.round(periodDepreciation * 100) / 100,
      accumulated_depreciation: Math.round(totalAccumulated * 100) / 100,
      ending_value: Math.round(endingValue * 100) / 100,
    });
    
    beginningValue = endingValue;
    
    if (beginningValue <= salvage_value) break;
  }
  
  return schedule;
}
