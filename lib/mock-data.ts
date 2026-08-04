import type { Idea, Activity, RealityCheck, Report, ChecklistCategory, Notification, CommunityPost, User, TimeSeriesDataPoint } from '@/types';

// ============================================================
// Current User
// ============================================================
export const mockUser: User = {
  id: 'usr_01',
  name: 'Alex Morgan',
  email: 'alex@foundryai.com',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  plan: 'pro',
  createdAt: '2024-01-15T10:00:00Z',
};

// ============================================================
// Ideas
// ============================================================
export const mockIdeas: Idea[] = [
  {
    id: 'idea_01',
    title: 'AI-Powered Legal Document Analyzer',
    description: 'A SaaS tool that uses AI to analyze legal contracts, identify risky clauses, and provide plain-English explanations for small businesses that cannot afford a full-time legal team.',
    status: 'validated',
    stage: 'mvp',
    realityScore: 84,
    marketScore: 88,
    uniquenessScore: 72,
    feasibilityScore: 79,
    tags: [
      { id: 't1', name: 'AI/ML', color: '#8B5CF6' },
      { id: 't2', name: 'Legal', color: '#3B82F6' },
      { id: 't3', name: 'B2B SaaS', color: '#10B981' },
    ],
    category: 'Legal Tech',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
    version: 4,
    launchProgress: 68,
    checklistCompleted: 17,
    checklistTotal: 25,
  },
  {
    id: 'idea_02',
    title: 'Remote Team Culture Platform',
    description: 'A platform that helps distributed teams build genuine connection through async video messages, virtual coffee chats, culture rituals, and engagement analytics for HR leaders.',
    status: 'validating',
    stage: 'validation',
    realityScore: 71,
    marketScore: 76,
    uniquenessScore: 65,
    feasibilityScore: 82,
    tags: [
      { id: 't4', name: 'HR Tech', color: '#F59E0B' },
      { id: 't5', name: 'Remote Work', color: '#EF4444' },
    ],
    category: 'HR & Productivity',
    createdAt: '2024-11-20T11:00:00Z',
    updatedAt: '2024-12-10T09:00:00Z',
    version: 2,
    launchProgress: 32,
    checklistCompleted: 8,
    checklistTotal: 25,
  },
  {
    id: 'idea_03',
    title: 'Sustainable Supply Chain Tracker',
    description: 'End-to-end supply chain transparency tool for e-commerce brands to track carbon footprint, ethical sourcing, and generate sustainability reports for consumers.',
    status: 'draft',
    stage: 'concept',
    realityScore: 62,
    marketScore: 70,
    uniquenessScore: 68,
    feasibilityScore: 55,
    tags: [
      { id: 't6', name: 'Sustainability', color: '#10B981' },
      { id: 't7', name: 'E-commerce', color: '#8B5CF6' },
    ],
    category: 'CleanTech',
    createdAt: '2024-12-01T16:00:00Z',
    updatedAt: '2024-12-01T16:00:00Z',
    version: 1,
    launchProgress: 12,
    checklistCompleted: 3,
    checklistTotal: 25,
  },
  {
    id: 'idea_04',
    title: 'Micro-Learning for Enterprise Skills',
    description: 'Short, AI-personalized 5-minute daily lessons delivered via Slack or Teams to upskill enterprise employees in data literacy, communication, and leadership.',
    status: 'launched',
    stage: 'growth',
    realityScore: 91,
    marketScore: 93,
    uniquenessScore: 78,
    feasibilityScore: 88,
    tags: [
      { id: 't8', name: 'EdTech', color: '#3B82F6' },
      { id: 't9', name: 'Enterprise', color: '#6366F1' },
      { id: 't10', name: 'AI/ML', color: '#8B5CF6' },
    ],
    category: 'EdTech',
    createdAt: '2024-08-10T08:00:00Z',
    updatedAt: '2024-12-18T11:00:00Z',
    version: 8,
    launchProgress: 100,
    checklistCompleted: 25,
    checklistTotal: 25,
  },
  {
    id: 'idea_05',
    title: 'Creator Economy Analytics Suite',
    description: 'Unified analytics dashboard for content creators across YouTube, TikTok, Instagram, and Substack with revenue attribution, audience insights, and growth predictions.',
    status: 'validating',
    stage: 'validation',
    realityScore: 77,
    marketScore: 82,
    uniquenessScore: 61,
    feasibilityScore: 74,
    tags: [
      { id: 't11', name: 'Creator Economy', color: '#F59E0B' },
      { id: 't12', name: 'Analytics', color: '#EF4444' },
    ],
    category: 'Creator Tools',
    createdAt: '2024-11-05T13:00:00Z',
    updatedAt: '2024-12-12T10:00:00Z',
    version: 3,
    launchProgress: 44,
    checklistCompleted: 11,
    checklistTotal: 25,
  },
  {
    id: 'idea_06',
    title: 'AI Interior Design Assistant',
    description: 'Upload a photo of your room and get AI-generated redesign suggestions, furniture recommendations with direct purchase links, and 3D visualizations.',
    status: 'archived',
    stage: 'concept',
    realityScore: 48,
    marketScore: 55,
    uniquenessScore: 40,
    feasibilityScore: 45,
    tags: [
      { id: 't13', name: 'AI/ML', color: '#8B5CF6' },
      { id: 't14', name: 'Consumer', color: '#10B981' },
    ],
    category: 'Consumer Apps',
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-10-01T09:00:00Z',
    version: 2,
    launchProgress: 8,
    checklistCompleted: 2,
    checklistTotal: 25,
  },
];

