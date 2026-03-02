import { type RiskReason } from "@/data/mock";

interface RiskChipProps {
  risk: RiskReason;
  compact?: boolean;
}

export function RiskChip({ risk, compact }: RiskChipProps) {
  const colorClass = risk.severity === 'RED'
    ? 'bg-status-red-bg text-status-red'
    : 'bg-status-amber-bg text-status-amber';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass} ${compact ? 'text-[10px] px-1.5' : ''}`}>
      {risk.label}
    </span>
  );
}

interface RiskChipSetProps {
  risks: RiskReason[];
  max?: number;
}

export function RiskChipSet({ risks, max = 3 }: RiskChipSetProps) {
  const visible = risks.slice(0, max);
  const remaining = risks.length - max;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((r) => (
        <RiskChip key={r.code} risk={r} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          +{remaining}
        </span>
      )}
    </div>
  );
}
