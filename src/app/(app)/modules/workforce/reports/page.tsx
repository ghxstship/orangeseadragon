'use client';

import { ReportsTemplate, ReportTab } from '@/components/templates/ReportsTemplate';

const workforceReportTabs: ReportTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    metrics: [
      { key: 'total-crew', label: 'Total Crew', value: '248', change: 8.5, changeLabel: 'vs last month' },
      { key: 'hours-worked', label: 'Hours Worked', value: '12,450', change: 12.3, changeLabel: 'vs last month' },
      { key: 'labor-cost', label: 'Labor Cost', value: '$186,750', change: 5.2, changeLabel: 'vs last month', format: 'currency' },
      { key: 'avg-rate', label: 'Avg Hourly Rate', value: '$15.00', format: 'currency' },
    ],
    charts: [
      { key: 'hours-trend', title: 'Hours Trend', description: 'Weekly hours worked', type: 'area' },
      { key: 'cost-breakdown', title: 'Cost Breakdown', description: 'Labor cost by department', type: 'pie' },
    ],
  },
  {
    key: 'labor-costs',
    label: 'Labor Costs',
    metrics: [
      { key: 'regular-hours', label: 'Regular Hours', value: '$142,500', format: 'currency' },
      { key: 'overtime', label: 'Overtime', value: '$28,350', format: 'currency' },
      { key: 'per-diem', label: 'Per Diem', value: '$12,400', format: 'currency' },
      { key: 'benefits', label: 'Benefits', value: '$3,500', format: 'currency' },
    ],
    charts: [
      { key: 'cost-by-event', title: 'Cost by Event', description: 'Labor cost per event', type: 'bar' },
    ],
  },
  {
    key: 'utilization',
    label: 'Utilization',
    metrics: [
      { key: 'utilization-rate', label: 'Utilization Rate', value: '82%', change: 4.5, format: 'percentage' },
      { key: 'available', label: 'Available Crew', value: '45' },
      { key: 'scheduled', label: 'Scheduled', value: '203' },
      { key: 'overtime-hours', label: 'Overtime Hours', value: '890' },
    ],
    charts: [
      { key: 'utilization-by-role', title: 'Utilization by Role', description: 'Crew utilization rates', type: 'bar' },
    ],
  },
  {
    key: 'certifications',
    label: 'Certifications',
    metrics: [
      { key: 'valid', label: 'Valid Certifications', value: '456' },
      { key: 'expiring-soon', label: 'Expiring Soon', value: '23', change: -12.0 },
      { key: 'expired', label: 'Expired', value: '8' },
      { key: 'compliance-rate', label: 'Compliance Rate', value: '94%', format: 'percentage' },
    ],
    charts: [
      { key: 'cert-by-type', title: 'Certifications by Type', description: 'Distribution of certifications', type: 'donut' },
    ],
  },
];

export default function WorkforceReportsPage() {
  return (
    <ReportsTemplate
      title="Workforce Reports"
      description="Generate workforce analytics and reports"
      tabs={workforceReportTabs}
      onExport={(format) => console.log('Exporting:', format)}
      onRefresh={() => console.log('Refreshing data')}
    />
  );
}