// ============================================================
// Activity Timeline
// ============================================================
export const mockActivities: Activity[] = [
  {
    id: 'act_01',
    type: 'report_generated',
    title: 'Reality Check Complete',
    description: 'AI Reality Check for "Legal Document Analyzer" scored 84/100',
    ideaId: 'idea_01',
    ideaTitle: 'AI-Powered Legal Document Analyzer',
    createdAt: '2026-08-04T15:00:00Z',
  },
  {
    id: 'act_02',
    type: 'idea_updated',
    title: 'Idea Updated',
    description: 'Added market research notes and competitor analysis to "Remote Team Culture"',
    ideaId: 'idea_02',
    ideaTitle: 'Remote Team Culture Platform',
    createdAt: '2026-08-04T13:30:00Z',
  },
  {
    id: 'act_03',
    type: 'version_saved',
    title: 'Version Saved',
    description: 'Version 4 of "Legal Document Analyzer" — refined target market',
    ideaId: 'idea_01',
    ideaTitle: 'AI-Powered Legal Document Analyzer',
    createdAt: '2026-08-04T10:30:00Z',
  },
  {
    id: 'act_04',
    type: 'idea_created',
    title: 'New Idea Added',
    description: 'Created "Sustainable Supply Chain Tracker"',
    ideaId: 'idea_03',
    ideaTitle: 'Sustainable Supply Chain Tracker',
    createdAt: '2026-08-03T15:30:00Z',
  },
  {
    id: 'act_05',
    type: 'checklist_item',
    title: 'Checklist Milestone',
    description: '"Micro-Learning Platform" completed all 25 launch checklist items',
    ideaId: 'idea_04',
    ideaTitle: 'Micro-Learning for Enterprise Skills',
    createdAt: '2026-08-02T15:30:00Z',
  },
  {
    id: 'act_06',
    type: 'launched',
    title: 'Idea Launched! 🚀',
    description: '"Micro-Learning for Enterprise Skills" has been marked as launched',
    ideaId: 'idea_04',
    ideaTitle: 'Micro-Learning for Enterprise Skills',
    createdAt: '2026-08-01T15:30:00Z',
  },
];

