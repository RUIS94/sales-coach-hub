import { Pin } from "lucide-react";
import { type Deal, formatCurrency } from "@/data/mock";
import { RiskChipSet } from "./RiskChip";
import { Button } from "@/components/ui/button";

interface DealRowProps {
  deal: Deal;
  selected?: boolean;
  onClick?: () => void;
  onPin?: () => void;
  compact?: boolean;
}

export function DealRow({ deal, selected, onClick, onPin, compact }: DealRowProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex flex-col gap-1 border-b border-border px-4 py-3 cursor-pointer transition-colors
        ${selected ? 'bg-primary/15 border-l-2 border-l-primary' : 'hover:bg-primary/10'}
        ${compact ? 'py-2' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{deal.account_name}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-secondary-foreground truncate">{deal.deal_name}</span>
        </div>
        <span className="text-sm font-semibold text-foreground ml-2 whitespace-nowrap">{formatCurrency(deal.amount)}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{deal.owner_name}</span>
          <span>{deal.stage_name}</span>
          <span>{deal.close_date}</span>
        </div>
        {onPin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            className="opacity-0 group-hover:opacity-100 h-6 px-2 text-xs text-muted-foreground hover:bg-transparent hover:text-[#FF8E1C]"
          >
            <Pin className="h-3 w-3 mr-1" />
            Add to 1:1
          </Button>
        )}
      </div>
      {deal.risk_reasons.length > 0 && (
        <div className="mt-1">
          <RiskChipSet risks={deal.risk_reasons} />
        </div>
      )}
    </div>
  );
}
