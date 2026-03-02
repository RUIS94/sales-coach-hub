import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Bell, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sam/PageHeader";
import { RiskChipSet } from "@/components/sam/RiskChip";
import { ForecastBadge } from "@/components/sam/StatusDot";
import { mockDeals, formatCurrency } from "@/data/mock";
import { Progress } from "@/components/ui/progress";

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
  const [expandedDeal, setExpandedDeal] = useState<string | null>(topDeals[0].deal_id);
  const completedFields = 7;
  const totalFields = 10;

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Prep Pack — Sarah Chen" subtitle="Weekly · Mar 3–7, 2026">
        <Button size="sm" onClick={() => navigate('/session')}>
          <Play className="h-3.5 w-3.5 mr-1.5" />Start 1:1
        </Button>
        <Button variant="secondary" size="sm">
          <Bell className="h-3.5 w-3.5 mr-1.5" />Send Reminder
        </Button>
      </PageHeader>

      {/* Progress bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border">
        <div className="flex-1 flex items-center gap-3">
          <Progress value={(completedFields / totalFields) * 100} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{completedFields}/{totalFields} complete</span>
        </div>
        <Button variant="secondary" size="sm" className="text-xs" disabled={completedFields < totalFields}>
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Mark Prep Complete
        </Button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Main content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                      className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors"
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
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded">
                              <span className={`h-1.5 w-1.5 rounded-full ${deal.next_step ? 'bg-status-green' : 'bg-status-red'}`} />
                              <span className="text-muted-foreground">Buyer Next Step</span>
                            </div>
                            <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded">
                              <span className="h-1.5 w-1.5 rounded-full bg-status-amber" />
                              <span className="text-muted-foreground">Stakeholders (EB/Champion)</span>
                            </div>
                            <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded">
                              <span className="h-1.5 w-1.5 rounded-full bg-status-red" />
                              <span className="text-muted-foreground">MAP Status</span>
                            </div>
                            <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded">
                              <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
                              <span className="text-muted-foreground">Quantified Value</span>
                            </div>
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
        <div className="w-[320px] border-l border-border overflow-y-auto p-4 space-y-4 shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Session Summary</h2>

          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Commit deals closing', value: '4 · $861K' },
              { label: 'Deals flagged', value: '3' },
              { label: 'Overdue actions', value: '5' },
            ].map((c) => (
              <div key={c.label} className="flex justify-between py-2 px-3 rounded-md bg-muted/50">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <span className="text-xs font-semibold text-foreground">{c.value}</span>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agenda Outline</h3>
            <div className="space-y-1">
              {['Snapshot', 'Forecast Truth', 'Deal 1: Acme Corp', 'Deal 2: TechFlow Inc', 'Deal 3: GlobalBank', 'Coaching Focus', 'Wrap-up'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded text-xs text-foreground hover:bg-accent/50 cursor-pointer transition-colors">
                  <span className="text-muted-foreground w-4">{i + 1}.</span>
                  {item}
                </div>
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
    </div>
  );
}