// ============================================================
// Reality Checks
// ============================================================
export const mockRealityChecks: RealityCheck[] = [
  {
    id: 'rc_01',
    ideaId: 'idea_01',
    ideaTitle: 'AI-Powered Legal Document Analyzer',
    overallScore: 84,
    marketSize: '$4.2B TAM',
    competition: 'medium',
    feasibility: 'high',
    uniqueness: 'high',
    insights: [
      'Small businesses spend avg. $3,200/year on legal document review',
      'Only 23% of small businesses have access to regular legal counsel',
      'AI document analysis accuracy has reached 94% for standard contracts',
    ],
    risks: [
      'Regulatory compliance varies by jurisdiction',
      'Enterprise legal teams may resist AI recommendations',
    ],
    opportunities: [
      'Government SMB digitization grants available',
      'Potential white-label partnerships with law firms',
    ],
    createdAt: '2026-08-04T15:00:00Z',
  },
  {
    id: 'rc_02',
    ideaId: 'idea_02',
    ideaTitle: 'Remote Team Culture Platform',
    overallScore: 71,
    marketSize: '$1.8B TAM',
    competition: 'high',
    feasibility: 'high',
    uniqueness: 'medium',
    insights: [
      'Remote work adoption increased 400% post-2020',
      'Employee engagement tools market growing at 14% CAGR',
    ],
    risks: [
      'Crowded market with Donut, Watercooler, Gather.town',
      'Companies cutting HR budgets in downturns',
    ],
    opportunities: [
      'AI-powered matching differentiator not yet in market',
      'HR analytics upsell potential',
    ],
    createdAt: '2026-08-01T15:00:00Z',
  },
  {
    id: 'rc_03',
    ideaId: 'idea_05',
    ideaTitle: 'Creator Economy Analytics Suite',
    overallScore: 77,
    marketSize: '$2.1B TAM',
    competition: 'medium',
    feasibility: 'high',
    uniqueness: 'medium',
    insights: [
      'Creator economy expected to reach $480B by 2027',
      'Average creator uses 4+ separate analytics tools',
    ],
    risks: [
      'Platform API access can be revoked',
      'Creator monetization is volatile',
    ],
    opportunities: [
      'Creator brand deal marketplace integration',
      'Financial services for creators (banking, tax)',
    ],
    createdAt: '2026-07-28T15:00:00Z',
  },
];

// ============================================================
// Reports
// ============================================================
export const mockReports: Report[] = [
  {
    id: 'rep_01',
    ideaId: 'idea_01',
    ideaTitle: 'AI-Powered Legal Document Analyzer',
    type: 'reality-check',
    title: 'AI Reality Check Report',
    summary: 'Comprehensive analysis of market fit, competition, and technical feasibility.',
    score: 84,
    status: 'ready',
    createdAt: '2026-08-04T15:00:00Z',
    pageCount: 12,
  },
  {
    id: 'rep_02',
    ideaId: 'idea_01',
    ideaTitle: 'AI-Powered Legal Document Analyzer',
    type: 'market-analysis',
    title: 'Market Analysis Report',
    summary: 'Deep-dive into target segments, ICP definition, and go-to-market strategy.',
    score: 88,
    status: 'ready',
    createdAt: '2026-08-02T10:00:00Z',
    pageCount: 18,
  },
  {
    id: 'rep_03',
    ideaId: 'idea_02',
    ideaTitle: 'Remote Team Culture Platform',
    type: 'competitive',
    title: 'Competitive Landscape Report',
    summary: 'Analysis of 15 competitors with positioning matrix and differentiation opportunities.',
    score: 71,
    status: 'ready',
    createdAt: '2026-07-30T09:00:00Z',
    pageCount: 24,
  },
  {
    id: 'rep_04',
    ideaId: 'idea_05',
    ideaTitle: 'Creator Economy Analytics Suite',
    type: 'financial',
    title: 'Financial Model Report',
    summary: 'Revenue projections, unit economics, and funding requirements for 3-year plan.',
    score: 77,
    status: 'generating',
    createdAt: '2026-08-04T14:55:00Z',
    pageCount: 0,
  },
];

