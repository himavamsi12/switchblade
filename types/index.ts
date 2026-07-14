export type ProjectStatus =
  | "discovery"
  | "planning"
  | "execution"
  | "review"
  | "delivered"
  | "on-hold";

export type Priority = "critical" | "high" | "medium" | "low";

export type ClientMentality =
  | "collaborative"
  | "hands-off"
  | "micromanager"
  | "visionary"
  | "technical"
  | "budget-focused";

export type EscalationSeverity = "critical" | "high" | "medium" | "low";
export type EscalationStatus = "open" | "in-progress" | "resolved";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  department: "design" | "strategy" | "development" | "pm" | "creative";
}

export interface QuestionAnswer {
  id: string;
  category: string;
  question: string;
  answer: string;
  answered_at: string;
}

export interface WorkshopSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  facilitator: string;
  attendees: string[];
  objectives: string[];
  outcomes: string[];
  next_steps: string[];
  status: "scheduled" | "completed" | "cancelled";
}

export interface Escalation {
  id: string;
  title: string;
  description: string;
  raised_by: string;
  raised_at: string;
  severity: EscalationSeverity;
  status: EscalationStatus;
  resolved_at?: string;
  resolution?: string;
  category: "scope" | "deadline" | "budget" | "quality" | "client" | "team";
}

export interface Milestone {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  completed_at?: string;
  owner: string;
}

export interface PlanningData {
  kickoff_date: string;
  phases: Phase[];
  milestones: Milestone[];
  risks: Risk[];
}

export interface Phase {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: "pending" | "active" | "completed" | "delayed";
  deliverables: string[];
}

export interface Risk {
  id: string;
  description: string;
  impact: "high" | "medium" | "low";
  probability: "high" | "medium" | "low";
  mitigation: string;
}

export interface StrategyData {
  objective: string;
  key_messages: string[];
  target_audience: string;
  tone_of_voice: string;
  brand_pillars: string[];
  competitors: string[];
  differentiators: string[];
  success_metrics: SuccessMetric[];
  execution_notes: string;
}

export interface SuccessMetric {
  metric: string;
  target: string;
  current?: string;
}

export interface EmailNotification {
  id: string;
  from: string;
  to: string[];
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  type: "client" | "team" | "system" | "escalation";
  priority: "urgent" | "normal" | "low";
}

export interface ClientProfile {
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  mentality: ClientMentality;
  communication_preference: "email" | "calls" | "slack" | "in-person";
  response_time: "fast" | "moderate" | "slow";
  decision_style: string;
  key_concerns: string[];
  expectations: string;
  relationship_notes: string;
  health: "excellent" | "good" | "at-risk" | "critical";
}

export interface Project {
  id: string;
  name: string;
  code: string;
  type: string;
  status: ProjectStatus;
  priority: Priority;
  lead: TeamMember;
  team: TeamMember[];
  client: ClientProfile;
  start_date: string;
  deadline: string;
  progress: number;
  budget: { allocated: number; spent: number; currency: string };
  tags: string[];
  description: string;
  questionnaire: QuestionAnswer[];
  workshops: WorkshopSession[];
  escalations: Escalation[];
  planning: PlanningData;
  strategy: StrategyData;
  notifications: EmailNotification[];
  last_activity: string;
}
