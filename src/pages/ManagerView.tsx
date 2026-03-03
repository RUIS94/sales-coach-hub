import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Play, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sam/PageHeader";
import { FilterStrip } from "@/components/sam/FilterStrip";
import { KPICard } from "@/components/sam/KPICard";
import { DealRow } from "@/components/sam/DealRow";
import { StatusDot } from "@/components/sam/StatusDot";
import { mockDeals, mockAEReps, formatCurrency } from "@/data/mock";

export default function ManagerView() {
  const [timeRange, setTimeRange] = useState("This month");
  const navigate = useNavigate();
  const topDeals = mockDeals.slice(0, 6);
  const commitTotal = mockDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const bestCaseTotal = mockDeals.filter(d => d.forecast_category === 'BEST_CASE').reduce((s, d) => s + d.amount, 0);
  const slippageCount = mockDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
  const overdueCount = 5;

  return (
    <div className="flex flex-col">
      <PageHeader title="Manager View" subtitle="Forecast + Coaching overview">
        <Button size="sm" onClick={() => navigate('/session')}>
          <Play className="h-3.5 w-3.5 mr-1.5" />Start 1:1
        </Button>
        <Button variant="secondary" size="sm" onClick={() => navigate('/prep')}>
          <FileDown className="h-3.5 w-3.5 mr-1.5" />Generate Prep Pack
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PageHeader>

      <FilterStrip timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4">
        <KPICard label="Forecast Accuracy" value="73%" trend="up" trendLabel="+4% vs last month" trendPositive />
        <KPICard label="Commit" value={formatCurrency(commitTotal)} trend="down" trendLabel="-$120K this week" trendPositive={false} />
        <KPICard label="Best Case" value={formatCurrency(bestCaseTotal)} trend="up" trendLabel="+$85K" trendPositive />
        <KPICard label="Slippage" value={String(slippageCount)} trend="flat" trendLabel="Same as last week" />
        <KPICard label="Overdue Actions" value={String(overdueCount)} trend="down" trendLabel="2 resolved" trendPositive />
      </div>

      {/* Attention Queue + AE Table */}
      <div className="grid grid-cols-2 gap-4 px-6 pb-4">
        {/* Attention Queue Preview */}
        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Attention Queue</h2>
              <p className="text-xs text-muted-foreground">Top deals needing action this week</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-transparent hover:text-[#FF8E1C]" onClick={() => navigate('/queue')}>
              View full queue →
            </Button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {topDeals.map((deal) => (
              <DealRow
                key={deal.deal_id}
                deal={deal}
                compact
                onClick={() => navigate('/queue')}
                onPin={() => {}}
              />
            ))}
          </div>
        </div>

        {/* AE Health Table */}
        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Team by AE</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-2 font-medium">AE</th>
                  <th className="text-right px-3 py-2 font-medium">Commit</th>
                  <th className="text-right px-3 py-2 font-medium">Slip</th>
                  <th className="text-right px-3 py-2 font-medium">Hygiene</th>
                  <th className="text-right px-3 py-2 font-medium">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {mockAEReps.map((rep) => (
                  <tr
                    key={rep.user_id}
                    className="border-b border-border last:border-0 hover:bg-primary/10 active:bg-primary/15 cursor-pointer transition-colors"
                    onClick={() => navigate('/prep')}
                  >
                    <td className="px-4 py-2.5 font-medium text-foreground">{rep.name}</td>
                    <td className="text-right px-3 py-2.5">{formatCurrency(rep.commit_amount)}</td>
                    <td className="text-right px-3 py-2.5">
                      <span className="flex items-center justify-end gap-1.5">
                        <StatusDot level={rep.slippage_count > 1 ? 'RED' : rep.slippage_count === 1 ? 'AMBER' : 'GREEN'} />
                        {rep.slippage_count}
                      </span>
                    </td>
                    <td className="text-right px-3 py-2.5">
                      <span className={rep.hygiene_score < 70 ? 'text-status-amber' : 'text-foreground'}>
                        {rep.hygiene_score}%
                      </span>
                    </td>
                    <td className="text-right px-3 py-2.5">
                      <span className={rep.overdue_actions > 0 ? 'text-status-red' : 'text-foreground'}>
                        {rep.overdue_actions}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Funnel + Dwell Time */}
      <div className="grid grid-cols-2 gap-4 px-6 pb-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Stage Conversion Funnel</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-transparent hover:text-[#FF8E1C]">View details</Button>
          </div>
          <div className="space-y-2">
            {[
              { stage: 'Discovery', count: 24, width: '100%' },
              { stage: 'Validation', count: 18, width: '75%' },
              { stage: 'Proposal', count: 12, width: '50%' },
              { stage: 'Negotiation', count: 8, width: '33%' },
              { stage: 'Closed Won', count: 5, width: '21%' },
            ].map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{s.stage}</span>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-primary/30 rounded" style={{ width: s.width }} />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Discovery → Validation conversion at 75%</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Dwell Time Heatmap</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-transparent hover:text-[#FF8E1C]">View details</Button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {['Discovery', 'Validation', 'Proposal', 'Negotiation', 'Close'].map((stage) => (
              <div key={stage} className="text-center">
                <span className="text-[10px] text-muted-foreground block mb-1">{stage}</span>
                {['Sarah', 'Marcus', 'Alex', 'Priya'].map((ae) => {
                  const days = Math.floor(Math.random() * 30) + 3;
                  const opacity = Math.min(days / 30, 1);
                  return (
                    <div
                      key={ae}
                      className="h-8 rounded-sm mb-0.5 flex items-center justify-center text-[10px] font-medium"
                      style={{
                        backgroundColor: `hsl(var(--primary) / ${opacity * 0.6})`,
                        color: opacity > 0.4 ? 'hsl(0 0% 100%)' : 'hsl(215 15% 50%)',
                      }}
                    >
                      {days}d
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="col-span-5 flex justify-end mt-1">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {['Sarah', 'Marcus', 'Alex', 'Priya'].map((ae) => (
                  <span key={ae} className="px-1">{ae}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Stage 3 dwell time highest for Priya</p>
        </div>
      </div>
    </div>
  );
}
