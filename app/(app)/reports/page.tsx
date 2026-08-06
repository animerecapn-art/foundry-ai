'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { cn, formatRelativeTime, getScoreColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadReports() {
      try {
        const { data, error } = await supabase
          .from('reality_checks')
          .select('*, ideas(title)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((r: any) => {
          const hasPkg = r.insights && typeof r.insights === 'object' && !Array.isArray(r.insights);
          const version = hasPkg ? r.insights.version : 1;
          const summary = hasPkg ? r.insights.report.summary : (Array.isArray(r.insights) ? r.insights[0] : 'AI reality check report.');

          return {
            id: r.id,
            ideaId: r.idea_id,
            ideaTitle: r.ideas?.title || 'Unknown Idea',
            type: 'reality-check',
            title: `AI Reality Check Report v${version}`,
            summary,
            score: r.overall_score,
            status: 'ready',
            createdAt: r.created_at,
            pageCount: 1,
          };
        });

        setReports(mapped);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            AI-generated analysis reports for your ideas
          </p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={() => router.push('/reality-checks')}>
          <Plus className="w-4 h-4" />
          Generate Report
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reports', value: reports.length },
          { label: 'Ready', value: reports.filter(r => r.status === 'ready').length },
          { label: 'Generating', value: reports.filter(r => r.status === 'generating').length },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl border-border bg-card/40 max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-muted-foreground/80 mx-auto mb-3" />
          <h3 className="font-display font-bold text-base text-foreground">You haven&apos;t analyzed any startup ideas yet.</h3>
          <p className="text-xs text-muted-foreground mt-1 px-6">
            Run an AI Reality Check on a startup concept to view competitors, marketing milestones, and feasibility score.
          </p>
          <Button variant="gradient" className="mt-5 gap-1.5 text-xs font-semibold" onClick={() => router.push('/reality-checks')}>
            Analyze Your First Idea
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -2 }}
              onClick={() => router.push(`/reports/${report.id}`)}
              className="group rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden cursor-pointer"
            >
              {/* Color accent */}
              <div className="h-1 bg-purple-500" />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Score */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-transparent',
                    getScoreColor(report.score)
                  )}>
                    <span className={cn('text-xl font-display font-bold', getScoreColor(report.score))}>
                      {report.score}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Reality Check
                      </span>
                      <Badge variant="success" className="text-[10px] py-0 px-1.5">
                        ready
                      </Badge>
                    </div>
                    <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors truncate">
                      {report.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{report.ideaTitle}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatRelativeTime(report.createdAt)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{report.summary}</p>

                <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={(e) => { e.stopPropagation(); router.push(`/reports/${report.id}`); }}>
                    <Eye className="w-3 h-3" /> View Report
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
