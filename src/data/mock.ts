// Mock data for SAM - Forecast & Coaching OS

export type RiskCode = 'COMMIT_AT_RISK' | 'NO_NEXT_STEP_DATE' | 'STAGE_STUCK' | 'CLOSE_DATE_MOVED' | 'SINGLE_THREADED' | 'MISSING_EB' | 'NO_MAP' | 'WEAK_VALUE' | 'LOW_ACTIVITY';
export type RiskLevel = 'RED' | 'AMBER' | 'GREEN';
export type ForecastCategory = 'COMMIT' | 'BEST_CASE' | 'PIPELINE' | 'OMIT';
export type DecisionType = 'ADVANCE' | 'REPLAN' | 'DOWNGRADE' | 'CLOSE_LOST' | 'NO_CHANGE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

export interface RiskReason {
  code: RiskCode;
  label: string;
  severity: 'RED' | 'AMBER';
}

export interface Deal {
  deal_id: string;
  deal_name: string;
  account_name: string;
  owner_name: string;
  amount: number;
  stage_name: string;
  forecast_category: ForecastCategory;
  close_date: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_reasons: RiskReason[];
  staleness_days: number;
  stage_dwell_days: number;
  next_step: { description: string; date: string; is_buyer_confirmed: boolean } | null;
  impact_rank: number;
}

export interface AERep {
  user_id: string;
  name: string;
  commit_amount: number;
  slippage_count: number;
  hygiene_score: number;
  overdue_actions: number;
  avatar?: string;
}

export interface Task {
  task_id: string;
  title: string;
  owner_name: string;
  deal_name: string | null;
  due_date: string | null;
  status: TaskStatus;
  is_overdue: boolean;
}

export interface Decision {
  deal_name: string;
  old_forecast: ForecastCategory;
  new_forecast: ForecastCategory;
  decision_type: DecisionType;
  notes: string;
}

const riskLabels: Record<RiskCode, string> = {
  COMMIT_AT_RISK: 'Commit at Risk',
  NO_NEXT_STEP_DATE: 'No Next Step',
  STAGE_STUCK: 'Stage Stuck',
  CLOSE_DATE_MOVED: 'Close Date Moved',
  SINGLE_THREADED: 'Single Threaded',
  MISSING_EB: 'Missing EB',
  NO_MAP: 'No MAP',
  WEAK_VALUE: 'Weak Value',
  LOW_ACTIVITY: 'Low Activity',
};

function risk(code: RiskCode, severity: 'RED' | 'AMBER'): RiskReason {
  return { code, label: riskLabels[code], severity };
}

export const mockDeals: Deal[] = [
  {
    deal_id: '1', deal_name: 'Enterprise Platform License', account_name: 'Acme Corp',
    owner_name: 'Sarah Chen', amount: 285000, stage_name: 'Negotiation',
    forecast_category: 'COMMIT', close_date: '2026-03-28', risk_score: 78,
    risk_level: 'RED', risk_reasons: [risk('COMMIT_AT_RISK', 'RED'), risk('SINGLE_THREADED', 'RED'), risk('NO_MAP', 'AMBER')],
    staleness_days: 12, stage_dwell_days: 21, next_step: null, impact_rank: 1,
  },
  {
    deal_id: '2', deal_name: 'Data Analytics Suite', account_name: 'TechFlow Inc',
    owner_name: 'Marcus Johnson', amount: 195000, stage_name: 'Proposal',
    forecast_category: 'COMMIT', close_date: '2026-03-21', risk_score: 65,
    risk_level: 'AMBER', risk_reasons: [risk('CLOSE_DATE_MOVED', 'AMBER'), risk('MISSING_EB', 'RED')],
    staleness_days: 5, stage_dwell_days: 14, next_step: { description: 'Security review call', date: '2026-03-10', is_buyer_confirmed: true }, impact_rank: 2,
  },
  {
    deal_id: '3', deal_name: 'Cloud Migration Package', account_name: 'GlobalBank',
    owner_name: 'Sarah Chen', amount: 420000, stage_name: 'Discovery',
    forecast_category: 'BEST_CASE', close_date: '2026-04-15', risk_score: 52,
    risk_level: 'AMBER', risk_reasons: [risk('STAGE_STUCK', 'AMBER'), risk('WEAK_VALUE', 'AMBER')],
    staleness_days: 3, stage_dwell_days: 28, next_step: { description: 'Workshop with IT team', date: '2026-03-12', is_buyer_confirmed: false }, impact_rank: 3,
  },
  {
    deal_id: '4', deal_name: 'Security Compliance Tool', account_name: 'MedHealth',
    owner_name: 'Alex Rivera', amount: 156000, stage_name: 'Validation',
    forecast_category: 'COMMIT', close_date: '2026-03-31', risk_score: 42,
    risk_level: 'GREEN', risk_reasons: [],
    staleness_days: 1, stage_dwell_days: 7, next_step: { description: 'Procurement sign-off', date: '2026-03-14', is_buyer_confirmed: true }, impact_rank: 4,
  },
  {
    deal_id: '5', deal_name: 'HR Automation Platform', account_name: 'PeopleFirst',
    owner_name: 'Marcus Johnson', amount: 88000, stage_name: 'Negotiation',
    forecast_category: 'BEST_CASE', close_date: '2026-04-05', risk_score: 71,
    risk_level: 'RED', risk_reasons: [risk('NO_NEXT_STEP_DATE', 'RED'), risk('LOW_ACTIVITY', 'AMBER')],
    staleness_days: 18, stage_dwell_days: 35, next_step: null, impact_rank: 5,
  },
  {
    deal_id: '6', deal_name: 'DevOps Toolchain', account_name: 'CodeShip',
    owner_name: 'Priya Patel', amount: 132000, stage_name: 'Proposal',
    forecast_category: 'PIPELINE', close_date: '2026-04-22', risk_score: 38,
    risk_level: 'GREEN', risk_reasons: [risk('NO_MAP', 'AMBER')],
    staleness_days: 2, stage_dwell_days: 10, next_step: { description: 'Budget approval meeting', date: '2026-03-18', is_buyer_confirmed: true }, impact_rank: 6,
  },
  {
    deal_id: '7', deal_name: 'Customer Success Platform', account_name: 'RetailMax',
    owner_name: 'Alex Rivera', amount: 210000, stage_name: 'Discovery',
    forecast_category: 'BEST_CASE', close_date: '2026-04-30', risk_score: 58,
    risk_level: 'AMBER', risk_reasons: [risk('SINGLE_THREADED', 'AMBER'), risk('MISSING_EB', 'AMBER')],
    staleness_days: 7, stage_dwell_days: 18, next_step: { description: 'Exec sponsor intro', date: '2026-03-20', is_buyer_confirmed: false }, impact_rank: 7,
  },
  {
    deal_id: '8', deal_name: 'API Gateway Enterprise', account_name: 'FinServ Group',
    owner_name: 'Priya Patel', amount: 345000, stage_name: 'Negotiation',
    forecast_category: 'COMMIT', close_date: '2026-03-25', risk_score: 82,
    risk_level: 'RED', risk_reasons: [risk('COMMIT_AT_RISK', 'RED'), risk('CLOSE_DATE_MOVED', 'RED'), risk('MISSING_EB', 'RED')],
    staleness_days: 9, stage_dwell_days: 24, next_step: null, impact_rank: 8,
  },
];

