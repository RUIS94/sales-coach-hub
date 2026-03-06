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
  const [pinnedDealIds, setPinnedDealIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const topDeals = mockDeals.slice(0, 6);
  const cfg =
    timeRange === "This week"
      ? { curMax: 7, prevMin: 8, prevMax: 14, unit: "week", staleCur: 7, stalePrevMin: 8, stalePrevMax: 14 }
      : timeRange === "This quarter"
      ? { curMax: 90, prevMin: 91, prevMax: 180, unit: "quarter", staleCur: 90, stalePrevMin: 91, stalePrevMax: 180 }
      : { curMax: 30, prevMin: 31, prevMax: 60, unit: "month", staleCur: 30, stalePrevMin: 31, stalePrevMax: 60 };
  const currentWindowDeals = mockDeals.filter(d => d.staleness_days <= cfg.staleCur);
  const previousWindowDeals = mockDeals.filter(d => d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax);
  const commitCurrent = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const commitPrev = previousWindowDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const commitCountCurrent = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT').length;
  const bestCaseCurrent = currentWindowDeals.filter(d => d.forecast_category === 'BEST_CASE').reduce((s, d) => s + d.amount, 0);
  const bestCasePrev = previousWindowDeals.filter(d => d.forecast_category === 'BEST_CASE').reduce((s, d) => s + d.amount, 0);
  const slippageCurrent = currentWindowDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
  const slippagePrev = previousWindowDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
  const slippageAmountCurrent = currentWindowDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).reduce((s, d) => s + d.amount, 0);
  const slippageAmountPrev = previousWindowDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).reduce((s, d) => s + d.amount, 0);
  const newlyCommittedCurrent = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days <= cfg.staleCur).length;
  const newlyCommittedPrev = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax).length;
  const newlyCommittedAmountCurrent = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days <= cfg.staleCur).reduce((s, d) => s + d.amount, 0);
  const newlyCommittedAmountPrev = mockDeals.filter(d => d.forecast_category === 'COMMIT' && d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax).reduce((s, d) => s + d.amount, 0);
  const currentCommitSet = currentWindowDeals.filter(d => d.forecast_category === 'COMMIT');
  const prevCommitSet = previousWindowDeals.filter(d => d.forecast_category === 'COMMIT');
  const forecastAccuracyCurrent = currentCommitSet.length ? Math.round((currentCommitSet.filter(d => d.risk_level !== 'RED').length / currentCommitSet.length) * 100) : 0;
  const forecastAccuracyPrev = prevCommitSet.length ? Math.round((prevCommitSet.filter(d => d.risk_level !== 'RED').length / prevCommitSet.length) * 100) : 0;
  const unitLabel = cfg.unit === 'week' ? 'week' : cfg.unit === 'month' ? 'month' : 'quarter';
  const trendTextSame = `Same as last ${unitLabel}`;
  const formatDeltaCurrency = (delta: number) => {
    const sign = delta > 0 ? '+' : '-';
    const abs = Math.abs(delta);
    return `${sign}${formatCurrency(abs)}`;
  };
  const formatDeltaCount = (delta: number) => {
    if (delta === 0) return trendTextSame;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta} vs last ${unitLabel}`;
  };
  const formatDeltaPercent = (delta: number) => {
    if (delta === 0) return trendTextSame;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${Math.abs(delta)}% vs last ${unitLabel}`;
  };
  const commitDelta = commitCurrent - commitPrev;
  const bestCaseDelta = bestCaseCurrent - bestCasePrev;
  const slippageDelta = slippageCurrent - slippagePrev;
  const newlyCommittedDelta = newlyCommittedCurrent - newlyCommittedPrev;
  const slippageAmountDelta = slippageAmountCurrent - slippageAmountPrev;
  const newlyCommittedAmountDelta = newlyCommittedAmountCurrent - newlyCommittedAmountPrev;
  const forecastDelta = forecastAccuracyCurrent - forecastAccuracyPrev;
  const baseMonthlyTarget = 1200000;
  const targetAmount = timeRange === 'This week'
    ? Math.round(baseMonthlyTarget / 4)
    : timeRange === 'This quarter'
    ? baseMonthlyTarget * 3
    : baseMonthlyTarget;
  const now = new Date();
  const formatMonthLabel = (d: Date) =>
    `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  const formatQuarterLabel = (d: Date) => {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  };
  const formatWeekRangeLabel = (d: Date) => {
    const day = d.getDay(); // 0 Sun - 6 Sat
    const diffToMonday = (day + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (x: Date) => x.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    const sameYear = start.getFullYear() === end.getFullYear();
    return `${fmt(start)}–${fmt(end)}${sameYear ? `, ${start.getFullYear()}` : `, ${start.getFullYear()}–${end.getFullYear()}`}`;
  };
  const targetPeriodLabel =
    timeRange === 'This week'
      ? formatWeekRangeLabel(now)
      : timeRange === 'This quarter'
      ? formatQuarterLabel(now)
      : formatMonthLabel(now);

  return (
    <div className="flex flex-col">
      <PageHeader title="Manager View" subtitle="Forecast + Coaching overview">
        {/* <Button size="sm" onClick={() => navigate('/session')}>
          <Play className="h-3.5 w-3.5 mr-1.5" />Start 1:1
        </Button> */}
        {/* <Button variant="secondary" size="sm" onClick={() => navigate('/prep')}>
          <FileDown className="h-3.5 w-3.5 mr-1.5" />Generate Prep Pack
        </Button> */}
        {/* <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button> */}
      </PageHeader>

      <FilterStrip timeRange={timeRange} onTimeRangeChange={setTimeRange} showFrequency={false} />

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 px-4 sm:px-6 py-4">
        <KPICard
          label="Forecast Accuracy"
          value={`${forecastAccuracyCurrent}%`}
          trend={forecastDelta === 0 ? 'flat' : forecastDelta > 0 ? 'up' : 'down'}
          trendLabel={formatDeltaPercent(forecastDelta)}
          trendPositive={forecastAccuracyCurrent >= forecastAccuracyPrev}
        />
        <KPICard
          label="Target"
          value={formatCurrency(targetAmount)}
          trend="flat"
          trendLabel={targetPeriodLabel}
        />
        <KPICard
          label="Commit"
          value={formatCurrency(commitCurrent)}
          secondaryValue={`${commitCountCurrent} deals`}
          trend={commitDelta === 0 ? 'flat' : commitDelta > 0 ? 'up' : 'down'}
          trendLabel={commitDelta === 0 ? trendTextSame : `${formatDeltaCurrency(commitDelta)} vs last ${unitLabel}`}
          trendPositive={commitDelta > 0}
        />
        <KPICard
          label="Best Case"
          value={formatCurrency(bestCaseCurrent)}
          trend={bestCaseDelta === 0 ? 'flat' : bestCaseDelta > 0 ? 'up' : 'down'}
          trendLabel={bestCaseDelta === 0 ? trendTextSame : `${formatDeltaCurrency(bestCaseDelta)} vs last ${unitLabel}`}
          trendPositive={bestCaseDelta > 0}
        />
        <KPICard
          label="Slippage"
          value={formatCurrency(slippageAmountCurrent)}
          secondaryValue={`${slippageCurrent} deals`}
          trend={slippageAmountDelta === 0 ? 'flat' : slippageAmountDelta > 0 ? 'up' : 'down'}
          trendLabel={slippageAmountDelta === 0 ? trendTextSame : `${formatDeltaCurrency(slippageAmountDelta)} vs last ${unitLabel}`}
          trendPositive={slippageAmountDelta < 0}
        />
        <KPICard
          label="Newly Committed"
          value={formatCurrency(newlyCommittedAmountCurrent)}
          secondaryValue={`${newlyCommittedCurrent} deals`}
          trend={newlyCommittedAmountDelta === 0 ? 'flat' : newlyCommittedAmountDelta > 0 ? 'up' : 'down'}
          trendLabel={newlyCommittedAmountDelta === 0 ? trendTextSame : `${formatDeltaCurrency(newlyCommittedAmountDelta)} vs last ${unitLabel}`}
          trendPositive={newlyCommittedAmountDelta > 0}
        />
      </div>

      {/* Attention Queue + AE Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-4">
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
                pinned={pinnedDealIds.includes(deal.deal_id)}
                onPin={() => {
                  setPinnedDealIds((prev) =>
                    prev.includes(deal.deal_id)
                      ? prev.filter((id) => id !== deal.deal_id)
                      : [...prev, deal.deal_id]
                  );
                }}
                onStart={() => navigate('/session')}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-6">
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
