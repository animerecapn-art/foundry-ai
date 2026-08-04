// ============================================================
// Core Domain Types
// ============================================================

export type IdeaStatus = 'draft' | 'validating' | 'validated' | 'launched' | 'archived';
export type IdeaStage = 'concept' | 'validation' | 'mvp' | 'growth' | 'scale';
export type ReportType = 'reality-check' | 'market-analysis' | 'competitive' | 'financial';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Idea {
  id: string;
  userId?: string;
  title: string;
  description: string;
  status: IdeaStatus;
  stage: IdeaStage;
  realityScore: number; // 0-100
  marketScore: number;
  uniquenessScore: number;
  feasibilityScore: number;
  tags: Tag[];
  category: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  launchProgress: number; // 0-100
  checklistCompleted: number;
  checklistTotal: number;
}

export interface IdeaVersion {
  id: string;
  ideaId: string;
  version: number;
  title: string;
  description: string;
  changedBy: string;
  changes: string[];
  createdAt: string;
}

export interface RealityCheck {
  id: string;
  ideaId: string;
  ideaTitle: string;
  overallScore: number;
  marketSize: string;
  competition: 'low' | 'medium' | 'high' | 'very-high';
  feasibility: 'low' | 'medium' | 'high';
  uniqueness: 'low' | 'medium' | 'high';
  insights: string[];
  risks: string[];
  opportunities: string[];
  createdAt: string;
}

export interface Report {
  id: string;
  ideaId: string;
  ideaTitle: string;
  type: ReportType;
  title: string;
  summary: string;
  score: number;
  status: 'generating' | 'ready' | 'error';
  createdAt: string;
  pageCount: number;
}

export interface Activity {
  id: string;
  type: 'idea_created' | 'idea_updated' | 'report_generated' | 'reality_check' | 'launched' | 'version_saved' | 'checklist_item';
  title: string;
  description: string;
  ideaId?: string;
  ideaTitle?: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  link?: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  change: number; // percentage
  changeLabel: string;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'rose';
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  title: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  createdAt: string;
  pinned?: boolean;
}

// ============================================================
// UI State Types
// ============================================================

export interface AppState {
  sidebarCollapsed: boolean;
  selectedIdeaId: string | null;
  notifications: Notification[];
  upgradeDialogOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedIdeaId: (id: string | null) => void;
  setUpgradeDialogOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

// ============================================================
// Chart Types
// ============================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  ideas?: number;
  checks?: number;
  score?: number;
  [key: string]: string | number | undefined;
}
