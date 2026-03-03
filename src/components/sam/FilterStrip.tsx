import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterStripProps {
  timeRange: string;
  onTimeRangeChange: (v: string) => void;
  children?: React.ReactNode;
}

export function FilterStrip({ timeRange, onTimeRangeChange, children }: FilterStripProps) {
  const [frequency, setFrequency] = useState<"weekly" | "fortnightly">("weekly");
  return (
    <div className="grid grid-cols-[auto,1fr,1fr,auto] items-center gap-6 px-6 py-2 border-b border-border bg-card/50">
      {/* Container 1: Time range (left aligned) */}
      <div className="flex-shrink-0">
        <div className="inline-flex w-fit rounded-md border border-border overflow-hidden">
          {['This week', 'This month', 'This quarter'].map((label) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              onClick={() => onTimeRangeChange(label)}
              className={`rounded-none text-xs h-8 px-3 ${
                timeRange === label
                  ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                  : 'text-muted-foreground hover:bg-primary/60 hover:text-primary-foreground active:bg-primary active:text-primary-foreground'
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      {/* Container 2: Team / AE (center-left) */}
      <div className="w-full min-w-[260px] sm:min-w-[280px] md:min-w-[320px]">
        <Select defaultValue="all">
          <SelectTrigger className="w-full h-8 text-xs bg-transparent">
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
      </div>
      {/* Container 3: Segment / Region (center-right) */}
      <div className="w-full min-w-[260px] sm:min-w-[280px] md:min-w-[320px]">
        <Select defaultValue="all">
          <SelectTrigger className="w-full h-8 text-xs bg-transparent">
            <SelectValue placeholder="Segment / Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="smb">SMB</SelectItem>
            <SelectItem value="mid">Mid-Market</SelectItem>
            <SelectItem value="ent">Enterprise</SelectItem>
            <SelectItem value="amer">Americas</SelectItem>
            <SelectItem value="emea">EMEA</SelectItem>
            <SelectItem value="apac">APAC</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Container 4: Weekly vs Fortnightly (right aligned) */}
      <div className="flex-shrink-0">
        <div className="inline-flex w-fit rounded-md border border-border overflow-hidden">
          {[
            { key: 'weekly', label: 'Weekly' },
            { key: 'fortnightly', label: 'Fortnightly' },
          ].map((opt) => (
            <Button
              key={opt.key}
              variant="ghost"
              size="sm"
              onClick={() => setFrequency(opt.key as "weekly" | "fortnightly")}
              aria-pressed={frequency === opt.key}
              className={`rounded-none text-xs h-8 px-3 ${
                frequency === opt.key
                  ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                  : 'text-muted-foreground hover:bg-primary/60 hover:text-primary-foreground active:bg-primary active:text-primary-foreground'
              }`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
