import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Bell, CheckCircle2, ChevronDown, ChevronRight, Save as SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sam/PageHeader";
import { RiskChipSet } from "@/components/sam/RiskChip";
import { ForecastBadge } from "@/components/sam/StatusDot";
import { mockDeals, formatCurrency } from "@/data/mock";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const topDeals = mockDeals.slice(0, 3);
const prepQuestions = [
  { id: '1', prompt: 'What changed in your pipeline this week?', required: true },
  { id: '2', prompt: 'Which deals are you most confident about?', required: true },
  { id: '3', prompt: 'Any deals you want to remove from Commit?', required: false },
  { id: '4', prompt: 'What help do you need from me this week?', required: true },
  { id: '5', prompt: 'Any competitive threats surfaced?', required: false },
];

export default function PrepPack() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedDeal, setExpandedDeal] = useState<string | null>(topDeals[0].deal_id);
  const completedFields = 7;
  const totalFields = 10;
  const [dealFields, setDealFields] = useState<Record<string, {
    buyerNextStepDesc: string;
    buyerNextStepDate: string;
    stakeholders: "CONFIRMED" | "MISSING" | "UNKNOWN";
    mapStatus: "IN_PROGRESS" | "NOT_STARTED";
    quantifiedValue: string;
  }>>(Object.fromEntries(topDeals.map((d) => [d.deal_id, {
    buyerNextStepDesc: "",
    buyerNextStepDate: "",
    stakeholders: "UNKNOWN",
    mapStatus: "NOT_STARTED",
    quantifiedValue: "",
  }])));
  const [fieldDialog, setFieldDialog] = useState<{
    dealId: string;
    field: "NEXT_STEP" | "STAKEHOLDERS" | "MAP_STATUS" | "QUANTIFIED_VALUE";
  } | null>(null);
  const [summaryDialog, setSummaryDialog] = useState<null | { type: "FLAGGED" | "OVERDUE" | "AGENDA"; agendaItem?: string }>(null);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Prep Pack — Sarah Chen" subtitle="Weekly · Mar 3–7, 2026">
        <Button size="sm" onClick={() => navigate('/session')}>
          <Play className="h-3.5 w-3.5 mr-1.5" />Start 1:1
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="hover:bg-primary/10 active:bg-primary/15 transition-colors"
          onClick={() =>
            toast({
              title: "Saved",
              description: "Your prep pack changes have been saved.",
            })
          }
        >
          <SaveIcon className="h-3.5 w-3.5 mr-1.5" />Save
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="hover:bg-primary/10 active:bg-primary/15 transition-colors"
          onClick={() =>
            toast({
              title: "Reminder sent",
              description: "A reminder has been sent to the AE.",
            })
          }
        >
          <Bell className="h-3.5 w-3.5 mr-1.5" />Send Reminder
        </Button>
      </PageHeader>

      {/* Progress bar */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-border">
        <div className="flex-1 flex items-center gap-3">
          <Progress value={(completedFields / totalFields) * 100} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{completedFields}/{totalFields} complete</span>
        </div>
        <Button variant="secondary" size="sm" className="text-xs" disabled={completedFields < totalFields}>
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Mark Prep Complete
        </Button>
      </div>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Left: Main content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Top 3 Deals */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Top 3 Deals by Impact</h2>
            <div className="space-y-2">
              {topDeals.map((deal) => {
                const isExpanded = expandedDeal === deal.deal_id;
                return (
                  <div key={deal.deal_id} className="rounded-lg border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => setExpandedDeal(isExpanded ? null : deal.deal_id)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-primary/10 active:bg-primary/15 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{deal.account_name} / {deal.deal_name}</span>
                            <ForecastBadge category={deal.forecast_category} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatCurrency(deal.amount)} · {deal.stage_name} · Close {deal.close_date}
                          </div>
                        </div>
                      </div>
                      <RiskChipSet risks={deal.risk_reasons} max={2} />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                        {/* Must answer */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Must Answer Before 1:1</h4>
                          <div className="space-y-2">
                            {['What is the buyer\'s decision timeline?', 'Who is the economic buyer?', 'Is there a mutual action plan?'].map((q, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-xs text-muted-foreground mt-1 w-4">{i + 1}.</span>
                                <div className="flex-1">
                                  <p className="text-sm text-foreground">{q}</p>
                                  <input
                                    className="mt-1 w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground placeholder:text-muted-foreground"
                                    placeholder="Type answer..."
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Required fields */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Fields</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <button
                              type="button"
                              className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded hover:bg-primary/10 active:bg-primary/15 transition-colors"
                              onClick={() => setFieldDialog({ dealId: deal.deal_id, field: "NEXT_STEP" })}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${dealFields[deal.deal_id].buyerNextStepDesc && dealFields[deal.deal_id].buyerNextStepDate ? 'bg-status-green' : 'bg-status-red'}`} />
                              <span className="text-muted-foreground">Buyer Next Step</span>
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded hover:bg-primary/10 active:bg-primary/15 transition-colors"
                              onClick={() => setFieldDialog({ dealId: deal.deal_id, field: "STAKEHOLDERS" })}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${dealFields[deal.deal_id].stakeholders === 'CONFIRMED' ? 'bg-status-green' : dealFields[deal.deal_id].stakeholders === 'MISSING' ? 'bg-status-red' : 'bg-status-amber'}`} />
                              <span className="text-muted-foreground">Stakeholders (EB/Champion)</span>
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded hover:bg-primary/10 active:bg-primary/15 transition-colors"
                              onClick={() => setFieldDialog({ dealId: deal.deal_id, field: "MAP_STATUS" })}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${dealFields[deal.deal_id].mapStatus === 'IN_PROGRESS' ? 'bg-status-green' : 'bg-status-red'}`} />
                              <span className="text-muted-foreground">MAP Status</span>
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded hover:bg-primary/10 active:bg-primary/15 transition-colors"
                              onClick={() => setFieldDialog({ dealId: deal.deal_id, field: "QUANTIFIED_VALUE" })}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${dealFields[deal.deal_id].quantifiedValue ? 'bg-status-green' : 'bg-status-red'}`} />
                              <span className="text-muted-foreground">Quantified Value</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" className="text-xs" onClick={() => navigate('/queue')}>Open Deal Details</Button>
                          <Button variant="secondary" size="sm" className="text-xs">Update Fields</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Questions */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Question Set</h2>
            <div className="space-y-3">
              {prepQuestions.map((q) => (
                <div key={q.id} className="space-y-1">
                  <label className="text-sm text-foreground flex items-center gap-1">
                    {q.prompt}
                    {q.required && <span className="text-status-red text-xs">*</span>}
                  </label>
                  <input
                    className="w-full h-8 rounded-md border border-border bg-secondary px-3 text-xs text-foreground placeholder:text-muted-foreground"
                    placeholder="Type answer..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail: Session Summary */}
        <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-border overflow-y-auto p-4 space-y-4 shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Session Summary</h2>

          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Commit deals closing', value: '4 · $861K', clickable: false },
              { label: 'Deals flagged', value: '3', clickable: true, type: 'FLAGGED' as const },
              { label: 'Overdue actions', value: '5', clickable: true, type: 'OVERDUE' as const },
            ].map((c) => (
              <button
                key={c.label}
                type="button"
                className={`flex justify-between py-2 px-3 rounded-md bg-muted/50 ${c.clickable ? 'hover:bg-primary/10 active:bg-primary/15 cursor-pointer' : ''}`}
                onClick={() => {
                  if (c.clickable && c.type) setSummaryDialog({ type: c.type });
                }}
              >
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <span className="text-xs font-semibold text-foreground">{c.value}</span>
              </button>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agenda Outline</h3>
            <div className="space-y-1">
              {['Snapshot', 'Forecast Truth', 'Deal 1: Acme Corp', 'Deal 2: TechFlow Inc', 'Deal 3: GlobalBank', 'Coaching Focus', 'Wrap-up'].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex items-center gap-2 py-1.5 px-2 rounded text-xs text-foreground hover:bg-primary/10 active:bg-primary/15 cursor-pointer transition-colors w-full text-left"
                  onClick={() => setSummaryDialog({ type: 'AGENDA', agendaItem: item })}
                >
                  <span className="text-muted-foreground w-4">{i + 1}.</span>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
            <textarea
              className="w-full h-24 rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground resize-none"
              placeholder="Pre-session notes..."
            />
          </div>
        </div>
      </div>
      <Dialog open={!!fieldDialog} onOpenChange={(open) => { if (!open) setFieldDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {fieldDialog?.field === "NEXT_STEP" && "Update Buyer Next Step"}
              {fieldDialog?.field === "STAKEHOLDERS" && "Update Stakeholders"}
              {fieldDialog?.field === "MAP_STATUS" && "Update MAP Status"}
              {fieldDialog?.field === "QUANTIFIED_VALUE" && "Update Quantified Value"}
            </DialogTitle>
          </DialogHeader>
          {fieldDialog?.field === "NEXT_STEP" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Description</div>
                <input
                  className="h-9 w-full rounded-md border border-border bg-secondary px-2 text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="Describe next step"
                  value={dealFields[fieldDialog.dealId].buyerNextStepDesc}
                  onChange={(e) =>
                    setDealFields((prev) => ({
                      ...prev,
                      [fieldDialog.dealId]: { ...prev[fieldDialog.dealId], buyerNextStepDesc: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Date</div>
                <input
                  type="date"
                  className="h-9 w-full rounded-md border border-border bg-secondary px-2 text-sm text-foreground"
                  value={dealFields[fieldDialog.dealId].buyerNextStepDate}
                  onChange={(e) =>
                    setDealFields((prev) => ({
                      ...prev,
                      [fieldDialog.dealId]: { ...prev[fieldDialog.dealId], buyerNextStepDate: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}
          {fieldDialog?.field === "STAKEHOLDERS" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Stakeholders</div>
                <Select
                  value={dealFields[fieldDialog.dealId].stakeholders}
                  onValueChange={(v) =>
                    setDealFields((prev) => ({
                      ...prev,
                      [fieldDialog.dealId]: { ...prev[fieldDialog.dealId], stakeholders: v as "CONFIRMED" | "MISSING" | "UNKNOWN" },
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full text-sm bg-transparent">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="MISSING">Missing</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {fieldDialog?.field === "MAP_STATUS" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">MAP Status</div>
                <Select
                  value={dealFields[fieldDialog.dealId].mapStatus}
                  onValueChange={(v) =>
                    setDealFields((prev) => ({
                      ...prev,
                      [fieldDialog.dealId]: { ...prev[fieldDialog.dealId], mapStatus: v as "IN_PROGRESS" | "NOT_STARTED" },
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full text-sm bg-transparent">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {fieldDialog?.field === "QUANTIFIED_VALUE" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Quantified Value</div>
                <input
                  className="h-9 w-full rounded-md border border-border bg-secondary px-2 text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g., $250K savings"
                  value={dealFields[fieldDialog.dealId].quantifiedValue}
                  onChange={(e) =>
                    setDealFields((prev) => ({
                      ...prev,
                      [fieldDialog.dealId]: { ...prev[fieldDialog.dealId], quantifiedValue: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setFieldDialog(null)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={() => setFieldDialog(null)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!summaryDialog} onOpenChange={(open) => { if (!open) setSummaryDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {summaryDialog?.type === 'FLAGGED' && 'Deals Flagged'}
              {summaryDialog?.type === 'OVERDUE' && 'Overdue Actions'}
              {summaryDialog?.type === 'AGENDA' && summaryDialog.agendaItem}
            </DialogTitle>
          </DialogHeader>
          {summaryDialog?.type === 'FLAGGED' && (
            <div className="space-y-2">
              {mockDeals.filter((d) => Array.isArray(d.risk_reasons) && d.risk_reasons.length > 0).map((d) => (
                <div key={d.deal_id} className="rounded-md border border-border p-2">
                  <div className="text-sm font-medium text-foreground">{d.account_name} / {d.deal_name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.stage_name} · Close {d.close_date}</div>
                  <div className="text-xs mt-1">Risks: {d.risk_reasons.join(", ")}</div>
                </div>
              ))}
              {mockDeals.filter((d) => Array.isArray(d.risk_reasons) && d.risk_reasons.length > 0).length === 0 && (
                <div className="text-xs text-muted-foreground">No flagged deals.</div>
              )}
            </div>
          )}
          {summaryDialog?.type === 'OVERDUE' && (
            <div className="space-y-2">
              {topDeals.filter((d) => {
                const f = dealFields[d.deal_id];
                if (!f || !f.buyerNextStepDate) return false;
                const dt = new Date(f.buyerNextStepDate);
                const now = new Date();
                return dt < now;
              }).map((d) => {
                const f = dealFields[d.deal_id];
                return (
                  <div key={d.deal_id} className="rounded-md border border-border p-2">
                    <div className="text-sm font-medium text-foreground">{d.account_name} / {d.deal_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Next step: {f.buyerNextStepDesc || '—'}</div>
                    <div className="text-xs text-muted-foreground">Due date: {f.buyerNextStepDate || '—'}</div>
                  </div>
                );
              })}
              {topDeals.filter((d) => {
                const f = dealFields[d.deal_id];
                if (!f || !f.buyerNextStepDate) return false;
                const dt = new Date(f.buyerNextStepDate);
                const now = new Date();
                return dt < now;
              }).length === 0 && (
                <div className="text-xs text-muted-foreground">No overdue actions.</div>
              )}
            </div>
          )}
          {summaryDialog?.type === 'AGENDA' && (
            <div className="space-y-2">
              <div className="text-sm text-foreground">Details</div>
              <div className="text-xs text-muted-foreground">This section provides context, talking points, and expected outcomes for {summaryDialog.agendaItem}.</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setSummaryDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