export const mockAEReps: AERep[] = [
  { user_id: '1', name: 'Sarah Chen', commit_amount: 705000, slippage_count: 2, hygiene_score: 72, overdue_actions: 3 },
  { user_id: '2', name: 'Marcus Johnson', commit_amount: 283000, slippage_count: 1, hygiene_score: 85, overdue_actions: 1 },
  { user_id: '3', name: 'Alex Rivera', commit_amount: 366000, slippage_count: 0, hygiene_score: 91, overdue_actions: 0 },
  { user_id: '4', name: 'Priya Patel', commit_amount: 477000, slippage_count: 3, hygiene_score: 64, overdue_actions: 4 },
  { user_id: '5', name: 'Jordan Kim', commit_amount: 198000, slippage_count: 1, hygiene_score: 78, overdue_actions: 2 },
  { user_id: '6', name: 'Taylor Brooks', commit_amount: 145000, slippage_count: 0, hygiene_score: 88, overdue_actions: 0 },
];

export const mockTasks: Task[] = [
  { task_id: '1', title: 'Send pricing proposal to Acme', owner_name: 'Sarah Chen', deal_name: 'Enterprise Platform License', due_date: '2026-03-05', status: 'TODO', is_overdue: false },
  { task_id: '2', title: 'Schedule EB meeting for TechFlow', owner_name: 'Marcus Johnson', deal_name: 'Data Analytics Suite', due_date: '2026-03-03', status: 'TODO', is_overdue: true },
  { task_id: '3', title: 'Update MAP for GlobalBank', owner_name: 'Sarah Chen', deal_name: 'Cloud Migration Package', due_date: '2026-03-07', status: 'IN_PROGRESS', is_overdue: false },
  { task_id: '4', title: 'Follow up on security review', owner_name: 'Alex Rivera', deal_name: 'Security Compliance Tool', due_date: '2026-03-04', status: 'DONE', is_overdue: false },
  { task_id: '5', title: 'Prepare competitive analysis', owner_name: 'Priya Patel', deal_name: 'API Gateway Enterprise', due_date: '2026-02-28', status: 'TODO', is_overdue: true },
  { task_id: '6', title: 'Share case study with RetailMax', owner_name: 'Alex Rivera', deal_name: 'Customer Success Platform', due_date: '2026-03-10', status: 'TODO', is_overdue: false },
];

export const mockDecisions: Decision[] = [
  { deal_name: 'Enterprise Platform License', old_forecast: 'COMMIT', new_forecast: 'BEST_CASE', decision_type: 'DOWNGRADE', notes: 'Missing EB access, moved to Best Case until confirmed' },
  { deal_name: 'Data Analytics Suite', old_forecast: 'COMMIT', new_forecast: 'COMMIT', decision_type: 'NO_CHANGE', notes: 'Security review on track' },
  { deal_name: 'API Gateway Enterprise', old_forecast: 'COMMIT', new_forecast: 'PIPELINE', decision_type: 'DOWNGRADE', notes: 'Close date moved 3x, no buyer engagement' },
];

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}
