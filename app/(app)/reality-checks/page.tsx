'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, ArrowRight, TrendingUp, Lightbulb, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/shared/progress-ring';
import { useIdeas } from '@/hooks/use-ideas';
import { supabase } from '@/lib/supabase/client';
import { cn, formatRelativeTime } from '@/lib/utils';

type CheckStatus = 'idle' | 'running' | 'done' | 'error';

interface RunningCheck {
  ideaId: string;
  ideaTitle: string;
  status: CheckStatus;
  result?: {
    overall_score: number;
    market_size: string;
    competition: string;
    feasibility: string;
    uniqueness: string;
    insights: string[];
    risks: string[];
    opportunities: string[];
    verdict: string;
  };
  error?: string;
}

const competitionColor: Record<string, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
  'very-high': 'destructive',
};

export default function RealityChecksPage() {
  const { ideas } = useIdeas();
  const [checks, setChecks] = useState<RunningCheck[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  const [loadingPast, setLoadingPast] = useState(true);

  useEffect(() => {
    async function loadPastChecks() {
      try {
        const { data, error } = await supabase
          .from('reality_checks')
          .select('*, ideas(title)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setChecks(data.map((c: any) => ({
            ideaId: c.idea_id,
            ideaTitle: c.ideas?.title || 'Unknown Idea',
            status: 'done',
            result: {
              overall_score: c.overall_score,
              market_size: c.market_size,
              competition: c.competition,
              feasibility: c.feasibility,
              uniqueness: c.uniqueness,
              insights: c.insights || [],
              risks: c.risks || [],
              opportunities: c.opportunities || [],
              verdict: c.insights?.[0] || 'Check complete.',
            }
          })));
        }
      } catch (err) {
        console.error('Failed to load past reality checks:', err);
      } finally {
        setLoadingPast(false);
      }
    }
    loadPastChecks();
  }, []);

  const runCheck = async (ideaId: string) => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    const checkEntry: RunningCheck = {
      ideaId: idea.id,
      ideaTitle: idea.title,
      status: 'running',
    };
    setChecks((prev) => [checkEntry, ...prev]);

    try {
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

      setChecks((prev) =>
        prev.map((c) =>
          c.ideaId === ideaId
            ? { ...c, status: 'done', result: data.result }
            : c
        )
      );
    } catch (err) {
      setChecks((prev) =>
        prev.map((c) =>
          c.ideaId === ideaId
            ? { ...c, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' }
            : c
        )
      );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Reality Checks</h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-powered validation scores for your startup ideas</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={selectedIdeaId}
            onChange={(e) => setSelectedIdeaId(e.target.value)}
          >
            <option value="">Select an idea...</option>
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>{idea.title}</option>
            ))}
          </select>
          <Button
            variant="gradient"
            className="gap-2"
            disabled={!selectedIdeaId || checks.some(c => c.ideaId === selectedIdeaId && c.status === 'running')}
            onClick={() => selectedIdeaId && runCheck(selectedIdeaId)}
          >
            <FlaskConical className="w-4 h-4" />
            Run Check
          </Button>
        </div>
      </motion.div>

      {/* How it works */}
      {!loadingPast && checks.length === 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Lightbulb, label: 'Select an Idea', desc: 'Choose any idea from your portfolio', color: 'text-purple-500' },
            { icon: FlaskConical, label: 'AI Analyzes It', desc: 'GPT-4o reviews market, competition, and feasibility', color: 'text-blue-500' },
            { icon: TrendingUp, label: 'Get Your Score', desc: 'Receive a 0-100 reality score with insights', color: 'text-emerald-500' },
          ].map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-xl border bg-card p-4"
            >
              <div className={cn('w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0', step.color)}>
                <step.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loadingPast ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          checks.map((check, index) => (
            <motion.div
              key={`${check.ideaId}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card shadow-card overflow-hidden"
            >
              <div className="h-1 bg-brand-gradient" />
              <div className="p-5">
                <div className="flex items-start gap-5">
                  {/* Score / Spinner */}
                  <div className="flex-shrink-0">
                    {check.status === 'running' ? (
                      <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : check.status === 'done' && check.result ? (
                      <ProgressRing value={check.result.overall_score} size={80} strokeWidth={6} />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-destructive/30 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-base">{check.ideaTitle}</h3>
                      <Badge variant={check.status === 'running' ? 'info' : check.status === 'done' ? 'success' : 'destructive'} className="text-xs">
                        {check.status === 'running' ? 'Analyzing...' : check.status === 'done' ? 'Complete' : 'Failed'}
                      </Badge>
                    </div>

                    {check.status === 'running' && (
                      <p className="text-sm text-muted-foreground">
                        GPT-4o is analyzing market size, competition, feasibility, and uniqueness...
                      </p>
                    )}

                    {check.status === 'error' && (
                      <p className="text-sm text-destructive">{check.error}</p>
                    )}

                    {check.status === 'done' && check.result && (
                      <>
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          <Badge variant={competitionColor[check.result.competition] || 'default'} className="text-xs">
                            Competition: {check.result.competition}
                          </Badge>
                          <Badge variant={check.result.feasibility === 'high' ? 'success' : 'warning'} className="text-xs">
                            Feasibility: {check.result.feasibility}
                          </Badge>
                          <Badge variant={check.result.uniqueness === 'high' ? 'success' : 'warning'} className="text-xs">
                            Uniqueness: {check.result.uniqueness}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{check.result.market_size}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground italic mb-3">{check.result.verdict}</p>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">✅ Opportunities</p>
                            <ul className="space-y-1">
                              {check.result.opportunities.map((o, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-emerald-500 mt-0.5">•</span>{o}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">⚠️ Risks</p>
                            <ul className="space-y-1">
                              {check.result.risks.map((r, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-amber-500 mt-0.5">•</span>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
