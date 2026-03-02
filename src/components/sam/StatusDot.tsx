import type { RiskLevel } from "@/data/mock";

export function StatusDot({ level }: { level: RiskLevel }) {
  const color = level === 'RED' ? 'bg-status-red' : level === 'AMBER' ? 'bg-status-amber' : 'bg-status-green';
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function ForecastBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    COMMIT: 'bg-status-green-bg text-status-green',
    BEST_CASE: 'bg-status-amber-bg text-status-amber',
    PIPELINE: 'bg-muted text-muted-foreground',
    OMIT: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[category] || styles.PIPELINE}`}>
      {category.replace('_', ' ')}
    </span>
  );
}
