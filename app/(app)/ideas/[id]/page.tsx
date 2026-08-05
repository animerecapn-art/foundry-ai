'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GitBranch, Calendar, Brain, Rocket, CheckSquare, Clock, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/shared/progress-ring';
import { mockChecklistCategories } from '@/lib/mock-data';
import { cn, formatDate, getStatusColor, getStageLabel } from '@/lib/utils';
import { getIdeaById, updateIdea } from '@/services/ideas';
import { supabase } from '@/lib/supabase/client';
import type { Idea } from '@/types';

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [realityCheck, setRealityCheck] = useState<any>(null);
  const [checklist, setChecklist] = useState(mockChecklistCategories);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [launching, setLaunching] = useState(false);

  const fetchDetails = async () => {
    try {
      const ideaId = params.id as string;
      const data = await getIdeaById(ideaId);
      if (data) {
        setIdea(data);

        // Fetch latest reality check
        const { data: checkData } = await supabase
          .from('reality_checks')
          .select('*')
          .eq('idea_id', ideaId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setRealityCheck(checkData);

        // Load checklist progress from localStorage
        const stored = localStorage.getItem(`checklist-${ideaId}`);
        if (stored) {
          try {
            setChecklist(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse checklist state:', e);
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
          title: idea.title,
          description: idea.description,
          category: idea.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check failed');

      // Refresh detail data
      await fetchDetails();
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

  return (
    <div className="space-y-6 pb-8 max-w-5xl">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/ideas">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Ideas
          </button>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={cn(getStatusColor(idea.status))}>
                {idea.status}
              </Badge>
              <Badge variant="outline">
                {getStageLabel(idea.stage)}
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
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created {formatDate(idea.createdAt)}</span>
              <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> Version {idea.version}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {formatDate(idea.updatedAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRunCheck}
              disabled={runningCheck}
            >
              {runningCheck ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Run AI Check
            </Button>
            <Button
              variant="gradient"
              size="sm"
              className="gap-2"
              onClick={handleLaunch}
              disabled={launching || idea.status === 'launched'}
            >
              {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {idea.status === 'launched' ? 'Launched' : 'Launch'}
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
      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="launch">Launch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{idea.description}</p>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Stage Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  {['Concept', 'Validation', 'MVP', 'Growth', 'Scale'].map((stage, i) => {
                    const stageMap: Record<string, number> = { concept: 0, validation: 1, mvp: 2, growth: 3, scale: 4 };
                    const current = stageMap[idea.stage] !== undefined ? stageMap[idea.stage] : 0;
                    return (
                      <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                        <div className={cn('w-full h-1.5 rounded-full', i <= current ? 'bg-primary' : 'bg-muted')} />
                        <span className={cn('text-xs', i === current ? 'text-primary font-medium' : 'text-muted-foreground')}>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Launch Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-display font-bold">{idea.launchProgress || 0}%</span>
                  <span className="text-xs text-muted-foreground">{idea.checklistCompleted || 0}/{idea.checklistTotal || 25} tasks</span>
                </div>
                <Progress value={idea.launchProgress || 0} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6 space-y-4">
          {realityCheck ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {realityCheck.insights && realityCheck.insights.map((insight: string, i: number) => (
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
          ) : (
            <Card className="p-8 text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No AI analysis yet</p>
              <p className="text-sm text-muted-foreground mt-1">Run an AI Reality Check to get insights</p>
              <Button variant="gradient" className="mt-4 gap-2" onClick={handleRunCheck} disabled={runningCheck}>
                {runningCheck ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Run AI Check
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: idea.version || 1 }, (_, i) => (idea.version || 1) - i).map((v) => (
                  <div key={v} className="flex items-center gap-4 rounded-lg border border-border/50 p-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      v{v}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Version {v}</p>
                      <p className="text-xs text-muted-foreground">
                        {v === idea.version ? 'Current version' : `Saved ${v * 3} days ago`}
                      </p>
                    </div>
                    {v === idea.version && <Badge variant="success">Current</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="launch" className="mt-6">
          <div className="space-y-4">
            {checklist.slice(0, 3).map((cat) => (
              <Card key={cat.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{cat.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">{cat.completedCount}/{cat.totalCount}</span>
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
    </div>
  );
}
