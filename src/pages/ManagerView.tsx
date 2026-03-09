import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Play, FileDown, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sam/PageHeader";
import { FilterStrip } from "@/components/sam/FilterStrip";
import { KPICard } from "@/components/sam/KPICard";
import { DealRow } from "@/components/sam/DealRow";
import { StatusDot } from "@/components/sam/StatusDot";
import { mockDeals, mockAEReps, formatCurrency, type Deal } from "@/data/mock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SalesMethodologyCard from "@/components/analytics/enterprise/Modules/SalesMethodologyCard";
import BuyerJourneyCard from "@/components/analytics/enterprise/Modules/BuyerJourneyCard";
import BuyerObjectionsCard from "@/components/analytics/enterprise/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/analytics/enterprise/Modules/BuyerQuestionsCard";
import EmptyPopup from "@/components/analytics/enterprise/Popup/EmptyPopup";

export default function ManagerView() {
  const [timeRange, setTimeRange] = useState("This month");
  const [pinnedDealIds, setPinnedDealIds] = useState<string[]>([]);
  const [funnelView, setFunnelView] = useState<"revenue" | "count">("revenue");
  const [stageDialog, setStageDialog] = useState<{ stage: string } | null>(null);
  const [analyticsDeal, setAnalyticsDeal] = useState<Deal | null>(null);
  const [eaPopupOpen, setEaPopupOpen] = useState(false);
  const [eaPopupData, setEaPopupData] = useState<{ title: string; content: string; value: number } | null>(null);
  const [kpiDialog, setKpiDialog] = useState<{ label: string; content: JSX.Element } | null>(null);
  const [selectedAE, setSelectedAE] = useState<string | null>(null);
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
  const bestCaseTopCur = currentWindowDeals
    .filter(d => d.forecast_category === 'BEST_CASE')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const bestCaseTopPrev = previousWindowDeals
    .filter(d => d.forecast_category === 'BEST_CASE')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const bestCaseCurrent = Math.min(bestCaseTopCur ? bestCaseTopCur.amount : 0, commitCurrent);
  const bestCasePrev = Math.min(bestCaseTopPrev ? bestCaseTopPrev.amount : 0, commitPrev);
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
  const worstCaseTopCur = currentWindowDeals
    .filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const worstCaseTopPrev = previousWindowDeals
    .filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const worstCaseCurrent = worstCaseTopCur ? worstCaseTopCur.amount : 0;
  const worstCasePrev = worstCaseTopPrev ? worstCaseTopPrev.amount : 0;
  const worstCaseDelta = worstCaseCurrent - worstCasePrev;
  const attentionQueueDeals = currentWindowDeals
    .slice()
    .sort((a, b) => {
      const ar = a.risk_reasons.length > 0 ? 1 : 0;
      const br = b.risk_reasons.length > 0 ? 1 : 0;
      if (ar !== br) return br - ar;
      const rank: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
      const ra = rank[a.risk_level] ?? 3;
      const rb = rank[b.risk_level] ?? 3;
      if (ra !== rb) return ra - rb;
      if (a.risk_score !== b.risk_score) return b.risk_score - a.risk_score;
      return b.amount - a.amount;
    })
    .slice(0, 6);
  const commitQueueDeals = currentWindowDeals
    .filter((d) => d.forecast_category === 'COMMIT')
    .slice()
    .sort((a, b) => {
      const rank: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
      const ra = rank[a.risk_level] ?? 3;
      const rb = rank[b.risk_level] ?? 3;
      if (ra !== rb) return ra - rb;
      const da = new Date(a.close_date).getTime();
      const db = new Date(b.close_date).getTime();
      if (da !== db) return da - db;
      return b.amount - a.amount;
    });
  const isAtRiskCommit = (d: any) => {
    const nonGreen = d.risk_level !== 'GREEN';
    const slippage = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: any) => r.code === 'CLOSE_DATE_MOVED');
    const missingEB = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: any) => r.code === 'MISSING_EB');
    const noMap = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: any) => r.code === 'NO_MAP');
    const singleThread = Array.isArray(d.risk_reasons) && d.risk_reasons.some((r: any) => r.code === 'SINGLE_THREADED');
    const days = Math.ceil((new Date(d.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const nextStepRisk = (!d.next_step || !d.next_step.is_buyer_confirmed) && days <= 21;
    return nonGreen || slippage || missingEB || noMap || singleThread || nextStepRisk;
  };
  const commitCoverage = commitQueueDeals.reduce((s, d) => s + d.amount, 0);
  const atRiskCount = commitQueueDeals.filter(isAtRiskCommit).length;
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
  const funnelStages = ['Discovery', 'Validation', 'Proposal', 'Negotiation', 'Closed Won'];
  const bench: Record<string, number> = { 'Discovery': 10, 'Validation': 8, 'Proposal': 12, 'Negotiation': 10, 'Closed Won': 0 };
  const dealsForFunnel = selectedAE ? currentWindowDeals.filter(d => d.owner_name === selectedAE) : [];
  const stageAgg = funnelStages.map(s => {
    const ds = dealsForFunnel.filter(d => d.stage_name === s);
    const revenue = ds.reduce((sum, d) => sum + d.amount, 0);
    const count = ds.length;
    const avgDwell = count ? Math.round(ds.reduce((sum, d) => sum + (d.stage_dwell_days || 0), 0) / count) : 0;
    return { stage: s, revenue, count, avgDwell };
  });
  const totalRev = stageAgg.reduce((sum, s) => sum + s.revenue, 0);
  const conv = stageAgg.map((s, i) => (i < stageAgg.length - 1 ? Math.round((stageAgg[i + 1].count * 100) / Math.max(1, s.count)) : 0));
  const biggestDropIdx = (() => {
    let idx = -1;
    let min = 101;
    for (let i = 0; i < conv.length - 1; i++) {
      if (stageAgg[i].count === 0) continue;
      if (conv[i] < min) {
        min = conv[i];
        idx = i;
      }
    }
    return idx;
  })();
  const highestRevIdx = stageAgg.reduce((a, s, i) => (s.revenue > stageAgg[a].revenue ? i : a), 0);
  const slowestIdx = stageAgg.reduce((a, s, i) => (s.avgDwell > stageAgg[a].avgDwell ? i : a), 0);

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

      <FilterStrip timeRange={timeRange} onTimeRangeChange={setTimeRange} showFrequency={false} narrowSelects />

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 px-4 sm:px-6 py-4">
        <KPICard
          label="Target"
          value={formatCurrency(targetAmount)}
          trend={commitDelta === 0 ? 'flat' : commitDelta > 0 ? 'up' : 'down'}
          trendLabel={`${formatDeltaCurrency(commitDelta)} vs last ${unitLabel}`}
          trendPositive={commitDelta > 0}
          onClick={() => {
            const content = (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Target Amount</div>
                    <div className="text-foreground font-medium">{formatCurrency(targetAmount)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Period</div>
                    <div className="text-foreground font-medium">{targetPeriodLabel}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Coverage</div>
                    <div className="text-foreground font-medium">{formatCurrency(commitCoverage)}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Target baseline uses monthly base scaled to selected period</div>
                <div className="rounded border border-border p-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Coverage vs Target</span>
                    <span className="text-foreground font-medium">
                      {Math.min(100, Math.round((commitCoverage / Math.max(1, targetAmount)) * 100))}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{ width: `${Math.min(100, Math.round((commitCoverage / Math.max(1, targetAmount)) * 100))}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Gap: {formatCurrency(Math.max(0, targetAmount - commitCoverage))}
                  </div>
                </div>
                <div className="rounded border border-border overflow-hidden">
                  <div className="px-3 py-2 border-b border-border text-[11px] text-muted-foreground">Top Commit contributors</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-3 py-2 font-medium">Deal</th>
                        <th className="text-right px-3 py-2 font-medium">Value</th>
                        <th className="text-left px-3 py-2 font-medium">AE</th>
                        <th className="text-right px-3 py-2 font-medium">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commitQueueDeals
                        .slice()
                        .sort((a, b) => b.amount - a.amount)
                        .slice(0, 6)
                        .map(d => (
                          <tr key={d.deal_id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2">{d.account_name} / {d.deal_name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                            <td className="px-3 py-2">{d.owner_name}</td>
                            <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      {commitQueueDeals.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No Commit deals in current period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
            setKpiDialog({ label: 'Target', content });
          }}
        />
        
        
        <KPICard
          label="Commit"
          value={formatCurrency(commitCurrent)}
          secondaryValue={`${commitCountCurrent} deals`}
          trend={commitDelta === 0 ? 'flat' : commitDelta > 0 ? 'up' : 'down'}
          trendLabel={commitDelta === 0 ? trendTextSame : `${formatDeltaCurrency(commitDelta)} vs last ${unitLabel}`}
          trendPositive={commitDelta > 0}
          onClick={() => {
            const content = (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Current</div>
                    <div className="text-foreground font-medium">{formatCurrency(commitCurrent)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Previous</div>
                    <div className="text-foreground font-medium">{formatCurrency(commitPrev)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Delta</div>
                    <div className="text-foreground font-medium">{formatDeltaCurrency(commitDelta)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Deal Count</div>
                    <div className="text-foreground font-medium">{commitCountCurrent}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Compared to last {unitLabel}</div>
                <div className="rounded border border-border overflow-hidden">
                  <div className="px-3 py-2 border-b border-border text-[11px] text-muted-foreground">Commit deals (Top 10 by risk & amount)</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-3 py-2 font-medium">Deal</th>
                        <th className="text-right px-3 py-2 font-medium">Value</th>
                        <th className="text-left px-3 py-2 font-medium">AE</th>
                        <th className="text-left px-3 py-2 font-medium">Risk</th>
                        <th className="text-right px-3 py-2 font-medium">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commitQueueDeals.slice(0, 10).map(d => (
                        <tr key={d.deal_id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2">{d.account_name} / {d.deal_name}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                          <td className="px-3 py-2">{d.owner_name}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1">
                              <StatusDot level={d.risk_level} />
                              <span className="text-muted-foreground">{d.risk_reasons?.[0]?.code || '—'}</span>
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {commitQueueDeals.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No Commit deals in current period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
            setKpiDialog({ label: 'Commit', content });
          }}
        />
        <KPICard
          label="Best Case"
          value={formatCurrency(bestCaseCurrent)}
          trend={bestCaseDelta === 0 ? 'flat' : bestCaseDelta > 0 ? 'up' : 'down'}
          trendLabel={bestCaseDelta === 0 ? trendTextSame : `${formatDeltaCurrency(bestCaseDelta)} vs last ${unitLabel}`}
          trendPositive={bestCaseDelta > 0}
          onClick={() => {
            const content = (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Current</div>
                    <div className="text-foreground font-medium">{formatCurrency(bestCaseCurrent)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Previous</div>
                    <div className="text-foreground font-medium">{formatCurrency(bestCasePrev)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Delta</div>
                    <div className="text-foreground font-medium">{formatDeltaCurrency(bestCaseDelta)}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Compared to last {unitLabel}</div>
                <div className="rounded border border-border overflow-hidden">
                  <div className="px-3 py-2 border-b border-border text-[11px] text-muted-foreground">Best Case deal</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-3 py-2 font-medium">Deal</th>
                        <th className="text-right px-3 py-2 font-medium">Value</th>
                        <th className="text-left px-3 py-2 font-medium">AE</th>
                        <th className="text-left px-3 py-2 font-medium">Stage</th>
                        <th className="text-right px-3 py-2 font-medium">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestCaseTopCur ? (
                        <tr key={bestCaseTopCur.deal_id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2">{bestCaseTopCur.account_name} / {bestCaseTopCur.deal_name}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(Math.min(bestCaseTopCur.amount, commitCurrent))}</td>
                          <td className="px-3 py-2">{bestCaseTopCur.owner_name}</td>
                          <td className="px-3 py-2">{bestCaseTopCur.stage_name}</td>
                          <td className="px-3 py-2 text-right">{new Date(bestCaseTopCur.close_date).toLocaleDateString()}</td>
                        </tr>
                      ) : null}
                      {currentWindowDeals.filter(d => d.forecast_category === 'BEST_CASE').length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No Best Case deals in current period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
            setKpiDialog({ label: 'Best Case', content });
          }}
        />

        <KPICard
          label="Worst Case"
          value={formatCurrency(worstCaseCurrent)}
          trend={worstCaseDelta === 0 ? 'flat' : worstCaseDelta > 0 ? 'up' : 'down'}
          trendLabel={worstCaseDelta === 0 ? trendTextSame : `${formatDeltaCurrency(worstCaseDelta)} vs last ${unitLabel}`}
          trendPositive={worstCaseDelta < 0}
          onClick={() => {
            const content = (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Current</div>
                    <div className="text-foreground font-medium">{formatCurrency(worstCaseCurrent)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Previous</div>
                    <div className="text-foreground font-medium">{formatCurrency(worstCasePrev)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Delta</div>
                    <div className="text-foreground font-medium">{formatDeltaCurrency(worstCaseDelta)}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Compared to last {unitLabel}</div>
                <div className="rounded border border-border overflow-hidden">
                  <div className="px-3 py-2 border-b border-border text-[11px] text-muted-foreground">Worst Case deal</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-3 py-2 font-medium">Deal</th>
                        <th className="text-right px-3 py-2 font-medium">Value</th>
                        <th className="text-left px-3 py-2 font-medium">AE</th>
                        <th className="text-left px-3 py-2 font-medium">Stage</th>
                        <th className="text-right px-3 py-2 font-medium">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {worstCaseTopCur ? (
                        <tr key={worstCaseTopCur.deal_id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2">{worstCaseTopCur.account_name} / {worstCaseTopCur.deal_name}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(worstCaseCurrent)}</td>
                          <td className="px-3 py-2">{worstCaseTopCur.owner_name}</td>
                          <td className="px-3 py-2">{worstCaseTopCur.stage_name}</td>
                          <td className="px-3 py-2 text-right">{new Date(worstCaseTopCur.close_date).toLocaleDateString()}</td>
                        </tr>
                      ) : null}
                      {currentWindowDeals.filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED').length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No RED-risk Commit deal in current period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
            setKpiDialog({ label: 'Worst Case', content });
          }}
        />
        
        <KPICard
          label="Slippage"
          value={formatCurrency(slippageAmountCurrent)}
          secondaryValue={`${slippageCurrent} deals`}
          trend={slippageAmountDelta === 0 ? 'flat' : slippageAmountDelta > 0 ? 'up' : 'down'}
          trendLabel={slippageAmountDelta === 0 ? trendTextSame : `${formatDeltaCurrency(slippageAmountDelta)} vs last ${unitLabel}`}
          trendPositive={slippageAmountDelta < 0}
          onClick={() => {
            const content = (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Current Amount</div>
                    <div className="text-foreground font-medium">{formatCurrency(slippageAmountCurrent)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Previous Amount</div>
                    <div className="text-foreground font-medium">{formatCurrency(slippageAmountPrev)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Delta</div>
                    <div className="text-foreground font-medium">{formatDeltaCurrency(slippageAmountDelta)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Deals Slipped</div>
                    <div className="text-foreground font-medium">{slippageCurrent} vs {slippagePrev}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Close date movement compared to last {unitLabel}</div>
                <div className="rounded border border-border overflow-hidden">
                  <div className="px-3 py-2 border-b border-border text-[11px] text-muted-foreground">Slipped deals (close date moved)</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-3 py-2 font-medium">Deal</th>
                        <th className="text-right px-3 py-2 font-medium">Value</th>
                        <th className="text-left px-3 py-2 font-medium">AE</th>
                        <th className="text-right px-3 py-2 font-medium">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentWindowDeals
                        .filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED'))
                        .slice()
                        .sort((a, b) => b.amount - a.amount)
                        .slice(0, 10)
                        .map(d => (
                          <tr key={d.deal_id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2">{d.account_name} / {d.deal_name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                            <td className="px-3 py-2">{d.owner_name}</td>
                            <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      {currentWindowDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No slippage detected in current period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
            setKpiDialog({ label: 'Slippage', content });
          }}
        />
        <KPICard
          label="Newly Committed"
          value={formatCurrency(newlyCommittedAmountCurrent)}
          secondaryValue={`${newlyCommittedCurrent} deals`}
          trend={newlyCommittedAmountDelta === 0 ? 'flat' : newlyCommittedAmountDelta > 0 ? 'up' : 'down'}
          trendLabel={newlyCommittedAmountDelta === 0 ? trendTextSame : `${formatDeltaCurrency(newlyCommittedAmountDelta)} vs last ${unitLabel}`}
          trendPositive={newlyCommittedAmountDelta > 0}
          onClick={() => {
            const content = (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Current Amount</div>
                    <div className="text-foreground font-medium">{formatCurrency(newlyCommittedAmountCurrent)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Previous Amount</div>
                    <div className="text-foreground font-medium">{formatCurrency(newlyCommittedAmountPrev)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Delta</div>
                    <div className="text-foreground font-medium">{formatDeltaCurrency(newlyCommittedAmountDelta)}</div>
                  </div>
                  <div className="rounded border border-border p-2">
                    <div className="text-muted-foreground">Deals</div>
                    <div className="text-foreground font-medium">{newlyCommittedCurrent} vs {newlyCommittedPrev}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Newly added to Commit in this {unitLabel}</div>
                <div className="rounded border border-border overflow-hidden">
                  <div className="px-3 py-2 border-b border-border text-[11px] text-muted-foreground">Newest Commit deals</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left px-3 py-2 font-medium">Deal</th>
                        <th className="text-right px-3 py-2 font-medium">Value</th>
                        <th className="text-left px-3 py-2 font-medium">AE</th>
                        <th className="text-left px-3 py-2 font-medium">Risk</th>
                        <th className="text-right px-3 py-2 font-medium">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentWindowDeals
                        .filter(d => d.forecast_category === 'COMMIT')
                        .slice()
                        .sort((a, b) => (a.staleness_days - b.staleness_days) || (b.amount - a.amount))
                        .slice(0, 10)
                        .map(d => (
                          <tr key={d.deal_id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2">{d.account_name} / {d.deal_name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                            <td className="px-3 py-2">{d.owner_name}</td>
                            <td className="px-3 py-2">
                              <span className="inline-flex items-center gap-1">
                                <StatusDot level={d.risk_level} />
                                <span className="text-muted-foreground">{d.risk_reasons?.[0]?.code || '—'}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      {currentWindowDeals.filter(d => d.forecast_category === 'COMMIT').length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No newly committed deals in current period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
            setKpiDialog({ label: 'Newly Committed', content });
          }}
        />
      </div>

      {/* Funnel + AE Table (First Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-4">
        {/* Stage Conversion Funnel */}
        <div className="rounded-lg border border-border bg-card p-4 order-2 lg:order-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Stage Conversion Funnel</h2>
              <div className="inline-flex rounded-md border border-border overflow-hidden">
                <button
                  className={`h-7 px-2 text-xs ${funnelView === 'revenue' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/60 hover:text-primary-foreground'}`}
                  onClick={() => setFunnelView('revenue')}
                >
                  Revenue
                </button>
                <button
                  className={`h-7 px-2 text-xs ${funnelView === 'count' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/60 hover:text-primary-foreground'}`}
                  onClick={() => setFunnelView('count')}
                >
                  Deal Count
                </button>
              </div>
              </div>
              {selectedAE && (
                <div className="text-xs text-muted-foreground">
                  AE: <span className="text-foreground font-medium">{selectedAE}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:bg-transparent hover:text-[#FF8E1C]"
              onClick={() => {
                if (!selectedAE) return;
                setStageDialog({ stage: stageAgg[biggestDropIdx >= 0 ? biggestDropIdx : 0].stage });
              }}
            >
              View details →
            </Button>
          </div>
          {!selectedAE ? (
            <div className="h-40 rounded-md border border-dashed border-border bg-secondary/40 flex items-center justify-center text-xs text-muted-foreground">
              Click an AE on the left to view Stage Conversion Funnel
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {stageAgg.map((s, idx) => {
                  const widthPct = totalRev > 0 ? Math.max(2, Math.round((s.revenue / totalRev) * 100)) : 0;
                  const flagSlow = s.avgDwell > (bench[s.stage] ?? 0);
                  const flagRev = totalRev > 0 && s.revenue / totalRev > 0.35;
                  return (
                    <div key={s.stage} className="space-y-0.5">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setStageDialog({ stage: s.stage })}
                        role="button"
                        aria-label={`Open ${s.stage} details`}
                      >
                        <span className="text-xs text-muted-foreground w-24 shrink-0">{s.stage}</span>
                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                          <div className="h-full bg-primary/30 rounded" style={{ width: `${widthPct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-foreground w-28 md:w-32 shrink-0 text-right">
                          {funnelView === 'revenue' ? formatCurrency(s.revenue) : `${s.count} deals`}
                        </span>
                      </div>
                      {idx < stageAgg.length - 1 && (
                        <div className="pl-24 text-[11px] flex items-center">
                          <div className={`${conv[idx] < 40 ? 'text-status-amber' : 'text-muted-foreground'} flex-1`}>
                            → {conv[idx]}% conversion
                          </div>
                          <div className="w-28 md:w-32 shrink-0 text-right">
                            {(flagSlow || flagRev) && (
                              <span className="inline-flex items-center gap-1 text-status-amber">
                                {flagSlow && <span>Slow</span>}
                                {flagRev && <span>Revenue</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <div>
                  <div>Biggest drop-off</div>
                  <div className="text-foreground">
                    {biggestDropIdx >= 0 ? `${stageAgg[biggestDropIdx].stage} → ${stageAgg[biggestDropIdx + 1].stage} (${conv[biggestDropIdx]}%)` : '—'}
                  </div>
                </div>
                <div>
                  <div>Most revenue</div>
                  <div className="text-foreground">
                    {stageAgg[highestRevIdx]?.stage} ({formatCurrency(stageAgg[highestRevIdx]?.revenue || 0)})
                  </div>
                </div>
                <div>
                  <div>Slowest stage</div>
                  <div className="text-foreground">
                    {stageAgg[slowestIdx]?.stage} ({stageAgg[slowestIdx]?.avgDwell || 0}d avg)
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <Dialog open={!!stageDialog} onOpenChange={(open) => setStageDialog(open ? stageDialog : null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{stageDialog?.stage} — Stage Insights</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {stageDialog && (() => {
                const s = stageAgg.find(x => x.stage === stageDialog.stage) || { stage: stageDialog.stage, revenue: 0, count: 0, avgDwell: 0 };
                const b = bench[s.stage] ?? 0;
                const deals = dealsForFunnel.filter(d => d.stage_name === stageDialog.stage);
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded border border-border p-2">
                        <div className="text-muted-foreground">Revenue</div>
                        <div className="text-foreground font-medium">{formatCurrency(s.revenue)}</div>
                      </div>
                      <div className="rounded border border-border p-2">
                        <div className="text-muted-foreground">Deals</div>
                        <div className="text-foreground font-medium">{s.count}</div>
                      </div>
                      <div className={`rounded border border-border p-2 ${s.avgDwell > b && b > 0 ? 'ring-1 ring-status-amber' : ''}`}>
                        <div className="text-muted-foreground">Avg time in stage</div>
                        <div className="text-foreground font-medium">{s.avgDwell}d</div>
                        <div className="text-muted-foreground">Benchmark {b}d</div>
                      </div>
                    </div>
                    <div className="rounded border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left px-3 py-2 font-medium">Deal</th>
                            <th className="text-right px-3 py-2 font-medium">Value</th>
                            <th className="text-left px-3 py-2 font-medium">AE</th>
                            <th className="text-right px-3 py-2 font-medium">Days in Stage</th>
                            <th className="text-right px-3 py-2 font-medium">Last Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deals.map(d => (
                            <tr key={d.deal_id} className="border-b border-border last:border-0">
                              <td className="px-3 py-2">{d.account_name} / {d.deal_name}</td>
                              <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                              <td className="px-3 py-2">{d.owner_name}</td>
                              <td className="px-3 py-2 text-right">{d.stage_dwell_days}d</td>
                              <td className="px-3 py-2 text-right">{d.staleness_days}d ago</td>
                            </tr>
                          ))}
                          {deals.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No deals in this stage.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setStageDialog(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AE Health Table */}
        <div className="rounded-lg border border-border bg-card order-1 lg:order-1">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Forecast by AE</h2>
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
                    onClick={() => setSelectedAE(rep.name)}
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
      <Dialog open={!!kpiDialog} onOpenChange={(open) => setKpiDialog(open ? kpiDialog : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{kpiDialog?.label} — Details</DialogTitle>
          </DialogHeader>
          {kpiDialog?.content}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setKpiDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attention + Commit Queues (Second Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-4">
        {/* Attention Queue Preview */}
        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Attention Queue</h2>
              <p className="text-xs text-muted-foreground">Top deals needing action this {unitLabel}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-transparent hover:text-[#FF8E1C]" onClick={() => navigate('/queue')}>
              View full queue →
            </Button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {attentionQueueDeals.map((deal) => (
              <DealRow
                key={deal.deal_id}
                deal={deal}
                compact
                onClick={() => setAnalyticsDeal(deal)}
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

        {/* Commit Queue Preview */}
        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Commit Queue</h2>
              <p className="text-xs text-muted-foreground">Deals in Commit this {unitLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[11px] text-muted-foreground">
                Coverage {formatCurrency(commitCoverage)}
              </span>
              <span
                role="button"
                title="View At Risk commits"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[11px] text-muted-foreground cursor-pointer hover:ring-1 hover:ring-border"
                onClick={() => navigate('/commit-queue?atRiskOnly=true')}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-status-amber" />
                At Risk {atRiskCount}
              </span>
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-transparent hover:text-[#FF8E1C]" onClick={() => navigate('/commit-queue')}>
                View full queue →
              </Button>
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {commitQueueDeals.map((deal) => (
              <DealRow
                key={deal.deal_id}
                deal={deal}
                compact
                riskMax={1}
                onClick={() => setAnalyticsDeal(deal)}
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
            {commitQueueDeals.length === 0 && (
              <div className="px-4 py-6 text-xs text-muted-foreground">
                No deals in Commit for this period.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 pb-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>
                Analytics
                {analyticsDeal && (
                  <>
                    {' — '}
                    {analyticsDeal.account_name} / {analyticsDeal.deal_name} · {formatCurrency(analyticsDeal.amount)}
                  </>
                )}
              </span>
              {analyticsDeal && (
                <span className="ml-1 relative group inline-flex items-center" aria-label={`Risk ${analyticsDeal.risk_level}`}>
                  {analyticsDeal.risk_level === 'RED' ? (
                    <AlertCircle className="h-4 w-4 text-status-red" />
                  ) : analyticsDeal.risk_level === 'AMBER' ? (
                    <AlertTriangle className="h-4 w-4 text-status-amber" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-status-green" />
                  )}
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-card text-xs text-foreground border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap">
                    Risk: {analyticsDeal.risk_level}
                  </span>
                </span>
              )}
            </h2>
            {analyticsDeal && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:bg-transparent hover:text-[#FF8E1C]"
                onClick={() => setAnalyticsDeal(null)}
              >
                Clear
              </Button>
            )}
          </div>
          {!analyticsDeal ? (
            <div className="h-40 rounded-md border border-dashed border-border bg-secondary/40 flex items-center justify-center text-xs text-muted-foreground">
              Select a deal from queues to view analytics
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground">Owner:</span> {analyticsDeal.owner_name}
                <span className="mx-2">·</span>
                <span className="text-foreground">Stage:</span> {analyticsDeal.stage_name}
                <span className="mx-2">·</span>
                <span className="text-foreground">Close:</span> {new Date(analyticsDeal.close_date).toLocaleDateString()}
                <span className="mx-2">·</span>
                <span className="text-foreground">Category:</span> {analyticsDeal.forecast_category}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <SalesMethodologyCard
                  onDataClick={(title, content, value) => {
                    setEaPopupData({ title, content, value });
                    setEaPopupOpen(true);
                  }}
                />
                <BuyerJourneyCard
                  onDataClick={(title, content, value) => {
                    setEaPopupData({ title, content, value });
                    setEaPopupOpen(true);
                  }}
                />
                <BuyerObjectionsCard
                  onDataClick={(title, content, value) => {
                    setEaPopupData({ title, content, value });
                    setEaPopupOpen(true);
                  }}
                />
                <BuyerQuestionsCard
                  onDataClick={(title, content, value) => {
                    setEaPopupData({ title, content, value });
                    setEaPopupOpen(true);
                  }}
                />
              </div>
              {eaPopupOpen && eaPopupData && (
                <EmptyPopup
                  isOpen={eaPopupOpen}
                  onClose={() => {
                    setEaPopupOpen(false);
                    setEaPopupData(null);
                  }}
                  title={eaPopupData.title}
                  content={eaPopupData.content}
                  value={eaPopupData.value}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
