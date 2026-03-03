import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  trendPositive?: boolean;
}

export function KPICard({ label, value, trend, trendLabel, trendPositive }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trendPositive
    ? 'text-status-green'
    : trend === 'flat'
      ? 'text-muted-foreground'
      : 'text-status-red';

  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 min-h-[96px] transition-colors transition-transform duration-150 hover:shadow-sm hover:-translate-y-0.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
