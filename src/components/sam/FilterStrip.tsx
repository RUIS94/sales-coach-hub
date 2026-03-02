import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterStripProps {
  timeRange: string;
  onTimeRangeChange: (v: string) => void;
  children?: React.ReactNode;
}

export function FilterStrip({ timeRange, onTimeRangeChange, children }: FilterStripProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-2 border-b border-border bg-card/50">
      <div className="flex rounded-md border border-border overflow-hidden">
        {['This week', 'This month', 'This quarter'].map((label) => (
          <Button
            key={label}
            variant="ghost"
            size="sm"
            onClick={() => onTimeRangeChange(label)}
            className={`rounded-none text-xs h-8 px-3 ${timeRange === label ? 'bg-accent text-foreground' : 'text-muted-foreground'}`}
          >
            {label}
          </Button>
        ))}
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-[160px] h-8 text-xs bg-transparent">
          <SelectValue placeholder="Team / AE" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All AEs</SelectItem>
          <SelectItem value="sarah">Sarah Chen</SelectItem>
          <SelectItem value="marcus">Marcus Johnson</SelectItem>
          <SelectItem value="alex">Alex Rivera</SelectItem>
          <SelectItem value="priya">Priya Patel</SelectItem>
        </SelectContent>
      </Select>
      {children}
    </div>
  );
}