// ============================================================
// Launch Checklist
// ============================================================
export const mockChecklistCategories: ChecklistCategory[] = [
  {
    id: 'cat_01',
    name: 'Problem & Solution',
    icon: 'Lightbulb',
    completedCount: 4,
    totalCount: 4,
    items: [
      { id: 'cl_01', category: 'cat_01', title: 'Define the core problem', description: 'Write a one-sentence problem statement', completed: true, required: true },
      { id: 'cl_02', category: 'cat_01', title: 'Identify target users', description: 'Define your Ideal Customer Profile (ICP)', completed: true, required: true },
      { id: 'cl_03', category: 'cat_01', title: 'Validate problem with 10+ interviews', description: 'Conduct user discovery interviews', completed: true, required: true },
      { id: 'cl_04', category: 'cat_01', title: 'Document your unique solution', description: 'How does your solution uniquely solve this?', completed: true, required: true },
    ],
  },
  {
    id: 'cat_02',
    name: 'Market Validation',
    icon: 'BarChart3',
    completedCount: 3,
    totalCount: 5,
    items: [
      { id: 'cl_05', category: 'cat_02', title: 'Estimate TAM/SAM/SOM', description: 'Quantify your market opportunity', completed: true, required: true },
      { id: 'cl_06', category: 'cat_02', title: 'Competitive analysis', description: 'Map 5+ competitors and their positioning', completed: true, required: true },
      { id: 'cl_07', category: 'cat_02', title: 'Define differentiation', description: 'Your unique value proposition vs. competitors', completed: true, required: true },
      { id: 'cl_08', category: 'cat_02', title: 'Pricing strategy', description: 'Set your pricing model and initial price points', completed: false, required: true },
      { id: 'cl_09', category: 'cat_02', title: 'Landing page live', description: 'Create a landing page and collect waitlist emails', completed: false, required: false },
    ],
  },
  {
    id: 'cat_03',
    name: 'Product',
    icon: 'Code2',
    completedCount: 2,
    totalCount: 6,
    items: [
      { id: 'cl_10', category: 'cat_03', title: 'Define MVP scope', description: 'List the minimum features for v1', completed: true, required: true },
      { id: 'cl_11', category: 'cat_03', title: 'Create wireframes/mockups', description: 'Design key screens in Figma or similar', completed: true, required: false },
      { id: 'cl_12', category: 'cat_03', title: 'Build MVP', description: 'Development of core product functionality', completed: false, required: true },
      { id: 'cl_13', category: 'cat_03', title: 'Beta testing with 20+ users', description: 'Conduct structured beta program', completed: false, required: true },
      { id: 'cl_14', category: 'cat_03', title: 'Security audit', description: 'Penetration testing and security review', completed: false, required: false },
      { id: 'cl_15', category: 'cat_03', title: 'Performance optimization', description: 'Ensure sub-2s load times', completed: false, required: false },
    ],
  },
  {
    id: 'cat_04',
    name: 'Go-to-Market',
    icon: 'Rocket',
    completedCount: 1,
    totalCount: 5,
    items: [
      { id: 'cl_16', category: 'cat_04', title: 'Define GTM strategy', description: 'Choose primary acquisition channels', completed: true, required: true },
      { id: 'cl_17', category: 'cat_04', title: 'Set up analytics', description: 'Install Mixpanel, PostHog, or similar', completed: false, required: true },
      { id: 'cl_18', category: 'cat_04', title: 'Build email list (500+)', description: 'Grow pre-launch waitlist', completed: false, required: false },
      { id: 'cl_19', category: 'cat_04', title: 'Content marketing plan', description: 'SEO strategy and content calendar', completed: false, required: false },
      { id: 'cl_20', category: 'cat_04', title: 'Prepare launch announcement', description: 'Product Hunt, HN, social media posts', completed: false, required: false },
    ],
  },
  {
    id: 'cat_05',
    name: 'Legal & Finance',
    icon: 'Scale',
    completedCount: 2,
    totalCount: 5,
    items: [
      { id: 'cl_21', category: 'cat_05', title: 'Register business entity', description: 'LLC, Corporation, or appropriate structure', completed: true, required: true },
      { id: 'cl_22', category: 'cat_05', title: 'Open business bank account', description: 'Separate personal and business finances', completed: true, required: true },
      { id: 'cl_23', category: 'cat_05', title: 'Set up payment processing', description: 'Stripe, Paddle, or similar integration', completed: false, required: true },
      { id: 'cl_24', category: 'cat_05', title: 'Privacy policy & Terms of Service', description: 'Legal documents for your product', completed: false, required: true },
      { id: 'cl_25', category: 'cat_05', title: 'GDPR/CCPA compliance', description: 'Data privacy compliance review', completed: false, required: false },
    ],
  },
];

