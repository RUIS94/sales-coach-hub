import { useNavigate } from "react-router-dom";
import { Edit, Send, Download, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sam/PageHeader";
import { ForecastBadge } from "@/components/sam/StatusDot";
import { mockDecisions, mockTasks } from "@/data/mock";

export default function PostSummary() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="1:1 Summary — Sarah Chen — Mar 3, 2026" subtitle="Duration: 42 min · Recorded: Yes">
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/')}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back
        </Button>
        <Button variant="secondary" size="sm" className="text-xs">
          <Edit className="h-3.5 w-3.5 mr-1" />Edit
        </Button>
        <Button size="sm" className="text-xs">
          <Send className="h-3.5 w-3.5 mr-1" />Send to AE
        </Button>
      </PageHeader>

      <div className="flex flex-1 min-h-0">
        {/* Left: Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Decisions */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Decisions</h2>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Deal</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Old Forecast</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">New Forecast</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Decision</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDecisions.map((d, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-2.5 font-medium text-foreground cursor-pointer hover:text-primary" onClick={() => navigate('/queue')}>
                        {d.deal_name}
                      </td>
                      <td className="px-3 py-2.5"><ForecastBadge category={d.old_forecast} /></td>
                      <td className="px-3 py-2.5"><ForecastBadge category={d.new_forecast} /></td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{d.decision_type.replace('_', ' ')}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">{d.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Risks */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Key Risks</h2>
            <ul className="space-y-1 text-sm text-foreground">
              <li className="flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-status-red mt-1.5" />Acme Corp: No economic buyer access — may stall in negotiation</li>
              <li className="flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-status-red mt-1.5" />API Gateway Enterprise: Close date moved 3x, losing credibility</li>
              <li className="flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-status-amber mt-1.5" />HR Automation: 18 days stale, needs urgent re-engagement</li>
            </ul>
          </div>

          {/* Buyer Next Steps */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Buyer Next Steps</h2>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Deal</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Next Step</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Confirmed?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { deal: 'Data Analytics Suite', step: 'Security review call', date: 'Mar 10', confirmed: true },
                    { deal: 'Cloud Migration Package', step: 'Workshop with IT team', date: 'Mar 12', confirmed: false },
                    { deal: 'Security Compliance Tool', step: 'Procurement sign-off', date: 'Mar 14', confirmed: true },
                  ].map((s, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-medium text-foreground">{s.deal}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{s.step}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{s.date}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-medium ${s.confirmed ? 'text-status-green' : 'text-status-amber'}`}>
                          {s.confirmed ? '✓ Yes' : '⚠ No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right rail: Tasks */}
        <div className="w-[320px] border-l border-border overflow-y-auto p-4 shrink-0">
          <h2 className="text-sm font-semibold text-foreground mb-3">Tasks</h2>

          {/* AE Tasks */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AE Tasks</h3>
            <div className="space-y-1.5">
              {mockTasks.filter(t => ['Sarah Chen', 'Marcus Johnson'].includes(t.owner_name)).map((task) => (
                <div key={task.task_id} className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors">
                  {task.status === 'DONE'
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-status-green shrink-0 mt-0.5" />
                    : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  }
                  <div className="min-w-0">
                    <p className={`text-xs ${task.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {task.due_date && <span className={task.is_overdue ? 'text-status-red' : ''}>{task.due_date}</span>}
                      {task.deal_name && <span>· {task.deal_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manager Tasks */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Manager Tasks</h3>
            <div className="space-y-1.5">
              {mockTasks.filter(t => ['Alex Rivera', 'Priya Patel'].includes(t.owner_name)).map((task) => (
                <div key={task.task_id} className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors">
                  {task.status === 'DONE'
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-status-green shrink-0 mt-0.5" />
                    : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  }
                  <div className="min-w-0">
                    <p className={`text-xs ${task.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {task.due_date && <span className={task.is_overdue ? 'text-status-red' : ''}>{task.due_date}</span>}
                      {task.deal_name && <span>· {task.deal_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex gap-2">
            <Button variant="secondary" size="sm" className="text-xs flex-1">Overdue</Button>
            <Button variant="secondary" size="sm" className="text-xs flex-1">Due Soon</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
