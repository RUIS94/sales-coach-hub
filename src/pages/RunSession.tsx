import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, CheckCircle2, Radio, StopCircle, FileText, ListTodo, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDeals, formatCurrency } from "@/data/mock";
import { ForecastBadge } from "@/components/sam/StatusDot";
import { RiskChipSet } from "@/components/sam/RiskChip";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 'snapshot', label: 'Snapshot', done: false },
  { id: 'forecast', label: 'Forecast Truth', done: false },
  { id: 'deal1', label: 'Deal 1: Acme', done: false },
  { id: 'deal2', label: 'Deal 2: TechFlow', done: false },
  { id: 'deal3', label: 'Deal 3: GlobalBank', done: false },
  { id: 'coaching', label: 'Coaching', done: false },
  { id: 'wrapup', label: 'Wrap-up', done: false },
];

const commitDeals = mockDeals.filter(d => d.forecast_category === 'COMMIT');
const impactDimensions = [
  { key: 'I', label: 'Identified Pain', status: 'GREEN' as const },
  { key: 'M', label: 'Metrics / Value', status: 'AMBER' as const },
  { key: 'P', label: 'Process / Timeline', status: 'RED' as const },
  { key: 'A', label: 'Access to Authority', status: 'RED' as const },
  { key: 'C', label: 'Competition', status: 'AMBER' as const },
  { key: 'T', label: 'Technology Fit', status: 'GREEN' as const },
];

