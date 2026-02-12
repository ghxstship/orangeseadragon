'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CashFlowChart } from './components/CashFlowChart';
import { FinancialHealthCard } from './components/FinancialHealthCard';
import { ActionCenter } from './components/ActionCenter';
import {
  ChevronRight,
  RefreshCw,
  Receipt,
  FileText,
  CreditCard,
  Wallet,
  PiggyBank,
  BarChart3,
  ShoppingCart,
  Banknote,
  Calculator,
} from 'lucide-react';

interface NavCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

function NavCard({ href, icon: Icon, title, description }: NavCardProps) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer hover:bg-accent/50 transition-all border-border h-full">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function FinancePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
            <p className="text-muted-foreground">Financial overview and operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => router.push('/finance/invoices')}>
              <FileText className="h-4 w-4 mr-2" />
              Invoices
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Financial Health + Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FinancialHealthCard />
          <ActionCenter />
        </div>

        {/* Cash Flow Chart */}
        <CashFlowChart />

        {/* Quick Access */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Quick Access</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <NavCard href="/finance/invoices" icon={FileText} title="Invoices" description="Create and manage invoices" />
            <NavCard href="/finance/expenses" icon={Receipt} title="Expenses" description="Track and categorize expenses" />
            <NavCard href="/finance/budgets" icon={PiggyBank} title="Budgets" description="Budget planning and tracking" />
            <NavCard href="/finance/payments" icon={CreditCard} title="Payments" description="Payment processing and history" />
            <NavCard href="/finance/payroll" icon={Banknote} title="Payroll" description="Payroll runs and history" />
            <NavCard href="/finance/quotes" icon={Calculator} title="Quotes" description="Estimates and proposals" />
            <NavCard href="/finance/procurement" icon={ShoppingCart} title="Procurement" description="Purchase orders and vendors" />
            <NavCard href="/finance/banking" icon={Wallet} title="Banking" description="Bank accounts and reconciliation" />
            <NavCard href="/finance/reports" icon={BarChart3} title="Reports" description="Financial reports and analytics" />
          </div>
        </div>
      </div>
    </div>
  );
}
