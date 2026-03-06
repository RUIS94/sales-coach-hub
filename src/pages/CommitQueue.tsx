import { useEffect, useMemo, useState } from "react";
import { Download, ArrowUpDown, Search, ChevronLeft, ChevronRight, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sam/PageHeader";
import { mockDeals, formatCurrency, type Deal } from "@/data/mock";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SortKey = "risk" | "closeDate" | "amount";

export default function CommitQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [atRiskOnly, setAtRiskOnly] = useState(searchParams.get("atRiskOnly") === "true");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<"This week" | "This month" | "This quarter">("This month");

  const cfg =
    timeRange === "This week"
      ? { staleCur: 7 }
      : timeRange === "This quarter"
      ? { staleCur: 90 }
      : { staleCur: 30 };

  const allCommitDeals = useMemo(() => {
    return mockDeals.filter((d) => d.forecast_category === "COMMIT" && d.staleness_days <= cfg.staleCur);
  }, [timeRange]);

  const isAtRisk = (d: Deal) => {
    const nonGreen = d.risk_level !== "GREEN";
    const slippage = d.risk_reasons.some((r) => r.code === "CLOSE_DATE_MOVED");
    const missingEB = d.risk_reasons.some((r) => r.code === "MISSING_EB");
    const noMap = d.risk_reasons.some((r) => r.code === "NO_MAP");
    const singleThread = d.risk_reasons.some((r) => r.code === "SINGLE_THREADED");
    const days = Math.ceil((new Date(d.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const nextStepRisk = (!d.next_step || !d.next_step.is_buyer_confirmed) && days <= 21;
    return nonGreen || slippage || missingEB || noMap || singleThread || nextStepRisk;
  };

  const filtered = useMemo(() => {
    let base = atRiskOnly ? allCommitDeals.filter(isAtRisk) : allCommitDeals.slice();
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      base = base.filter(
        (d) =>
          d.deal_name.toLowerCase().includes(q) ||
          d.account_name.toLowerCase().includes(q) ||
          d.owner_name.toLowerCase().includes(q),
      );
    }
    if (stageFilter !== "all") {
      base = base.filter((d) => d.stage_name === stageFilter);
    }
    if (ownerFilter !== "all") {
      base = base.filter((d) => d.owner_name === ownerFilter);
    }
    const rank: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };
    base.sort((a, b) => {
      if (sortKey === "risk") {
        const ra = rank[a.risk_level] ?? 3;
        const rb = rank[b.risk_level] ?? 3;
        if (ra !== rb) return ra - rb;
        const da = new Date(a.close_date).getTime();
        const db = new Date(b.close_date).getTime();
        if (da !== db) return da - db;
        return b.amount - a.amount;
      }
      if (sortKey === "closeDate") {
        const da = new Date(a.close_date).getTime();
        const db = new Date(b.close_date).getTime();
        if (da !== db) return da - db;
        const ra = rank[a.risk_level] ?? 3;
        const rb = rank[b.risk_level] ?? 3;
        if (ra !== rb) return ra - rb;
        return b.amount - a.amount;
      }
      if (sortKey === "amount") {
        if (a.amount !== b.amount) return b.amount - a.amount;
        const ra = rank[a.risk_level] ?? 3;
        const rb = rank[b.risk_level] ?? 3;
        if (ra !== rb) return ra - rb;
        const da = new Date(a.close_date).getTime();
        const db = new Date(b.close_date).getTime();
        return da - db;
      }
      return 0;
    });
    return base;
  }, [allCommitDeals, atRiskOnly, sortKey, stageFilter, ownerFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageDeals = filtered.slice(pageStart, pageStart + pageSize);

  const coverage = filtered.reduce((s, d) => s + d.amount, 0);
  const atRiskCount = filtered.filter(isAtRisk).length;

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (atRiskOnly) {
      params.set("atRiskOnly", "true");
    } else {
      params.delete("atRiskOnly");
    }
    setSearchParams(params, { replace: true });
  }, [atRiskOnly]);

  const exportCSV = () => {
    const header = ["Account", "Deal", "Owner", "Stage", "Amount", "Close In (days)", "Confidence", "Buyer Next Step", "Buyer Confirmed", "Slippage", "EB", "MAP", "Threading"];
    const rows = filtered.map((d) => {
      const daysToClose = Math.ceil((new Date(d.close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const confidence = d.risk_level === "GREEN" ? "High" : d.risk_level === "AMBER" ? "Medium" : "Low";
      const hasSlippage = d.risk_reasons.some((r) => r.code === "CLOSE_DATE_MOVED");
      const hasMissingEB = d.risk_reasons.some((r) => r.code === "MISSING_EB");
      const hasNoMap = d.risk_reasons.some((r) => r.code === "NO_MAP");
      const singleThreaded = d.risk_reasons.some((r) => r.code === "SINGLE_THREADED");
      return [
        d.account_name,
        d.deal_name,
        d.owner_name,
        d.stage_name,
        d.amount,
        daysToClose,
        confidence,
        d.next_step?.description ?? "",
        d.next_step ? (d.next_step.is_buyer_confirmed ? "Yes" : "No") : "",
        hasSlippage ? "Yes" : "No",
        hasMissingEB ? "Missing" : "OK",
        hasNoMap ? "Missing" : "OK",
        singleThreaded ? "Single" : "Multi",
      ];
    });
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commit-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="Commit Queue" subtitle="All deals in Commit">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-muted-foreground">
            Coverage {formatCurrency(coverage)}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-muted-foreground cursor-pointer hover:bg-primary/10 hover:text-foreground"
            onClick={() => setAtRiskOnly(true)}
            role="button"
            aria-label="Filter At Risk only"
            title="Filter At Risk only"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-status-amber" />
            At Risk {atRiskCount}
          </span>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 py-2 border-b border-border bg-card/50">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
          <div className="flex-shrink-0">
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              {(['This week','This month','This quarter'] as const).map((label) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRange(label)}
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

          <div className="relative flex-1 min-w-[220px] max-w-[420px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search account / deal / owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-full text-xs bg-secondary border-border"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-transparent">
              <SelectValue placeholder="Stage filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {Array.from(new Set(allCommitDeals.map((d) => d.stage_name))).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-transparent">
              <SelectValue placeholder="Owner filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {Array.from(new Set(allCommitDeals.map((d) => d.owner_name))).map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
            <Checkbox checked={atRiskOnly} onCheckedChange={(v) => setAtRiskOnly(Boolean(v))} />
            At Risk only
          </label>

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
              aria-label="Reset"
              onClick={() => {
                setSearchQuery("");
                setStageFilter("all");
                setOwnerFilter("all");
                setAtRiskOnly(false);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-muted-foreground" aria-label="Sort">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <DropdownMenuRadioItem value="risk">Risk</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="closeDate">Close Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                  aria-label="Export"
                  onClick={exportCSV}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Export</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4">

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">Account / Deal</th>
                <th className="text-left px-3 py-2 font-medium">Owner</th>
                <th className="text-left px-3 py-2 font-medium">Stage</th>
                <th className="text-left px-3 py-2 font-medium">Close In</th>
                <th className="text-right px-3 py-2 font-medium">Amount</th>
                <th className="text-left px-3 py-2 font-medium">Confidence</th>
                <th className="text-left px-3 py-2 font-medium">Next Step</th>
                <th className="text-left px-3 py-2 font-medium">Slippage</th>
                <th className="text-left px-3 py-2 font-medium">EB</th>
                <th className="text-left px-3 py-2 font-medium">MAP</th>
                <th className="text-left px-3 py-2 font-medium">Threading</th>
              </tr>
            </thead>
            <tbody>
              {pageDeals.map((d) => (
                <tr
                  key={d.deal_id}
                  className={`border-b border-border last:border-0 hover:bg-primary/10 active:bg-primary/15 transition-colors ${isAtRisk(d) ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{d.account_name}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-secondary-foreground">{d.deal_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">{d.owner_name}</td>
                  <td className="px-3 py-2.5">{d.stage_name}</td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const days = Math.ceil((new Date(d.close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return `${days}d`;
                    })()}
                  </td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(d.amount)}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${d.risk_level === 'GREEN' ? 'bg-status-green' : d.risk_level === 'AMBER' ? 'bg-status-amber' : 'bg-status-red'}`} />
                      {d.risk_level === 'GREEN' ? 'High' : d.risk_level === 'AMBER' ? 'Medium' : 'Low'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${!d.next_step ? 'bg-muted-foreground' : d.next_step.is_buyer_confirmed ? 'bg-status-green' : 'bg-status-amber'}`} />
                        {!d.next_step ? "No step" : d.next_step.is_buyer_confirmed ? "Buyer confirmed" : "Buyer not confirmed"}
                      </span>
                      <span className="text-muted-foreground">{d.next_step?.date ?? ""}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const has = d.risk_reasons.some((r) => r.code === "CLOSE_DATE_MOVED");
                      return <span className={`inline-flex items-center gap-1 ${has ? 'text-foreground' : 'text-muted-foreground'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${has ? 'bg-status-amber' : 'bg-muted-foreground'}`} />
                        {has ? 'Yes' : 'No'}
                      </span>;
                    })()}
                  </td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const missing = d.risk_reasons.some((r) => r.code === "MISSING_EB");
                      return <span className="inline-flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${missing ? 'bg-status-red' : 'bg-status-green'}`} />
                        {missing ? 'Missing' : 'OK'}
                      </span>;
                    })()}
                  </td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const missing = d.risk_reasons.some((r) => r.code === "NO_MAP");
                      return <span className="inline-flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${missing ? 'bg-status-red' : 'bg-status-green'}`} />
                        {missing ? 'Missing' : 'OK'}
                      </span>;
                    })()}
                  </td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const single = d.risk_reasons.some((r) => r.code === "SINGLE_THREADED");
                      return <span className="inline-flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${single ? 'bg-status-red' : 'bg-status-green'}`} />
                        {single ? 'Single' : 'Multi'}
                      </span>;
                    })()}
                  </td>
                </tr>
              ))}
              {pageDeals.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-6 text-xs text-muted-foreground text-center">No deals match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="inline-flex items-center gap-1">
              {totalPages === 1 ? (
                <span className="px-2 py-1 text-[#605BFF]">1</span>
              ) : (
                Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`px-2 py-1 text-xs ${
                      n === page ? 'text-[#605BFF] font-medium' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-current={n === page ? 'page' : undefined}
                  >
                    {n}
                  </button>
                ))
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="ml-3 relative inline-flex items-center">
              <select
                className="h-7 bg-transparent text-foreground text-xs outline-none appearance-none pr-9"
                value={pageSize}
                onChange={(e) => {
                  const size = Number(e.target.value);
                  setPageSize(size);
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>{`${n}/page`}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Total {filtered.length}</div>
        </div>
      </div>
    </div>
  );
}