export default function RunSession() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState('snapshot');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState('00:00');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [commitDecision, setCommitDecision] = useState<Record<string, 'KEEP' | 'DOWNGRADE' | undefined>>({});
  const currentIndex = steps.findIndex((s) => s.id === activeStep);
  const showNext = isRecording && currentIndex >= 0 && currentIndex < steps.length - 1;
  const [actions, setActions] = useState<Array<{ title: string; owner: string; due: string; done?: boolean }>>([
    { title: 'Schedule EB meeting', owner: 'Sarah', due: 'Mar 7', done: false },
    { title: 'Send pricing proposal', owner: 'Sarah', due: 'Mar 5', done: false },
  ]);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [newAction, setNewAction] = useState<{ title: string; owner: string; due: string }>({ title: '', owner: '', due: '' });
  const [snapshotDialog, setSnapshotDialog] = useState<null | { label: string; value: string }>(null);

  useEffect(() => {
    const lastId = steps[steps.length - 1].id;
    if (activeStep === lastId && !completedSteps.includes(lastId)) {
      setCompletedSteps((prev) => [...prev, lastId]);
    }
  }, [activeStep, completedSteps]);

  const statusColor = { RED: 'bg-status-red', AMBER: 'bg-status-amber', GREEN: 'bg-status-green' };

  return (
    <div className="flex flex-col h-full">
      {/* Top session bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-foreground">Run 1:1 — Sarah Chen</h1>
          <span className="text-xs text-muted-foreground font-mono">{timer}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isRecording ? 'destructive' : 'default'}
            onClick={() => setIsRecording(!isRecording)}
            className="text-xs"
          >
            {isRecording ? <StopCircle className="h-3.5 w-3.5 mr-1.5" /> : <Radio className="h-3.5 w-3.5 mr-1.5" />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          {showNext && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white border border-[#605BFF] text-[#605BFF] hover:bg-[#605BFF] hover:text-white active:bg-[#605BFF] active:text-white transition-colors"
              onClick={() => {
                const idx = steps.findIndex((s) => s.id === activeStep);
                if (idx >= 0 && idx < steps.length - 1) {
                  if (!completedSteps.includes(activeStep)) {
                    setCompletedSteps([...completedSteps, activeStep]);
                  }
                  setActiveStep(steps[idx + 1].id);
                }
              }}
            >
              Next
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="text-xs hover:bg-primary/10 active:bg-primary/15 transition-colors"
            onClick={() => setEndDialogOpen(true)}
          >
            End Session
          </Button>
          <Button
            size="sm"
            className={`text-xs ring-offset-background transition-colors ${
              sessionEnded
                ? 'bg-white border border-[#FF8E1C] text-[#FF8E1C] hover:bg-[#FF8E1C] hover:text-white'
                : 'bg-secondary text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
            onClick={() => sessionEnded && navigate('/summary')}
            disabled={!sessionEnded}
          >
            Generate Summary
          </Button>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Left rail: Steps */}
        <div className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-border p-3 space-y-1 lg:shrink-0 overflow-y-auto">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            const isDone = completedSteps.includes(step.id);
            const isLocked = !isActive && !isDone;
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (isActive || isDone) {
                    setActiveStep(step.id);
                  } else {
                    const idx = steps.findIndex((s) => s.id === step.id);
                    const prevLabel = idx > 0 ? steps[idx - 1].label : null;
                    toast({
                      title: "Complete previous step",
                      description: prevLabel ? `Please complete "${prevLabel}" first.` : "Please continue sequentially.",
                    });
                  }
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-left text-xs transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-foreground'
                    : isDone
                      ? 'text-foreground hover:bg-primary/10 active:bg-primary/15'
                      : 'text-muted-foreground cursor-not-allowed hover:bg-transparent active:bg-transparent'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5 text-status-green shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                {step.label}
              </button>
            );
          })}
        </div>

        {/* Center panel: Active step content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          {activeStep === 'snapshot' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Pipeline Snapshot</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: 'Commit', value: formatCurrency(commitDeals.reduce((s, d) => s + d.amount, 0)) },
                  { label: 'Best Case', value: '$718K' },
                  { label: 'Pipeline Coverage', value: '3.2x' },
                  { label: 'Slippage', value: '2 deals' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.label}
                    onClick={() => setSnapshotDialog(m)}
                    className="rounded-md border border-border p-3 text-left hover:bg-primary/10 active:bg-primary/15 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <p className="text-lg font-bold text-foreground mt-1">{m.value}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">What changed since last week?</label>
                <textarea className="w-full h-20 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none" placeholder="Describe changes..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Any forecast changes today?</label>
                <div className="relative">
                  <select className="w-full h-8 rounded-md border border-border bg-secondary px-3 text-sm text-foreground appearance-none pr-8">
                    <option>No changes</option>
                    <option>Yes — moving deals</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {activeStep === 'forecast' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Forecast Truth — Commit Integrity</h2>
              <p className="text-sm text-muted-foreground">Review all Commit deals closing this period</p>
              <div className="space-y-3">
                {commitDeals.map((deal) => (
                  <div key={deal.deal_id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{deal.account_name} / {deal.deal_name}</span>
                        <ForecastBadge category={deal.forecast_category} />
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(deal.amount)}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Buyer next step</label>
                        <input className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground" placeholder="Describe next step..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Date</label>
                        <input type="date" className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs hover:text-[#FF8E1C] hover:bg-transparent active:bg-transparent"
                      >
                        Link evidence →
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Keep as Commit?</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs h-7 hover:bg-primary/10 active:bg-primary/15 transition-colors"
                          onClick={() => {
                            setCommitDecision((prev) => ({ ...prev, [deal.deal_id]: 'KEEP' }));
                            toast({ title: 'Kept as Commit', description: `${deal.account_name} / ${deal.deal_name}` });
                          }}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs h-7 hover:bg-primary/10 active:bg-primary/15 transition-colors"
                          onClick={() => {
                            setCommitDecision((prev) => ({ ...prev, [deal.deal_id]: 'DOWNGRADE' }));
                            toast({ title: 'Downgraded', description: `${deal.account_name} / ${deal.deal_name}` });
                          }}
                        >
                          Downgrade
                        </Button>
                      </div>
                    </div>
                    {!deal.next_step && (
                      <div className="rounded-md bg-status-amber-bg px-3 py-1.5 text-xs text-status-amber">
                        ⚠ Missing buyer next step — recommended downgrade
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeStep === 'deal1' || activeStep === 'deal2' || activeStep === 'deal3') && (
            <div className="space-y-4">
              {(() => {
                const idx = activeStep === 'deal1' ? 0 : activeStep === 'deal2' ? 1 : 2;
                const deal = mockDeals[idx];
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-foreground">{deal.account_name} / {deal.deal_name}</h2>
                          <ForecastBadge category={deal.forecast_category} />
                        </div>
                        <p className="text-sm text-muted-foreground">{formatCurrency(deal.amount)} · {deal.stage_name} · Close {deal.close_date}</p>
                      </div>
                    </div>

                    {deal.risk_reasons.length > 0 && (
                      <>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why SAM Flagged This</h3>
                        <ul className="text-sm text-foreground space-y-1">
                          {deal.risk_reasons.map((r) => (
                            <li key={r.code} className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${r.severity === 'RED' ? 'bg-status-red' : 'bg-status-amber'}`} />
                              {r.label}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* IMPACT Rubric */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">IMPACT Assessment</h3>
                      <div className="space-y-1">
                        {impactDimensions.map((dim) => (
                          <div key={dim.key} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-primary/10 active:bg-primary/15 cursor-pointer transition-colors">
                            <span className={`h-2.5 w-2.5 rounded-full ${statusColor[dim.status]}`} />
                            <span className="text-xs font-mono text-muted-foreground w-4">{dim.key}</span>
                            <span className="text-sm text-foreground flex-1">{dim.label}</span>
                            <span className={`text-xs font-medium ${dim.status === 'RED' ? 'text-status-red' : dim.status === 'AMBER' ? 'text-status-amber' : 'text-status-green'}`}>
                              {dim.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ambiguity killers */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ambiguity Killers</h3>
                      {['What specific event triggers a decision?', 'Who else needs to approve?', 'What happens if they do nothing?'].map((q, i) => (
                        <div key={i}>
                          <p className="text-sm text-foreground mb-1">{q}</p>
                          <input className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground" placeholder="Answer..." />
                        </div>
                      ))}
                    </div>

                    {/* Decision */}
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Decision & Next Step</h3>
                      <div className="flex gap-2">
                        {['Advance', 'Re-plan', 'Downgrade', 'Close-lost'].map((d) => (
                          <Button
                            key={d}
                            variant="secondary"
                            size="sm"
                            className="text-xs hover:bg-primary/10 active:bg-primary/15 transition-colors"
                            onClick={() => toast({ title: 'Decision recorded', description: `${deal.account_name} / ${deal.deal_name}: ${d}` })}
                          >
                            {d}
                          </Button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Buyer next step</label>
                          <input className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground" placeholder="Required..." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Date</label>
                          <input type="date" className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground" />
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {activeStep === 'coaching' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Coaching</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm text-foreground">Coaching theme</label>
                  <div className="relative">
                    <select className="w-full h-8 rounded-md border border-border bg-secondary px-3 text-sm text-foreground appearance-none pr-8">
                      <option>Discovery</option>
                      <option>Multi-threading</option>
                      <option>Value selling</option>
                      <option>Executive access</option>
                      <option>Competition</option>
                      <option>Negotiation</option>
                      <option>Close planning</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-foreground">One behavior to change on the next call</label>
                  <textarea className="w-full h-20 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground resize-none" placeholder="Be specific..." />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-foreground">How we'll measure</label>
                  <div className="relative">
                    <select className="w-full h-8 rounded-md border border-border bg-secondary px-3 text-sm text-foreground appearance-none pr-8">
                      <option>Booked exec meeting</option>
                      <option>MAP milestone completed</option>
                      <option>Multi-threaded deal</option>
                      <option>Value prop delivered</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 'wrapup' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Wrap-up Summary</h2>
              <div className="space-y-3">
                <div className="rounded-md border border-border p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decisions</h3>
                  <div className="text-sm text-foreground space-y-1">
                    <p>• Acme Corp: Downgrade to Best Case</p>
                    <p>• TechFlow: Keep as Commit</p>
                    <p>• GlobalBank: Advance to Proposal</p>
                  </div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Next Steps</h3>
                  <div className="text-sm text-foreground space-y-1">
                    <p>• Schedule EB meeting for Acme (Sarah, by Mar 7)</p>
                    <p>• Send revised proposal to TechFlow (Marcus, by Mar 5)</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm text-foreground flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked /> Send to AE now
                  </label>
                  <label className="text-sm text-foreground flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked /> Schedule follow-up reminder
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Notes/Actions/Evidence */}
        <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="w-full justify-start bg-card border-b border-border rounded-none min-h-10 p-0 flex-wrap">
              <TabsTrigger value="actions" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <ListTodo className="h-3 w-3 mr-1" />Actions
              </TabsTrigger>
              <TabsTrigger value="evidence" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <FileText className="h-3 w-3 mr-1" />Evidence
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <MessageSquare className="h-3 w-3 mr-1" />Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="actions" className="p-3 space-y-2 mt-0">
              <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => setActionDialogOpen(true)}>+ Add Action</Button>
              {actions.map((a, i) => (
                <div key={i} className="rounded-md border border-border p-2.5">
                  <div className="grid grid-cols-[16px_1fr] gap-x-2">
                    <div className="flex items-center h-full">
                      <Checkbox
                        checked={!!a.done}
                        onCheckedChange={(checked) =>
                          setActions((prev) =>
                            prev.map((x, idx) => (idx === i ? { ...x, done: !!checked } : x)),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-foreground">{a.title}</div>
                      <div className="text-[10px] text-muted-foreground">{a.owner} · Due {a.due}</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="evidence" className="p-3 space-y-2 mt-0">
              {[
                { title: 'Discovery call snippet', excerpt: '"Budget confirmed for Q1..."' },
                { title: 'Email: Pricing follow-up', excerpt: '"We need VP approval before..."' },
              ].map((e, i) => (
                <div key={i} className="rounded-md border border-border p-2.5">
                  <span className="text-xs font-medium text-foreground">{e.title}</span>
                  <p className="text-[10px] text-muted-foreground italic mt-0.5">{e.excerpt}</p>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="notes" className="p-3 mt-0">
              <textarea
                className="w-full h-48 rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground resize-none"
                placeholder="Session notes..."
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={!!snapshotDialog} onOpenChange={(open) => setSnapshotDialog(open ? snapshotDialog : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{snapshotDialog?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-foreground">Value: {snapshotDialog?.value}</div>
            {snapshotDialog?.label === 'Commit' && (
              <div className="text-xs text-muted-foreground">Deals in Commit: {commitDeals.length}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setSnapshotDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Title</label>
              <input
                className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground"
                value={newAction.title}
                onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                placeholder="Action title..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Owner</label>
                <input
                  className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground"
                  value={newAction.owner}
                  onChange={(e) => setNewAction({ ...newAction, owner: e.target.value })}
                  placeholder="e.g. Sarah"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Due</label>
                <input
                  className="w-full h-8 rounded-md border border-border bg-secondary px-2 text-xs text-foreground"
                  value={newAction.due}
                  onChange={(e) => setNewAction({ ...newAction, due: e.target.value })}
                  placeholder="e.g. Mar 7"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setActionDialogOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => {
                if (newAction.title.trim()) {
                  setActions((prev) => [...prev, { ...newAction, done: false }]);
                  setActionDialogOpen(false);
                  setNewAction({ title: '', owner: '', due: '' });
                  toast({ title: 'Action added', description: `${newAction.title}` });
                } else {
                  toast({ title: 'Title required', description: 'Please enter a title for the action.' });
                }
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Session?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This will finalize the 1:1 session. You can generate the summary afterwards.
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setEndDialogOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => {
                setEndDialogOpen(false);
                setSessionEnded(true);
                toast({ title: 'Session ended', description: 'You can now generate the summary.' });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