// ============================================================
// Notifications
// ============================================================
export const mockNotifications: Notification[] = [
  {
    id: 'notif_01',
    type: 'success',
    title: 'Reality Check Complete',
    message: 'Your AI Reality Check for "Legal Document Analyzer" scored 84/100.',
    read: false,
    createdAt: '2026-08-04T15:00:00Z',
    link: '/reality-checks',
  },
  {
    id: 'notif_02',
    type: 'info',
    title: 'Weekly Insight Ready',
    message: 'Your weekly startup insights digest is ready to read.',
    read: false,
    createdAt: '2026-08-04T12:30:00Z',
    link: '/reports',
  },
  {
    id: 'notif_03',
    type: 'warning',
    title: 'Idea Needs Attention',
    message: '"Remote Team Culture Platform" hasn\'t been updated in 5 days.',
    read: false,
    createdAt: '2026-08-03T15:30:00Z',
    link: '/ideas',
  },
  {
    id: 'notif_04',
    type: 'success',
    title: 'Report Generated',
    message: 'Market Analysis Report for "Legal Document Analyzer" is ready.',
    read: true,
    createdAt: '2026-08-02T15:30:00Z',
    link: '/reports',
  },
];

// ============================================================
// Community Posts
// ============================================================
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post_01',
    author: { name: 'Sarah Chen', role: 'Founder @ Loopify', avatar: undefined },
    title: 'How I validated my B2B SaaS idea in 3 weeks without writing code',
    content: 'I used a combination of cold outreach, a Notion doc as a fake product, and 40 customer discovery calls to get my first 10 LOIs before writing a single line of code...',
    likes: 247,
    comments: 38,
    tags: ['Validation', 'B2B', 'No-Code'],
    createdAt: '2026-08-04T11:30:00Z',
    pinned: true,
  },
  {
    id: 'post_02',
    author: { name: 'Marcus Williams', role: 'Serial Entrepreneur' },
    title: 'My FoundryAI Reality Check saved me from a $50K mistake',
    content: 'I was about to hire a dev team and spend 6 months building. The Reality Check showed my target market was 5x smaller than I assumed...',
    likes: 189,
    comments: 24,
    tags: ['Lessons', 'Reality Check', 'Market Research'],
    createdAt: '2026-08-04T03:30:00Z',
  },
  {
    id: 'post_03',
    author: { name: 'Priya Sharma', role: 'Product Designer turned Founder' },
    title: 'From idea to $1k MRR in 60 days — my Launch Checklist story',
    content: 'The FoundryAI Launch Checklist kept me focused. Each item forced me to think about what truly mattered for an early stage product...',
    likes: 312,
    comments: 52,
    tags: ['Launch', 'MRR', 'Success Story'],
    createdAt: '2026-08-03T03:30:00Z',
  },
];

// ============================================================
// Dashboard Stats
// ============================================================
export const mockDashboardStats = {
  totalIdeas: 6,
  activeIdeas: 4,
  averageScore: 74,
  reportsGenerated: 12,
  checklistProgress: 68,
  launchedIdeas: 1,
};

// ============================================================
// Chart Data
// ============================================================
export const mockActivityChartData: TimeSeriesDataPoint[] = [
  { date: 'Jul', ideas: 1, checks: 2, score: 65 },
  { date: 'Aug', ideas: 2, checks: 3, score: 68 },
  { date: 'Sep', ideas: 1, checks: 4, score: 71 },
  { date: 'Oct', ideas: 3, checks: 6, score: 73 },
  { date: 'Nov', ideas: 4, checks: 8, score: 75 },
  { date: 'Dec', ideas: 2, checks: 5, score: 74 },
];

export const mockScoreDistribution = [
  { label: 'Excellent (80+)', value: 2, color: '#10B981' },
  { label: 'Good (60-79)', value: 3, color: '#3B82F6' },
  { label: 'Low (<60)', value: 1, color: '#EF4444' },
];
