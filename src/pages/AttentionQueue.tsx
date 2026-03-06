import { useMemo, useState } from "react";
import { Search, Download, ArrowUpDown, Shield, Clock, AlertTriangle, Users, Map, FileText, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/sam/PageHeader";
import { DealRow } from "@/components/sam/DealRow";
import { RiskChipSet } from "@/components/sam/RiskChip";
import { ForecastBadge } from "@/components/sam/StatusDot";
import { mockDeals, type Deal } from "@/data/mock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export default function AttentionQueue() {
  const [selectedDeal, setSelectedDeal] = useState<Deal>(mockDeals[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<"This week" | "This month" | "This quarter">("This month");
  const cfg = timeRange === "This week" ? { staleCur: 7 } : timeRange === "This quarter" ? { staleCur: 90 } : { staleCur: 30 };
  const filteredDeals = useMemo(() => {
    const base = mockDeals.filter(d => d.staleness_days <= cfg.staleCur);
    return base.filter(d =>
      d.deal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.account_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [timeRange, searchQuery]);
  const riskFilterOptions = ['Commit at Risk', 'Stage Stuck', 'No Next Step', 'Close Date Moved', 'Single Threaded'];
  const [selectedRisks, setSelectedRisks] = useState<string[]>(riskFilterOptions);
  const [forecastFilter, setForecastFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Attention Queue" subtitle="Ranked deals needing action" />

      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 px-4 sm:px-6 py-2 border-b border-border bg-card/50">
        <div className="flex-shrink-0">
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(['This week','This month','This quarter'] as const).map((label) => (
              <button
                key={label}
                onClick={() => setTimeRange(label)}
                className={`rounded-none text-xs h-8 px-3 ${
                  timeRange === label
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-primary/60 hover:text-primary-foreground active:bg-primary active:text-primary-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 min-w-[240px] max-w-[420px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-full text-xs bg-secondary border-border"
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <button className="min-w-[170px] h-8 text-xs rounded-md border border-input bg-transparent px-3 inline-flex items-center justify-between ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/10 active:bg-primary/15 data-[state=open]:bg-primary/15">
                <span className="truncate">
                  Risk Type: {selectedRisks.length === riskFilterOptions.length ? 'All' : `${selectedRisks.length} selected`}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-1 w-56">
              <div
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-primary/10 focus:bg-primary/60 focus:text-primary-foreground"
                onClick={() =>
                  setSelectedRisks(selectedRisks.length === riskFilterOptions.length ? [] : riskFilterOptions)
                }
                role="button"
                tabIndex={0}
              >
                <Checkbox
                  checked={selectedRisks.length === riskFilterOptions.length}
                  onCheckedChange={(checked) => setSelectedRisks(checked ? riskFilterOptions : [])}
                  onClick={(e) => e.stopPropagation()}
                  className="mr-2"
                />
                <span className="truncate">All</span>
              </div>
              {riskFilterOptions.map((label) => (
                <div
                  key={label}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-primary/10 focus:bg-primary/60 focus:text-primary-foreground"
                  onClick={() =>
                    setSelectedRisks((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
                  }
                  role="button"
                  tabIndex={0}
                >
                  <Checkbox
                    checked={selectedRisks.includes(label)}
                    onCheckedChange={(checked) =>
                      setSelectedRisks((prev) => (checked ? [...prev, label] : prev.filter((x) => x !== label)))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2"
                  />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-shrink-0">
          <Select value={forecastFilter} onValueChange={setForecastFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-transparent">
              <SelectValue placeholder="Forecast category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="COMMIT">Commit</SelectItem>
              <SelectItem value="BEST_CASE">Best Case</SelectItem>
              <SelectItem value="PIPELINE">Pipeline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-shrink-0">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-transparent">
              <SelectValue placeholder="Stage filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Discovery">Discovery</SelectItem>
              <SelectItem value="Validation">Validation</SelectItem>
              <SelectItem value="Proposal">Proposal</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Close">Close</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center justify-end gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
              aria-label="Reset"
              onClick={() => {
                setSearchQuery("");
                setForecastFilter("all");
                setStageFilter("all");
                setSelectedRisks(riskFilterOptions);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-muted-foreground" aria-label="Sort">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Sort</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-muted-foreground" aria-label="Export">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Export</TooltipContent>
            </Tooltip>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Left: Deal list */}
        <div className="w-full lg:w-[58%] border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sorted by: Manager Impact</span>
            <span className="text-xs text-muted-foreground">{filteredDeals.length} deals flagged</span>
          </div>
          {filteredDeals.map((deal) => (
            <DealRow
              key={deal.deal_id}
              deal={deal}
              selected={selectedDeal?.deal_id === deal.deal_id}
              onClick={() => setSelectedDeal(deal)}
              onPin={() => {}}
            />
          ))}
        </div>

        {/* Right: Deal detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedDeal && (
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-foreground">{selectedDeal.deal_name}</h2>
                  <ForecastBadge category={selectedDeal.forecast_category} />
                </div>
                <p className="text-sm text-muted-foreground">{selectedDeal.account_name} · {selectedDeal.owner_name}</p>
              </div>

              <Tabs defaultValue="summary" className="w-full">
              <TabsList className="bg-muted w-full justify-between gap-0 h-9 p-0.5 flex-wrap">
                  <TabsTrigger value="summary" className="text-xs data-[state=active]:bg-card flex-1">Summary</TabsTrigger>
                  <TabsTrigger value="evidence" className="text-xs data-[state=active]:bg-card flex-1">Evidence</TabsTrigger>
                  <TabsTrigger value="stakeholders" className="text-xs data-[state=active]:bg-card flex-1">Stakeholders</TabsTrigger>
                  <TabsTrigger value="map" className="text-xs data-[state=active]:bg-card flex-1">MAP</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs data-[state=active]:bg-card flex-1">History</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-4 space-y-4">
                  {/* Why flagged */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3" />Why Flagged
                    </h3>
                    <ul className="space-y-1 text-sm text-foreground">
                      {selectedDeal.risk_reasons.map((r) => (
                        <li key={r.code} className="flex items-start gap-2">
                          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${r.severity === 'RED' ? 'bg-status-red' : 'bg-status-amber'}`} />
                          {r.label}
                        </li>
                      ))}
                      {selectedDeal.risk_reasons.length === 0 && (
                        <li className="text-muted-foreground">No active risks</li>
                      )}
                    </ul>
                  </div>

                  {/* Recommended action */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommended Action</h3>
                    <p className="text-sm text-foreground">
                      {selectedDeal.risk_level === 'RED'
                        ? 'Schedule executive review and confirm buyer commitment this week.'
                        : 'Review next steps and validate timeline with champion.'}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-xs h-7">Reclassify Forecast</Button>
                      <Button variant="secondary" size="sm" className="text-xs h-7">Request AE Update</Button>
                      <Button variant="secondary" size="sm" className="text-xs h-7">Add to 1:1</Button>
                    </div>
                  </div>

                  {/* Key fields */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Fields</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between py-1.5 px-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">Stage</span>
                        <span className="text-foreground font-medium">{selectedDeal.stage_name}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">Close Date</span>
                        <span className="text-foreground font-medium">{selectedDeal.close_date}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">Dwell Days</span>
                        <span className="text-foreground font-medium">{selectedDeal.stage_dwell_days}d</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">Staleness</span>
                        <span className="text-foreground font-medium">{selectedDeal.staleness_days}d</span>
                      </div>
                    </div>
                  </div>

                  {/* Next step */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Step Status</h3>
                    {selectedDeal.next_step ? (
                      <div className="text-sm space-y-1">
                        <p className="text-foreground">{selectedDeal.next_step.description}</p>
                        <p className="text-muted-foreground">Date: {selectedDeal.next_step.date} · {selectedDeal.next_step.is_buyer_confirmed ? '✓ Buyer confirmed' : '⚠ Not confirmed'}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-status-red">No buyer next step defined</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="evidence" className="mt-4 space-y-3">
                  {[
                    { title: 'Discovery Call — Budget Discussion', time: '2:34', date: 'Feb 18', excerpt: '"We have budget allocated for Q1 but need VP sign-off..."' },
                    { title: 'Follow-up Meeting — Technical Review', time: '14:22', date: 'Feb 25', excerpt: '"The security team has concerns about data residency..."' },
                    { title: 'Email Thread — Pricing Proposal', time: '', date: 'Mar 1', excerpt: '"Attached is the revised pricing based on our discussion..."' },
                  ].map((e, i) => (
                    <div key={i} className="rounded-md border border-border p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{e.title}</span>
                        <span className="text-xs text-muted-foreground">{e.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">{e.excerpt}</p>
                      <Button variant="ghost" size="sm" className="text-xs h-6 text-primary p-0 hover:bg-transparent hover:text-[#FF8E1C]">Open recording →</Button>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="stakeholders" className="mt-4 space-y-3">
                  {[
                    { role: 'Economic Buyer', name: 'Unknown', status: 'MISSING' as const },
                    { role: 'Champion', name: 'Jennifer Park (Dir. Ops)', status: 'CONFIRMED' as const },
                    { role: 'Blocker', name: 'IT Security Team', status: 'SUSPECTED' as const },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                      <div>
                        <span className="text-sm font-medium text-foreground">{s.role}</span>
                        <p className="text-xs text-muted-foreground">{s.name}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.status === 'CONFIRMED' ? 'bg-status-green-bg text-status-green' :
                        s.status === 'MISSING' ? 'bg-status-red-bg text-status-red' :
                        'bg-status-amber-bg text-status-amber'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />Assign Stakeholder
                  </Button>
                </TabsContent>

                <TabsContent value="map" className="mt-4 space-y-3">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Map className="h-3 w-3" />Status: Not Started
                  </div>
                  {[
                    { title: 'Technical evaluation complete', owner: 'AE', due: '2026-03-10', status: 'IN_PROGRESS' },
                    { title: 'Security review approval', owner: 'Buyer', due: '2026-03-15', status: 'NOT_STARTED' },
                    { title: 'Commercial terms agreed', owner: 'AE', due: '2026-03-20', status: 'NOT_STARTED' },
                    { title: 'Contract signed', owner: 'Buyer', due: '2026-03-28', status: 'NOT_STARTED' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-md border border-border">
                      <div className={`h-2 w-2 rounded-full ${m.status === 'IN_PROGRESS' ? 'bg-status-amber' : 'bg-muted-foreground/30'}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-foreground">{m.title}</span>
                        <div className="text-xs text-muted-foreground">{m.owner} · Due {m.due}</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" className="text-xs">Add Milestone</Button>
                </TabsContent>

                <TabsContent value="history" className="mt-4 space-y-2">
                  {[
                    { date: 'Mar 1', event: 'Stage changed: Proposal → Negotiation' },
                    { date: 'Feb 22', event: 'Close date moved: Mar 15 → Mar 28' },
                    { date: 'Feb 18', event: 'Forecast: Best Case → Commit' },
                    { date: 'Feb 10', event: 'Stage changed: Validation → Proposal' },
                    { date: 'Jan 28', event: 'Deal created' },
                  ].map((h, i) => (
                    <div key={i} className="flex items-start gap-3 py-1.5">
                      <span className="text-xs text-muted-foreground w-14 shrink-0">{h.date}</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      <span className="text-sm text-foreground">{h.event}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
