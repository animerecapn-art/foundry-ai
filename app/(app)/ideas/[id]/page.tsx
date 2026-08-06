'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, GitBranch, Calendar, Brain, Rocket,
  CheckSquare, Clock, Loader2, Edit3, Trash2, Eye,
  CheckCircle, ShieldAlert, AlertTriangle, TrendingUp,
  Target, Users, DollarSign, Megaphone, Milestone, Quote,
  BadgeCheck, Compass
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/shared/progress-ring';
import { mockChecklistCategories } from '@/lib/mock-data';
import { cn, formatDate, getStatusColor, getStageLabel, getScoreColor } from '@/lib/utils';
import { getIdeaById, updateIdea, serializeDescription } from '@/services/ideas';
import { supabase } from '@/lib/supabase/client';
import type { Idea, IdeaInputs, OpenAIReport } from '@/types';

const INDUSTRIES = [
  'SaaS', 'Marketplace', 'Consumer App', 'Fintech', 'HealthTech',
  'EdTech', 'E-commerce', 'Developer Tools', 'AI/ML', 'Other',
];

const STAGES = [
  { value: 'concept', label: 'Concept / Idea' },
  { value: 'validation', label: 'Problem Validation' },
  { value: 'mvp', label: 'Minimum Viable Product (MVP)' },
  { value: 'growth', label: 'Early Growth / Traction' },
  { value: 'scale', label: 'Scaling' },
];

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [realityCheck, setRealityCheck] = useState<any>(null);
  const [allChecks, setAllChecks] = useState<any[]>([]);
  const [checklist, setChecklist] = useState(mockChecklistCategories);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Loading status spinner messages
  const [loadingStep, setLoadingStep] = useState(0);
  const LOADING_MESSAGES = [
    'Analyzing updated startup model...',
    'Evaluating competitors...',
    'Checking market opportunities...',
    'Compiling new report scores...',
  ];

  // Compare versions state
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Edit Idea Form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    oneLinePitch: '',
    problem: '',
    solution: '',
    targetAudience: '',
    businessModel: '',
    country: '',
    category: 'SaaS',
    stage: 'concept',
    additionalNotes: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Rotating loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (runningCheck) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [runningCheck]);

  const fetchDetails = async () => {
    try {
      const ideaId = params.id as string;
      const data = await getIdeaById(ideaId);
      if (data) {
        setIdea(data);

        // Prefill edit form state
        setEditFormData({
          title: data.title,
          oneLinePitch: data.inputs?.oneLinePitch || '',
          problem: data.inputs?.problem || '',
          solution: data.inputs?.solution || '',
          targetAudience: data.inputs?.targetAudience || '',
          businessModel: data.inputs?.businessModel || '',
          country: data.inputs?.country || 'United States',
          category: data.category || 'SaaS',
          stage: data.stage || 'concept',
          additionalNotes: data.inputs?.additionalNotes || '',
        });

        // Fetch all reality checks linked to this idea
        const { data: checksData, error: checksError } = await supabase
          .from('reality_checks')
          .select('*')
          .eq('idea_id', ideaId)
          .order('created_at', { ascending: false });

        if (checksError) throw checksError;
        
        setAllChecks(checksData || []);
        setRealityCheck(checksData?.[0] || null);

        // Load checklist progress
        const stored = localStorage.getItem(`checklist-${ideaId}`);
        if (stored) {
          try {
            setChecklist(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse checklist:', e);
            setChecklist(mockChecklistCategories);
          }
        } else {
          setChecklist(mockChecklistCategories);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [params.id]);

  const handleRunCheck = async () => {
    if (!idea) return;
    try {
      setRunningCheck(true);
      const res = await fetch('/api/reality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          title: editFormData.title,
          oneLinePitch: editFormData.oneLinePitch,
          problem: editFormData.problem,
          solution: editFormData.solution,
          targetAudience: editFormData.targetAudience,
          businessModel: editFormData.businessModel,
          country: editFormData.country,
          category: editFormData.category,
          stage: editFormData.stage,
          additionalNotes: editFormData.additionalNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check failed');

      // Refresh detail data
      await fetchDetails();
      setActiveTab('analysis');
    } catch (err) {
      console.error(err);
    } finally {
      setRunningCheck(false);
    }
  };

  const handleLaunch = async () => {
    if (!idea) return;
    try {
      setLaunching(true);
      await updateIdea(idea.id, { status: 'launched', stage: 'growth' });
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setLaunching(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;
    try {
      setSavingEdit(true);
      const inputs: IdeaInputs = {
        oneLinePitch: editFormData.oneLinePitch,
        problem: editFormData.problem,
        solution: editFormData.solution,
        targetAudience: editFormData.targetAudience,
        businessModel: editFormData.businessModel,
        country: editFormData.country,
        additionalNotes: editFormData.additionalNotes,
      };

      await updateIdea(idea.id, {
        title: editFormData.title,
        inputs,
        category: editFormData.category,
        stage: editFormData.stage,
      });

      await fetchDetails();
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleCompareSelection = (checkId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(checkId)) {
        return prev.filter((id) => id !== checkId);
      }
      if (prev.length >= 2) {
        return [prev[1]!, checkId]; // cap at 2 selections
      }
      return [...prev, checkId];
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Idea not found</p>
        <Link href="/ideas">
          <Button className="mt-4">Back to Ideas</Button>
        </Link>
      </div>
    );
  }

  // Parse latest structured report details
  const hasFullPackage = realityCheck?.insights && typeof realityCheck.insights === 'object' && !Array.isArray(realityCheck.insights);
  const report: OpenAIReport | null = hasFullPackage ? realityCheck.insights.report : null;

  // Comparison objects
  const compareCheck1 = allChecks.find(c => c.id === selectedForCompare[0]);
  const compareCheck2 = allChecks.find(c => c.id === selectedForCompare[1]);

  return (
    <div className="space-y-6 pb-8 max-w-5xl">
      {/* Loading overlay for run check */}
      <AnimatePresence>
        {runningCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/85 z-50 flex flex-col items-center justify-center text-center p-4"
          >
            <div className="w-20 h-20 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-glow mb-6">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-bold text-foreground h-8"
            >
              {LOADING_MESSAGES[loadingStep]}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-2">
              Generating new validation scores. Do not close this page.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/ideas">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Ideas
          </button>
        </Link>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={cn(getStatusColor(idea.status))}>
                {idea.status}
              </Badge>
              <Badge variant="outline">
                {getStageLabel(idea.stage)}
              </Badge>
              <Badge variant="info">
                {idea.category}
              </Badge>
              {idea.tags && idea.tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <h1 className="font-display text-2xl font-bold">{idea.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created {formatDate(idea.createdAt)}</span>
              <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> Version {idea.version}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {formatDate(idea.updatedAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-1.5"
              onClick={handleRunCheck}
              disabled={runningCheck}
            >
              <Brain className="w-4 h-4" />
              Analyze with AI
            </Button>
            <Button
              variant="gradient"
              size="sm"
              className="flex-1 sm:flex-none gap-1.5"
              onClick={handleLaunch}
              disabled={launching || idea.status === 'launched'}
            >
              <Rocket className="w-4 h-4" />
              {idea.status === 'launched' ? 'Launched' : 'Launch Startup'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Reality Score', value: idea.realityScore || 0 },
          { label: 'Market Fit', value: idea.marketScore || 0 },
          { label: 'Uniqueness', value: idea.uniquenessScore || 0 },
          { label: 'Feasibility', value: idea.feasibilityScore || 0 },
        ].map((score, index) => (
          <motion.div
            key={score.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="flex flex-col items-center p-4">
              <ProgressRing value={score.value} size={72} strokeWidth={5} />
              <p className="text-xs text-muted-foreground mt-2 font-medium">{score.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-4">
          <TabsTrigger value="overview" className="border-b-2 border-transparent rounded-none px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="analysis" className="border-b-2 border-transparent rounded-none px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent">AI Analysis</TabsTrigger>
          <TabsTrigger value="edit" className="border-b-2 border-transparent rounded-none px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent">Edit Model</TabsTrigger>
          <TabsTrigger value="history" className="border-b-2 border-transparent rounded-none px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent">Version History</TabsTrigger>
          <TabsTrigger value="launch" className="border-b-2 border-transparent rounded-none px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent">Launch Readiness</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Product Concept Pitch */}
              <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">One-line Pitch</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground italic font-medium leading-relaxed">
                    &ldquo;{idea.inputs?.oneLinePitch || 'No pitch provided.'}&rdquo;
                  </p>
                </CardContent>
              </Card>

              {/* Problem / Solution Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Problem Statement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {idea.inputs?.problem || 'No problem statement defined.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Proposed Solution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {idea.inputs?.solution || idea.description || 'No solution defined.'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Target & Monetization Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Target Audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {idea.inputs?.targetAudience || 'No target audience defined.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Business Model</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {idea.inputs?.businessModel || 'No monetization structure defined.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              {/* Country & Category details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Target Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Geography:</span>
                    <span className="font-semibold">{idea.inputs?.country || 'United States'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Industry:</span>
                    <span className="font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{idea.category}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Current Stage:</span>
                    <span className="font-semibold">{getStageLabel(idea.stage)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              {idea.inputs?.additionalNotes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {idea.inputs.additionalNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* AI ANALYSIS TAB */}
        <TabsContent value="analysis" className="mt-6 space-y-6">
          {realityCheck ? (
            report ? (
              // Structured premium report viewer embedded
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <h3 className="font-display font-bold text-base flex items-center gap-1.5">
                    <Brain className="w-5 h-5 text-primary" /> v{version} AI Reality Check Report
                  </h3>
                  <Link href={`/reports/${realityCheck.id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                      <Eye className="w-3.5 h-3.5" /> View Shareable Page
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Summary, SWOT */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Summary */}
                    <Card>
                      <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold">Executive Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">{report.summary}</p>
                      </CardContent>
                    </Card>

                    {/* Strengths & Weaknesses */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                        <CardHeader className="pb-2 border-b border-emerald-500/10">
                          <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Core Strengths</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <ul className="space-y-2">
                            {report.strengths.map((str, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{str}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-red-500/20 bg-red-500/[0.01]">
                        <CardHeader className="pb-2 border-b border-red-500/10">
                          <CardTitle className="text-xs font-semibold text-red-600 dark:text-red-400">Key Weaknesses</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <ul className="space-y-2">
                            {report.weaknesses.map((weak, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-red-500 font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{weak}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Opportunities & Risks */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
                        <CardHeader className="pb-2 border-b border-emerald-500/10">
                          <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Opportunities</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <ul className="space-y-2">
                            {report.opportunities.map((opp, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{opp}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-500/20 bg-amber-500/[0.01]">
                        <CardHeader className="pb-2 border-b border-amber-500/10">
                          <CardTitle className="text-xs font-semibold text-amber-600 dark:text-amber-400">Hidden Risks</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <ul className="space-y-2">
                            {report.risks.map((risk, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500 font-bold mt-0.5">•</span>
                                <span className="leading-relaxed">{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Competitors & Customers */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2 border-b">
                          <CardTitle className="text-xs font-semibold">Competitors</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <ul className="space-y-2">
                            {report.competitors.map((comp, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span className="leading-relaxed">{comp}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2 border-b">
                          <CardTitle className="text-xs font-semibold">Target Personas</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <ul className="space-y-2">
                            {report.targetCustomers.map((persona, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span className="leading-relaxed">{persona}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Right Column: Monetization, MVP, Verdict */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-xs font-semibold">Revenue Structure</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2.5">
                          {report.monetization.map((mon, i) => (
                            <li key={i} className="text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/40">{mon}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-xs font-semibold">Recommended MVP</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          {report.mvpFeatures.map((feat, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-bold">{i+1}.</span>
                              <span className="leading-relaxed">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-brand-gradient/30 bg-gradient-to-br from-primary/5 to-blue-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-foreground">Final Verdict</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium text-foreground">{report.finalVerdict}</p>
                        <Link href={`/ai-cofounder?ideaId=${idea.id}`}>
                          <Button className="w-full mt-4 text-xs gap-1.5 h-8" variant="gradient">
                            <Bot className="w-3.5 h-3.5" /> Discuss improvements
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              // Backward compatibility parser
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {realityCheck.insights && Array.isArray(realityCheck.insights) && realityCheck.insights.map((insight: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-amber-600 dark:text-amber-400">⚠️ Risks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {realityCheck.risks && realityCheck.risks.map((risk: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-emerald-600 dark:text-emerald-400">✅ Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {realityCheck.opportunities && realityCheck.opportunities.map((opp: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </>
            )
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No AI analysis yet</p>
              <p className="text-sm text-muted-foreground mt-1">Run an AI Reality Check to get structured insights and feedback</p>
              <Button variant="gradient" className="mt-4 gap-2" onClick={handleRunCheck} disabled={runningCheck}>
                <Brain className="w-4 h-4" />
                Analyze with AI
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* EDIT MODEL TAB */}
        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Edit3 className="w-4.5 h-4.5 text-primary" /> Edit Startup Profile
              </CardTitle>
              <CardDescription>Update your startup model inputs. Saving changes increments your version. Run AI Check again to update the report.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveEdit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Startup Name</label>
                    <Input
                      value={editFormData.title}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">One-line Pitch</label>
                    <Input
                      value={editFormData.oneLinePitch}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, oneLinePitch: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Industry</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Stage</label>
                    <select
                      value={editFormData.stage}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, stage: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {STAGES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Target Location</label>
                    <Input
                      value={editFormData.country}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Problem Statement</label>
                    <textarea
                      value={editFormData.problem}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, problem: e.target.value }))}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Solution Model</label>
                    <textarea
                      value={editFormData.solution}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, solution: e.target.value }))}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Target Customers</label>
                    <textarea
                      value={editFormData.targetAudience}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Business Model & Pricing</label>
                    <textarea
                      value={editFormData.businessModel}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, businessModel: e.target.value }))}
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Additional Notes</label>
                  <textarea
                    value={editFormData.additionalNotes}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" variant="gradient" disabled={savingEdit} className="h-9 text-xs">
                    {savingEdit ? 'Saving...' : 'Save Draft (v' + (idea.version || 1) + ')'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VERSION HISTORY TAB */}
        <TabsContent value="history" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base">Saved Version History</CardTitle>
                  <CardDescription className="text-xs">Compare changes or open previous AI reports side-by-side.</CardDescription>
                </div>
                {selectedForCompare.length === 2 && (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="gap-1.5 h-8 text-xs font-semibold"
                    onClick={() => setCompareModalOpen(true)}
                  >
                    Compare Selected ({selectedForCompare.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allChecks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No reports run yet. Run a check to create your first report version.</p>
                ) : (
                  allChecks.map((checkItem) => {
                    const checkHasPkg = checkItem.insights && typeof checkItem.insights === 'object' && !Array.isArray(checkItem.insights);
                    const checkVersion = checkHasPkg ? checkItem.insights.version : 1;
                    const isSelected = selectedForCompare.includes(checkItem.id);

                    return (
                      <div
                        key={checkItem.id}
                        className="flex items-center gap-4 rounded-xl border border-border/60 p-4 shadow-sm hover:shadow-md transition-all group bg-card/50"
                      >
                        {/* Checkbox for Compare */}
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCompareSelection(checkItem.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </div>

                        {/* Score Indicator */}
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white",
                          checkItem.overall_score >= 80 ? "bg-emerald-500" : checkItem.overall_score >= 60 ? "bg-amber-500" : "bg-red-500"
                        )}>
                          {checkItem.overall_score}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Version {checkVersion}</span>
                            {checkVersion === idea.version && <Badge variant="success" className="text-[10px] py-0 px-1.5">Latest</Badge>}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Run on {formatDate(checkItem.created_at)} · {checkItem.model_used}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link href={`/reports/${checkItem.id}`}>
                            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-3.5 h-3.5" /> View Report
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LAUNCH TAB */}
        <TabsContent value="launch" className="mt-6">
          <div className="space-y-4">
            {checklist.slice(0, 4).map((cat) => (
              <Card key={cat.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{cat.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">{cat.completedCount}/{cat.totalCount} tasks</span>
                  </div>
                  <Progress value={(cat.completedCount / cat.totalCount) * 100} className="h-1.5" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={cn('w-4 h-4 rounded flex items-center justify-center flex-shrink-0', item.completed ? 'bg-primary' : 'border-2 border-border')}>
                        {item.completed && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={cn('text-sm', item.completed && 'line-through text-muted-foreground')}>{item.title}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* VERSION COMPARE SIDE-BY-SIDE MODAL */}
      <AnimatePresence>
        {compareModalOpen && compareCheck1 && compareCheck2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-background rounded-2xl border max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-lg">Compare Startup Versions</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCompareModalOpen(false)}>Close</Button>
              </div>

              {/* Modal Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                <div className="grid grid-cols-3 gap-4 border-b pb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div>Field Profile</div>
                  <div>Version {compareCheck1.insights?.version || 1}</div>
                  <div>Version {compareCheck2.insights?.version || 1}</div>
                </div>

                {/* Score comparison */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b items-center">
                  <div className="font-semibold text-foreground">AI Reality Score</div>
                  <div className={cn("text-base font-bold", getScoreColor(compareCheck1.overall_score))}>
                    {compareCheck1.overall_score}/100
                  </div>
                  <div className={cn("text-base font-bold", getScoreColor(compareCheck2.overall_score))}>
                    {compareCheck2.overall_score}/100
                  </div>
                </div>

                {/* Startup Name */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Startup Name</div>
                  <div>{compareCheck1.insights?.inputs?.title || idea.title}</div>
                  <div>{compareCheck2.insights?.inputs?.title || idea.title}</div>
                </div>

                {/* One line pitch */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">One-line Pitch</div>
                  <div className="italic text-xs">{compareCheck1.insights?.inputs?.oneLinePitch || 'N/A'}</div>
                  <div className="italic text-xs">{compareCheck2.insights?.inputs?.oneLinePitch || 'N/A'}</div>
                </div>

                {/* Problem Statement */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Problem Statement</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareCheck1.insights?.inputs?.problem || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareCheck2.insights?.inputs?.problem || 'N/A'}</div>
                </div>

                {/* Solution Model */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Solution Model</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareCheck1.insights?.inputs?.solution || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareCheck2.insights?.inputs?.solution || 'N/A'}</div>
                </div>

                {/* Target Audience */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Target Customers</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareCheck1.insights?.inputs?.targetAudience || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareCheck2.insights?.inputs?.targetAudience || 'N/A'}</div>
                </div>

                {/* Business Model */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Business Model</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareCheck1.insights?.inputs?.businessModel || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareCheck2.insights?.inputs?.businessModel || 'N/A'}</div>
                </div>

                {/* Final Verdict */}
                <div className="grid grid-cols-3 gap-4 py-3">
                  <div className="font-semibold text-foreground">AI Report Verdict</div>
                  <div className="text-xs text-muted-foreground italic leading-relaxed">
                    {compareCheck1.insights?.report?.finalVerdict || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground italic leading-relaxed">
                    {compareCheck2.insights?.report?.finalVerdict || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border/80 flex justify-end bg-muted/30">
                <Button variant="outline" size="sm" onClick={() => setCompareModalOpen(false)}>Close Comparison</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
