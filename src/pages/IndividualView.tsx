import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Play, FileDown, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sam/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KPICard } from "@/components/sam/KPICard";
import { DealRow } from "@/components/sam/DealRow";
import { StatusDot } from "@/components/sam/StatusDot";
import { mockDeals, mockAEReps, formatCurrency, type Deal } from "@/data/mock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SalesMethodologyCard from "@/components/analytics/enterprise/Modules/SalesMethodologyCard";
import BuyerJourneyCard from "@/components/analytics/enterprise/Modules/BuyerJourneyCard";
import BuyerObjectionsCard from "@/components/analytics/enterprise/Modules/BuyerObjectionsCard";
import BuyerQuestionsCard from "@/components/analytics/enterprise/Modules/BuyerQuestionsCard";
import EmptyPopup from "@/components/analytics/enterprise/Popup/EmptyPopup";

export default function IndividualView({
  timeRange,
  onTimeRangeChange,
  segment,
  onSegmentChange,
  aeName,
}: {
  timeRange: string;
  onTimeRangeChange: (v: string) => void;
  segment: string;
  onSegmentChange: (v: string) => void;
  aeName: string;
}) {
  const [pinnedDealIds, setPinnedDealIds] = useState<string[]>([]);
  const [stageDialog, setStageDialog] = useState<{ stage: string } | null>(null);
  const [analyticsDeal, setAnalyticsDeal] = useState<Deal | null>(null);
  const [eaPopupOpen, setEaPopupOpen] = useState(false);
  const [eaPopupData, setEaPopupData] = useState<{ title: string; content: string; value: number } | null>(null);
  const [kpiDialog, setKpiDialog] = useState<{ label: string; content: JSX.Element; size?: 'default' | 'large' } | null>(null);
  const [selectedAE, setSelectedAE] = useState<string | null>(aeName || null);
  const navigate = useNavigate();
  const topDeals = mockDeals.slice(0, 6);
  const cfg =
    timeRange === "This week"
      ? { curMax: 7, prevMin: 8, prevMax: 14, unit: "week", staleCur: 7, stalePrevMin: 8, stalePrevMax: 14 }
      : timeRange === "This quarter"
      ? { curMax: 90, prevMin: 91, prevMax: 180, unit: "quarter", staleCur: 90, stalePrevMin: 91, stalePrevMax: 180 }
      : timeRange === "This year"
      ? { curMax: 365, prevMin: 366, prevMax: 730, unit: "year", staleCur: 365, stalePrevMin: 366, stalePrevMax: 730 }
      : { curMax: 30, prevMin: 31, prevMax: 60, unit: "month", staleCur: 30, stalePrevMin: 31, stalePrevMax: 60 };
  const currentWindowDeals = mockDeals.filter(d => d.staleness_days <= cfg.staleCur);
  const previousWindowDeals = mockDeals.filter(d => d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax);
  const currentAEDeals = selectedAE ? currentWindowDeals.filter(d => d.owner_name === selectedAE) : [];
  const previousAEDeals = selectedAE ? previousWindowDeals.filter(d => d.owner_name === selectedAE) : [];
  const commitCurrent = currentAEDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const commitPrev = previousAEDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const commitCountCurrent = currentAEDeals.filter(d => d.forecast_category === 'COMMIT').length;
  const bestCaseTopCur = currentAEDeals
    .filter(d => d.forecast_category === 'BEST_CASE')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const bestCaseTopPrev = previousAEDeals
    .filter(d => d.forecast_category === 'BEST_CASE')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const bestCaseCurrent = Math.min(bestCaseTopCur ? bestCaseTopCur.amount : 0, commitCurrent);
  const bestCasePrev = Math.min(bestCaseTopPrev ? bestCaseTopPrev.amount : 0, commitPrev);
  const slippageCurrent = currentAEDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
  const slippagePrev = previousAEDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).length;
  const slippageAmountCurrent = currentAEDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).reduce((s, d) => s + d.amount, 0);
  const slippageAmountPrev = previousAEDeals.filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED')).reduce((s, d) => s + d.amount, 0);
  const newlyCommittedCurrent = mockDeals.filter(d => d.owner_name === selectedAE && d.forecast_category === 'COMMIT' && d.staleness_days <= cfg.staleCur).length;
  const newlyCommittedPrev = mockDeals.filter(d => d.owner_name === selectedAE && d.forecast_category === 'COMMIT' && d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax).length;
  const newlyCommittedAmountCurrent = mockDeals.filter(d => d.owner_name === selectedAE && d.forecast_category === 'COMMIT' && d.staleness_days <= cfg.staleCur).reduce((s, d) => s + d.amount, 0);
  const newlyCommittedAmountPrev = mockDeals.filter(d => d.owner_name === selectedAE && d.forecast_category === 'COMMIT' && d.staleness_days >= cfg.stalePrevMin && d.staleness_days <= cfg.stalePrevMax).reduce((s, d) => s + d.amount, 0);
  const currentCommitSet = currentAEDeals.filter(d => d.forecast_category === 'COMMIT');
  const prevCommitSet = previousAEDeals.filter(d => d.forecast_category === 'COMMIT');
  const forecastAccuracyCurrent = currentCommitSet.length ? Math.round((currentCommitSet.filter(d => d.risk_level !== 'RED').length / currentCommitSet.length) * 100) : 0;
  const forecastAccuracyPrev = prevCommitSet.length ? Math.round((prevCommitSet.filter(d => d.risk_level !== 'RED').length / prevCommitSet.length) * 100) : 0;
  const unitLabel = cfg.unit === 'week' ? 'week' : cfg.unit === 'month' ? 'month' : cfg.unit === 'quarter' ? 'quarter' : 'year';
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
  const worstCaseTopCur = currentAEDeals
    .filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const worstCaseTopPrev = previousAEDeals
    .filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED')
    .slice()
    .sort((a, b) => b.amount - a.amount)[0] || null;
  const worstCaseCurrent = worstCaseTopCur ? worstCaseTopCur.amount : 0;
  const worstCasePrev = worstCaseTopPrev ? worstCaseTopPrev.amount : 0;
  const worstCaseDelta = worstCaseCurrent - worstCasePrev;
  const bestCaseCountCurrent = currentAEDeals.filter(d => d.forecast_category === 'BEST_CASE').length;
  const worstCaseCountCurrent = currentAEDeals.filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED').length;
  const attentionQueueDeals = currentAEDeals
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
  const commitQueueDeals = currentAEDeals
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
  const commitCoverageAE = currentAEDeals.filter(d => d.forecast_category === 'COMMIT').reduce((s, d) => s + d.amount, 0);
  const atRiskCount = commitQueueDeals.filter(isAtRiskCommit).length;
  const baseMonthlyTarget = 1200000;
  const targetAmount = timeRange === 'This week'
    ? Math.round(baseMonthlyTarget / 4)
    : timeRange === 'This quarter'
    ? baseMonthlyTarget * 3
    : timeRange === 'This year'
    ? baseMonthlyTarget * 12
    : baseMonthlyTarget;
  const targetAmountAE = Math.round(targetAmount / Math.max(1, mockAEReps.length));
  const now = new Date();
  const formatMonthLabel = (d: Date) =>
    `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  const formatQuarterLabel = (d: Date) => {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  };
  const formatYearLabel = (d: Date) => `${d.getFullYear()}`;
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
      : timeRange === 'This year'
      ? formatYearLabel(now)
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
  const maxRev = stageAgg.reduce((m, s) => Math.max(m, s.revenue), 0);
  const conv = stageAgg.map((s, i) => (i < stageAgg.length - 1 ? Math.round((stageAgg[i + 1].count * 100) / Math.max(1, s.count)) : 0));
  const rawStagePct = stageAgg.map(s => (totalRev > 0 ? (s.revenue / totalRev) * 100 : 0));
  const widthPercents = (() => {
    if (totalRev <= 0) return stageAgg.map(() => 0);
    const floors = rawStagePct.map(p => Math.floor(p));
    const sumFloors = floors.reduce((a, b) => a + b, 0);
    let remainder = 100 - sumFloors;
    const order = rawStagePct
      .map((p, i) => ({ i, frac: p - Math.floor(p) }))
      .sort((a, b) => b.frac - a.frac);
    const result = floors.slice();
    for (let k = 0; k < remainder; k++) {
      const t = order[k];
      if (t) result[t.i]++;
    }
    return result;
  })();
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
      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 px-4 sm:px-6 pt-2 pb-4">
        <KPICard
          label="Target"
          value={formatCurrency(targetAmountAE)}
          trend={commitDelta === 0 ? 'flat' : commitDelta > 0 ? 'up' : 'down'}
          trendLabel={`${formatDeltaCurrency(commitDelta)} vs last ${unitLabel}`}
          trendPositive={commitDelta > 0}
          onClick={() => {
            const content = (
              <div className="space-y-3">
                {(() => {
                  const d = now;
                  const fmt = (x: Date) => x.toLocaleString('en-US', { month: 'short', day: 'numeric' });
                  const periodLabel =
                    timeRange === 'This week'
                      ? (() => {
                          const day = d.getDay();
                          const diffToMonday = (day + 6) % 7;
                          const start = new Date(d);
                          start.setDate(d.getDate() - diffToMonday);
                          const end = new Date(start);
                          end.setDate(start.getDate() + 6);
                          const y = start.getFullYear();
                          return `${fmt(start)}–${fmt(end)}, ${y}`;
                        })()
                      : timeRange === 'This quarter'
                      ? (() => {
                          const qStartMonth = Math.floor(d.getMonth() / 3) * 3;
                          const start = new Date(d.getFullYear(), qStartMonth, 1);
                          const end = new Date(d.getFullYear(), qStartMonth + 3, 0);
                          const y = start.getFullYear();
                          return `${fmt(start)}–${fmt(end)}, ${y}`;
                        })()
                      : timeRange === 'This year'
                      ? (() => {
                          const start = new Date(d.getFullYear(), 0, 1);
                          const end = new Date(d.getFullYear(), 11, 31);
                          const y = start.getFullYear();
                          return `${fmt(start)}–${fmt(end)}, ${y}`;
                        })()
                      : (() => {
                          const start = new Date(d.getFullYear(), d.getMonth(), 1);
                          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                          const y = start.getFullYear();
                          return `${fmt(start)}–${fmt(end)}, ${y}`;
                        })();
                  const coveragePct = Math.min(100, Math.round((commitCoverageAE / Math.max(1, targetAmountAE)) * 100));
                  const gap = Math.max(0, targetAmountAE - commitCoverageAE);
                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="rounded bg-secondary/40 p-3">
                          <div className="text-muted-foreground">Period</div>
                          <div className="text-foreground font-medium">{periodLabel}</div>
                        </div>
                        <div className="rounded bg-secondary/40 p-3">
                          <div className="text-muted-foreground">Target Amount</div>
                          <div className="text-foreground font-medium">{formatCurrency(targetAmountAE)}</div>
                        </div>
                        <div className="rounded bg-secondary/40 p-3">
                          <div className="text-muted-foreground">Coverage</div>
                          <div className="text-foreground font-medium">{formatCurrency(commitCoverageAE)}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Coverage vs Target</span>
                          <span className="text-foreground font-medium">{coveragePct}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/60 rounded">
                          <div className="h-2 rounded" style={{ width: `${coveragePct}%`, backgroundColor: '#605BFF' }} />
                        </div>
                        <div className="text-xs text-muted-foreground">Gap: {formatCurrency(gap)}</div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">Target baseline uses monthly base scaled to selected period</div>
                    </>
                  );
                })()}
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
              <div className="rounded overflow-hidden">
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
                    {currentAEDeals.filter(d => d.forecast_category === 'COMMIT').slice(0, 10).map(d => {
                      const rCount = Array.isArray(d.risk_reasons) ? d.risk_reasons.length : 0;
                      const colorClass = rCount === 0 ? 'text-status-green' : rCount <= 2 ? 'text-status-amber' : 'text-status-red';
                      const toTitle = (s: string | undefined) => {
                        if (!s || typeof s !== 'string') return 'Unknown risk';
                        return s
                          .toLowerCase()
                          .split(/[_\s-]+/)
                          .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
                          .join(' ');
                      };
                      const riskList =
                        Array.isArray(d.risk_reasons) && d.risk_reasons.length > 0
                          ? d.risk_reasons.map((r: any) => toTitle(r.name || r.code))
                          : ['No risks'];
                      return (
                        <tr key={d.deal_id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 whitespace-nowrap">{d.account_name} / {d.deal_name}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                          <td className="px-3 py-2">{d.owner_name}</td>
                          <td className="px-3 py-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`font-semibold ${colorClass} cursor-pointer hover:opacity-80`}>{rCount}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="space-y-1">
                                  {riskList.map((name, i) => (
                                    <div key={i} className="text-xs text-foreground">{name}</div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                    {commitQueueDeals.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No Commit deals in current period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
            setKpiDialog({ label: 'Commit', content });
          }}
        />
        <KPICard
          label="Best Case"
          value={formatCurrency(bestCaseCurrent)}
          secondaryValue={`${bestCaseCountCurrent} deals`}
          trend={bestCaseDelta === 0 ? 'flat' : bestCaseDelta > 0 ? 'up' : 'down'}
          trendLabel={bestCaseDelta === 0 ? trendTextSame : `${formatDeltaCurrency(bestCaseDelta)} vs last ${unitLabel}`}
          trendPositive={bestCaseDelta > 0}
          onClick={() => {
            const list = currentWindowDeals
              .filter(d => d.forecast_category === 'BEST_CASE' && (!selectedAE || d.owner_name === selectedAE))
              .slice()
              .sort((a, b) => b.amount - a.amount);
            const content = (
              <div className="rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-3 py-2 font-medium">Deal</th>
                      <th className="text-right px-3 py-2 font-medium">Value</th>
                      <th className="text-left px-3 py-2 font-medium">AE</th>
                      <th className="text-left px-3 py-2 font-medium">Risk</th>
                      <th className="text-left px-3 py-2 font-medium">Stage</th>
                      <th className="text-right px-3 py-2 font-medium">Close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length > 0 ? (
                      list.map((d) => {
                        const rCount = Array.isArray(d.risk_reasons) ? d.risk_reasons.length : 0;
                        const colorClass = rCount === 0 ? 'text-status-green' : rCount <= 2 ? 'text-status-amber' : 'text-status-red';
                        const toTitle = (s: string | undefined) => {
                          if (!s || typeof s !== 'string') return 'Unknown risk';
                          return s
                            .toLowerCase()
                            .split(/[_\s-]+/)
                            .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
                            .join(' ');
                        };
                        const riskList =
                          Array.isArray(d.risk_reasons) && d.risk_reasons.length > 0
                            ? d.risk_reasons.map((r: any) => toTitle(r?.name ?? r?.code))
                            : ['No risks'];
                        return (
                          <tr key={d.deal_id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 whitespace-nowrap">{d.account_name} / {d.deal_name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                            <td className="px-3 py-2">{d.owner_name}</td>
                            <td className="px-3 py-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`font-semibold ${colorClass} cursor-pointer hover:opacity-80`}>{rCount}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="space-y-1">
                                    {riskList.map((name, i) => (
                                      <div key={i} className="text-xs text-foreground">{name}</div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="px-3 py-2">{d.stage_name}</td>
                            <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No Best Case deals in current period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
            setKpiDialog({ label: 'Best Case', content });
          }}
        />

        <KPICard
          label="Commit At Risk"
          value={formatCurrency(worstCaseCurrent)}
          secondaryValue={`${worstCaseCountCurrent} deals`}
          trend={worstCaseDelta === 0 ? 'flat' : worstCaseDelta > 0 ? 'up' : 'down'}
          trendLabel={worstCaseDelta === 0 ? trendTextSame : `${formatDeltaCurrency(worstCaseDelta)} vs last ${unitLabel}`}
          trendPositive={worstCaseDelta < 0}
          onClick={() => {
            const list = currentWindowDeals
              .filter(d => d.forecast_category === 'COMMIT' && d.risk_level === 'RED' && (!selectedAE || d.owner_name === selectedAE))
              .slice()
              .sort((a, b) => b.amount - a.amount);
            const content = (
              <div className="rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-3 py-2 font-medium">Deal</th>
                      <th className="text-right px-3 py-2 font-medium">Value</th>
                      <th className="text-left px-3 py-2 font-medium">AE</th>
                      <th className="text-left px-3 py-2 font-medium">Risk</th>
                      <th className="text-left px-3 py-2 font-medium">Stage</th>
                      <th className="text-right px-3 py-2 font-medium">Close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length > 0 ? (
                      list.map((d) => {
                        const rCount = Array.isArray(d.risk_reasons) ? d.risk_reasons.length : 0;
                        const colorClass = rCount === 0 ? 'text-status-green' : rCount <= 2 ? 'text-status-amber' : 'text-status-red';
                        const toTitle = (s: string | undefined) => {
                          if (!s || typeof s !== 'string') return 'Unknown risk';
                          return s
                            .toLowerCase()
                            .split(/[_\s-]+/)
                            .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
                            .join(' ');
                        };
                        const riskList =
                          Array.isArray(d.risk_reasons) && d.risk_reasons.length > 0
                            ? d.risk_reasons.map((r: any) => toTitle(r?.name ?? r?.code))
                            : ['No risks'];
                        return (
                          <tr key={d.deal_id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2">{d.account_name} / {d.deal_name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                            <td className="px-3 py-2">{d.owner_name}</td>
                            <td className="px-3 py-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`font-semibold ${colorClass} cursor-pointer hover:opacity-80`}>{rCount}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="space-y-1">
                                    {riskList.map((name, i) => (
                                      <div key={i} className="text-xs text-foreground">{name}</div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="px-3 py-2">{d.stage_name}</td>
                            <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No RED-risk Commit deal in current period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
            const list = currentWindowDeals
              .filter(d => d.risk_reasons.some(r => r.code === 'CLOSE_DATE_MOVED') && (!selectedAE || d.owner_name === selectedAE))
              .slice()
              .sort((a, b) => b.amount - a.amount);
            const content = (
              <div className="rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-3 py-2 font-medium">Deal</th>
                      <th className="text-right px-3 py-2 font-medium">Value</th>
                      <th className="text-left px-3 py-2 font-medium">AE</th>
                      <th className="text-left px-3 py-2 font-medium">Stage</th>
                      <th className="text-right px-3 py-2 font-medium">Moved To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length > 0 ? (
                      list.map((d) => (
                        <tr key={d.deal_id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 whitespace-nowrap">{d.account_name} / {d.deal_name}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                          <td className="px-3 py-2">{d.owner_name}</td>
                          <td className="px-3 py-2">{d.stage_name}</td>
                          <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No Slippage deals in current period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
            const list = currentWindowDeals
              .filter(d => d.forecast_category === 'COMMIT' && (!selectedAE || d.owner_name === selectedAE))
              .slice()
              .sort((a, b) => (a.staleness_days - b.staleness_days) || (b.amount - a.amount));
            const content = (
              <div className="rounded overflow-hidden">
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
                    {list.length > 0 ? (
                      list.map((d) => (
                        <tr key={d.deal_id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 whitespace-nowrap">{d.account_name} / {d.deal_name}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                          <td className="px-3 py-2">{d.owner_name}</td>
                          <td className="px-3 py-2">{d.stage_name}</td>
                          <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">No newly committed deals in current period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
            setKpiDialog({ label: 'Newly Committed', content });
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 sm:px-6 pb-2">
        {/* Stage Conversion Funnel */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Stage Conversion Funnel</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:bg-transparent hover:text-[#FF8E1C]"
              onClick={() => {
                const totalDeals = stageAgg.reduce((sum, s) => sum + s.count, 0);
                const overallConv = stageAgg.length > 1 ? Math.round((stageAgg[stageAgg.length - 1].count * 100) / Math.max(1, stageAgg[0].count)) : 0;
                const overallAvgDwell = totalDeals ? Math.round(stageAgg.reduce((sum, s) => sum + (s.avgDwell || 0) * s.count, 0) / totalDeals) : 0;
                const content = (
                  <div className="space-y-3">
                    <div className="text-xs py-4">
                      <div className="grid grid-cols-6 gap-3">
                        <div className="rounded bg-secondary/40 p-3">
                          <div className="text-muted-foreground">Overall</div>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-muted-foreground">Total Revenue</div>
                              <div className="text-foreground font-medium">{formatCurrency(totalRev)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Deals count</div>
                              <div className="text-foreground font-medium">{totalDeals}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Overall % conversion</div>
                              <div className="text-foreground font-medium">{overallConv}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Overall avg time</div>
                              <div className="text-foreground font-medium">{overallAvgDwell}d</div>
                            </div>
                          </div>
                        </div>
                        {stageAgg.map((s, i) => {
                          const b = bench[s.stage] ?? 0;
                          const isSlow = s.avgDwell > b && b > 0;
                          return (
                            <div key={s.stage} className={`rounded bg-secondary/40 p-3 ${isSlow ? 'ring-1 ring-status-amber' : ''}`}>
                              <div className="text-muted-foreground">{s.stage}</div>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-muted-foreground">Revenue</div>
                                  <div className="text-foreground font-medium">{formatCurrency(s.revenue)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Deals</div>
                                  <div className="text-foreground font-medium">{s.count}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">% conversion</div>
                                  <div className="text-foreground font-medium">{conv[i] ?? 0}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Avg time</div>
                                  <div className="text-foreground font-medium">{s.avgDwell}d</div>
                                  <div className="text-muted-foreground">Benchmark {b}d</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded overflow-hidden">
                      <table className="w-full text-xs table-fixed">
                        <colgroup>
                          <col style={{ width: '28ch' }} />
                          <col style={{ width: '12ch' }} />
                          <col style={{ width: '16ch' }} />
                          <col style={{ width: '12ch' }} />
                          <col style={{ width: '14ch' }} />
                          <col style={{ width: '12ch' }} />
                          <col style={{ width: '12ch' }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left px-3 py-2 font-medium">Deal</th>
                            <th className="text-right px-3 py-2 font-medium">Value</th>
                            <th className="text-right px-3 py-2 font-medium">AE</th>
                            <th className="text-right px-3 py-2 font-medium">Close</th>
                            <th className="text-right px-3 py-2 font-medium">Stage</th>
                            <th className="text-right px-3 py-2 font-medium">Days in Stage</th>
                            <th className="text-right px-3 py-2 font-medium">Last Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dealsForFunnel.length > 0 ? (
                            dealsForFunnel.map((d) => (
                              <tr key={d.deal_id} className="border-b border-border last:border-0">
                                <td className="px-3 py-2 whitespace-nowrap text-left">{d.account_name} / {d.deal_name}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(d.amount)}</td>
                                <td className="px-3 py-2 text-right">{d.owner_name}</td>
                                <td className="px-3 py-2 text-right">{new Date(d.close_date).toLocaleDateString()}</td>
                                <td className="px-3 py-2 text-right">{d.stage_name}</td>
                                <td className="px-3 py-2 text-right">{d.stage_dwell_days || 0}d</td>
                                <td className="px-3 py-2 text-right">{d.staleness_days}d ago</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">No deals.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
                setKpiDialog({ label: 'Stage Conversion Funnel', content, size: 'large' });
              }}
            >
              View details →
            </Button>
          </div>
          <>
              <div className="space-y-1.5">
                {stageAgg.map((s, idx) => {
                  const widthPct = widthPercents[idx];
                  const widthFillPct = maxRev > 0 ? Math.round((s.revenue * 100) / maxRev) : 0;
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
                        <span className="text-xs text-muted-foreground w-24 shrink-0 inline-flex items-center">
                          <span className="truncate">{s.stage}</span>
                          {(flagSlow || flagRev) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="inline-flex items-center justify-center cursor-pointer hover:opacity-80 ml-1"
                                  onClick={() => setStageDialog({ stage: s.stage })}
                                  role="button"
                                  aria-label="Open Slow Revenue details"
                                >
                                  <AlertTriangle className="h-4 w-4 text-[#FF8E1C]" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">Slow Revenue</TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                        <div className="ml-auto flex items-center gap-6">
                          <span className="text-xs text-muted-foreground">{s.count} deals</span>
                          <span className="text-xs font-medium text-foreground">{formatCurrency(s.revenue)}</span>
                        </div>
                      </div>
                      {(() => {
                        const barColor = '#605BFF';
                        return (
                          <div
                            className="text-[11px] cursor-pointer"
                            onClick={() => setStageDialog({ stage: s.stage })}
                            role="button"
                            aria-label={`Open ${s.stage} details`}
                          >
                            <div className="relative w-full h-9 bg-secondary/60 rounded-lg overflow-hidden">
                              {widthFillPct > 0 && (
                                <div
                                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3"
                                  style={{ width: `${widthFillPct}%`, backgroundColor: barColor }}
                                >
                                  {widthPct >= 10 && (
                                    <span className="text-xs font-bold text-white">{widthPct}%</span>
                                  )}
                                </div>
                              )}
                              {widthPct < 10 && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                  {widthPct}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-10 gap-2 text-[11px] text-muted-foreground">
                <div className="sm:col-span-4">
                  <div>Biggest drop-off</div>
                  <div className="text-foreground">
                    {biggestDropIdx >= 0 ? `${stageAgg[biggestDropIdx].stage} → ${stageAgg[biggestDropIdx + 1].stage} (${conv[biggestDropIdx]}%)` : '—'}
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <div>Most revenue</div>
                  <div className="text-foreground">
                    {stageAgg[highestRevIdx]?.stage} ({formatCurrency(stageAgg[highestRevIdx]?.revenue || 0)})
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <div>Slowest stage</div>
                  <div className="text-foreground">
                    {stageAgg[slowestIdx]?.stage} ({stageAgg[slowestIdx]?.avgDwell || 0}d avg)
                  </div>
                </div>
              </div>
            </>
        </div>
        <Dialog open={!!stageDialog} onOpenChange={(open) => setStageDialog(open ? stageDialog : null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{stageDialog?.stage} — Stage Insights</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {stageDialog && (() => {
                const s = stageAgg.find(x => x.stage === stageDialog.stage) || { stage: stageDialog.stage, revenue: 0, count: 0, avgDwell: 0 };
                const idx = stageAgg.findIndex(x => x.stage === stageDialog.stage);
                const convPct = idx >= 0 ? conv[idx] : 0;
                const b = bench[s.stage] ?? 0;
                const deals = dealsForFunnel.filter(d => d.stage_name === stageDialog.stage);
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="rounded bg-secondary/40 p-3">
                        <div className="text-muted-foreground">Revenue</div>
                        <div className="text-foreground font-medium">{formatCurrency(s.revenue)}</div>
                      </div>
                      <div className="rounded bg-secondary/40 p-3">
                        <div className="text-muted-foreground">Deals count</div>
                        <div className="text-foreground font-medium">{s.count}</div>
                      </div>
                      <div className="rounded bg-secondary/40 p-3">
                        <div className="text-muted-foreground">% conversion</div>
                        <div className="text-foreground font-medium">{convPct}%</div>
                      </div>
                      <div className={`rounded bg-secondary/40 p-3 ${s.avgDwell > b && b > 0 ? 'ring-1 ring-status-amber' : ''}`}>
                        <div className="text-muted-foreground">Avg time in stage</div>
                        <div className="text-foreground font-medium">{s.avgDwell}d</div>
                        <div className="text-muted-foreground">Benchmark {b}d</div>
                      </div>
                    </div>
                    <div className="rounded overflow-hidden">
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
              <Button variant="outline" size="sm" className="text-xs hover:bg-muted hover:text-muted-foreground" onClick={() => setStageDialog(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Attention Queue</h2>
              <p className="text-xs text-muted-foreground">Top deals needing action this {unitLabel}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-transparent hover:text-[#FF8E1C]" onClick={() => navigate('/queue')}>
              View all deals →
            </Button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {attentionQueueDeals.map((deal) => (
              <DealRow
                key={deal.deal_id}
                deal={deal}
                compact
                pinned={pinnedDealIds.includes(deal.deal_id)}
                onPin={() => {
                  setPinnedDealIds((prev) =>
                    prev.includes(deal.deal_id)
                      ? prev.filter((id) => id !== deal.deal_id)
                      : [...prev, deal.deal_id]
                  );
                }}
                onStart={() => navigate('/session')}
                onDealClick={(d) => {
                  const content = (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{d.account_name} / {d.deal_name}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">{formatCurrency(d.amount)}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Owner:</span> {d.owner_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Stage:</span> {d.stage_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Close:</span> {new Date(d.close_date).toLocaleDateString()}
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
                  );
                  setAnalyticsDeal(d);
                  setKpiDialog({ label: 'Analytics', content, size: 'large' });
                }}
                onRiskClick={(d) => {
                  const content = (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{d.account_name} / {d.deal_name}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">{formatCurrency(d.amount)}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Owner:</span> {d.owner_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Stage:</span> {d.stage_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Close:</span> {new Date(d.close_date).toLocaleDateString()}
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
                  );
                  setAnalyticsDeal(d);
                  setKpiDialog({ label: 'Analytics', content, size: 'large' });
                }}
              />
            ))}
          </div>
        </div>

        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Commit Queue</h2>
              <p className="text-xs text-muted-foreground">Deals in Commit this {unitLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[11px] text-muted-foreground">
                Coverage {formatCurrency(commitCoverageAE)}
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
                View all deals →
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
                pinned={pinnedDealIds.includes(deal.deal_id)}
                onPin={() => {
                  setPinnedDealIds((prev) =>
                    prev.includes(deal.deal_id)
                      ? prev.filter((id) => id !== deal.deal_id)
                      : [...prev, deal.deal_id]
                  );
                }}
                onStart={() => navigate('/session')}
                onDealClick={(d) => {
                  const content = (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{d.account_name} / {d.deal_name}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">{formatCurrency(d.amount)}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Owner:</span> {d.owner_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Stage:</span> {d.stage_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Close:</span> {new Date(d.close_date).toLocaleDateString()}
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
                  );
                  setAnalyticsDeal(d);
                  setKpiDialog({ label: 'Analytics', content, size: 'large' });
                }}
                onRiskClick={(d) => {
                  const content = (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{d.account_name} / {d.deal_name}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">{formatCurrency(d.amount)}</span>
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Owner:</span> {d.owner_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Stage:</span> {d.stage_name}
                        <span className="mx-2">·</span>
                        <span className="text-foreground">Close:</span> {new Date(d.close_date).toLocaleDateString()}
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
                  );
                  setAnalyticsDeal(d);
                  setKpiDialog({ label: 'Analytics', content, size: 'large' });
                }}
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
      <Dialog open={!!kpiDialog} onOpenChange={(open) => setKpiDialog(open ? kpiDialog : null)}>
        <DialogContent className={kpiDialog?.size === 'large' ? 'max-w-[95vw] w-[95vw] h-[70vh] flex flex-col' : undefined}>
          <DialogHeader className={kpiDialog?.size === 'large' ? 'shrink-0 px-4 py-3' : undefined}>
            <DialogTitle>{kpiDialog?.label} — Details</DialogTitle>
          </DialogHeader>
          {kpiDialog?.size === 'large' ? (
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {kpiDialog?.content}
            </div>
          ) : (
            kpiDialog?.content
          )}
          <DialogFooter className={kpiDialog?.size === 'large' ? 'shrink-0 px-4 py-3' : undefined}>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted hover:text-muted-foreground" onClick={() => setKpiDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      

      
    </div>
  );
}
