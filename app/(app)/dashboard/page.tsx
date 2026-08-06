'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb, Brain, BarChart3, Rocket, Plus,
  ArrowRight, CheckSquare, FileText
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { IdeaCard } from '@/components/shared/idea-card';
import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { ProgressRing } from '@/components/shared/progress-ring';
import { AppAreaChart } from '@/components/shared/charts/area-chart';
import { DonutChart } from '@/components/shared/charts/donut-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useIdeas } from '@/hooks/use-ideas';
import { getDashboardStats } from '@/services/ideas';
import { supabase } from '@/lib/supabase/client';
import { getScoreColor } from '@/lib/utils';
import type { Activity } from '@/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { ideas, isLoading: ideasLoading } = useIdeas();
  const [stats, setStats] = useState({ totalIdeas: 0, launchedIdeas: 0, averageScore: 0, reportsGenerated: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch live stats, activities, and dynamic growth chart
  useEffect(() => {
    async function loadData() {
      try {
        const s = await getDashboardStats();
        setStats(s);

        // Fetch recent activities from Supabase
        const { data: actData } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (actData) {
          setActivities(actData.map(a => ({
            id: a.id,
            type: a.type,
            title: a.title,
            description: a.description,
            ideaId: a.idea_id,
            ideaTitle: a.idea_title,
            createdAt: a.created_at
          })));
        }

        // Fetch creation timestamps for dynamic chart grouping (last 6 months)
        const { data: rawIdeas } = await supabase.from('ideas').select('created_at');
        const { data: rawChecks } = await supabase.from('reality_checks').select('created_at');

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          last6Months.push({
            monthName: months[d.getMonth()] || '',
            monthVal: d.getMonth(),
            yearVal: d.getFullYear(),
            ideas: 0,
            checks: 0
          });
        }

        if (rawIdeas) {
          rawIdeas.forEach(ri => {
            const cDate = new Date(ri.created_at);
            const match = last6Months.find(m => m.monthVal === cDate.getMonth() && m.yearVal === cDate.getFullYear());
            if (match) match.ideas++;
          });
        }
        if (rawChecks) {
          rawChecks.forEach(rc => {
            const cDate = new Date(rc.created_at);
            const match = last6Months.find(m => m.monthVal === cDate.getMonth() && m.yearVal === cDate.getFullYear());
            if (match) match.checks++;
          });
        }

        setChartData(last6Months.map(m => ({
          date: m.monthName,
          ideas: m.ideas,
          checks: m.checks
        })));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setStatsLoading(false);
      }
    }

    if (!ideasLoading) {
      loadData();
    }
  }, [ideas, ideasLoading]);

  const topIdeas = ideas.slice(0, 3);
  const overallProgress = ideas.length
    ? Math.round(ideas.reduce((acc, i) => acc + (i.launchProgress || 0), 0) / ideas.length)
    : 0;

  // Aggregate category counts for charts
  const categoryCounts = ideas.reduce((acc: Record<string, number>, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1;
    return acc;
  }, {});

  const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
    label: name,
    value,
  }));

  // Step 10: Empty State
  if (!ideasLoading && ideas.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center shadow-glow mb-6">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-foreground">You haven&apos;t analyzed any startup ideas yet.</h2>
        <p className="text-xs text-muted-foreground mt-2 px-8 leading-relaxed">
          Get a comprehensive AI reality check report outlining feasibility, SWOT analysis, competitor mapping, and monetization plans for your startup ideas.
        </p>
        <Button variant="gradient" className="mt-6 gap-2" onClick={() => router.push('/reality-checks')}>
          Analyze Your First Idea
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold">Workspace Overview 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s what&apos;s happening across your idea portfolio today.
          </p>
        </div>
        <Button variant="gradient" className="gap-2 shadow-glow-sm hidden sm:flex" onClick={() => router.push('/reality-checks')}>
          <Plus className="w-4 h-4" />
          New Idea
        </Button>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Ideas"
          value={stats.totalIdeas}
          change={stats.totalIdeas > 0 ? 100 : 0}
          changeLabel="vs last month"
          icon={<Lightbulb className="w-5 h-5" />}
          color="purple"
          index={0}
        />
        <StatCard
          label="Avg. AI Score"
          value={`${stats.averageScore}/100`}
          change={0}
          changeLabel="vs last month"
          icon={<Brain className="w-5 h-5" />}
          color="blue"
          index={1}
        />
        <StatCard
          label="Reports Generated"
          value={stats.reportsGenerated}
          change={0}
          changeLabel="this month"
          icon={<BarChart3 className="w-5 h-5" />}
          color="green"
          index={2}
        />
        <StatCard
          label="Ideas Launched"
          value={stats.launchedIdeas}
          change={0}
          changeLabel="this quarter"
          icon={<Rocket className="w-5 h-5" />}
          color="orange"
          index={3}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Activity Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Workspace Growth</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Ideas created & reality checks over time</CardDescription>
                </div>
                <Badge variant="default" className="text-xs">Live Database</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 && (
                <AppAreaChart
                  data={chartData}
                  areas={[
                    { key: 'ideas', color: 'hsl(262,70%,52%)', label: 'Ideas' },
                    { key: 'checks', color: 'hsl(212,90%,55%)', label: 'Checks' },
                  ]}
                  height={200}
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Ideas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base">Recent Ideas</h2>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5" asChild>
                <a href="/ideas">View all <ArrowRight className="w-3 h-3" /></a>
              </Button>
            </div>
            {ideasLoading ? (
              <p className="text-sm text-muted-foreground">Loading recent ideas...</p>
            ) : topIdeas.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">No ideas yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/reality-checks')}>
                  Create Your First Idea
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {topIdeas.map((idea, index) => (
                  <IdeaCard key={idea.id} idea={idea} view="list" index={index} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Reality Score */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-brand-gradient" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm">Portfolio Score</CardTitle>
                  <CardDescription className="text-xs">Average AI reality score</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-0 pb-4">
              <ProgressRing value={stats.averageScore} size={120} strokeWidth={8} label="/ 100" />
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Category Distribution</CardTitle>
              <CardDescription className="text-xs">Distribution of your startup ideas</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryDistribution.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No categories to display</p>
              ) : (
                <DonutChart data={categoryDistribution} height={160} />
              )}
            </CardContent>
          </Card>

          {/* Launch Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Launch Readiness</CardTitle>
                  <CardDescription className="text-xs">Portfolio average progress</CardDescription>
                </div>
                <span className="text-2xl font-display font-bold">{overallProgress}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Progress value={overallProgress} className="h-2" />
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs" asChild>
                <a href="/launch-checklist">Open Checklist <ArrowRight className="w-3 h-3 ml-1" /></a>
              </Button>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No activities recorded yet.</p>
              ) : (
                <ActivityTimeline activities={activities} maxItems={4} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
