import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card className={cn("border-border overflow-hidden shadow-xl h-full relative group transition-all duration-500", className)}>
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br",
          trend?.isPositive ? "from-emerald-500/5 to-transparent" : "from-destructive/5 to-transparent"
        )} />

        <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-60 transition-opacity">
            {title}
          </CardTitle>
          <div className="p-2 rounded-xl bg-muted border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
            {Icon && <Icon className="h-4 w-4" />}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className={cn("text-3xl font-black tracking-tighter group-hover:scale-[1.02] origin-left transition-transform duration-500", valueClassName)}>{value}</div>
          {(description || trend) && (
            <div className="flex items-center gap-2 mt-4">
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg",
                    trend.isPositive
                      ? "bg-semantic-success/10 text-semantic-success border border-semantic-success/20 shadow-[0_0_8px_hsl(var(--semantic-success)/0.1)]"
                      : "bg-destructive/10 text-destructive border border-destructive/20 shadow-red-500/10"
                  )}
                >
                  {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </div>
              )}
              {description && (
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-0.5">
                  {description}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
