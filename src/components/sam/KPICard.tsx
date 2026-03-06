import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  secondaryValue?: string;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  trendPositive?: boolean;
  onClick?: () => void;
}

export function KPICard({ label, value, secondaryValue, trend, trendLabel, trendPositive, onClick }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trendPositive
    ? 'text-status-green'
    : trend === 'flat'
      ? 'text-muted-foreground'
      : 'text-status-red';

  return (
    <div
      className={`flex flex-col justify-between rounded-lg border border-border bg-card p-4 min-h-[96px] transition-colors transition-transform duration-150 hover:shadow-sm hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' as const : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-baseline">
        <div className="relative inline-block pr-12">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
          {secondaryValue && (
            <span className="absolute right-0 bottom-0 text-xs leading-none text-muted-foreground">
              {secondaryValue}
            </span>
          )}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
