'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { cn, formatRelativeTime, getScoreColor } from '@/lib/utils';

const reportTypeLabels: Record<string, string> = {
  'reality-check': 'Reality Check',
  'market-analysis': 'Market Analysis',
  'competitive': 'Competitive',
  'financial': 'Financial',
};

const reportTypeColors: Record<string, string> = {
  'reality-check': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'market-analysis': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'competitive': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'financial': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const { data, error } = await supabase
          .from('reality_checks')
          .select('*, ideas(title)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          ideaId: r.idea_id,
          ideaTitle: r.ideas?.title || 'Unknown Idea',
          type: 'reality-check',
          title: 'AI Reality Check Report',
          summary: r.insights?.[0] || 'AI reality check report.',
          score: r.overall_score,
          status: 'ready',
          createdAt: r.created_at,
          pageCount: 1,
        }));

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
        <Button variant="gradient" className="gap-2">
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
        ].map((stat, i) => (
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
        <div className="text-center py-12 border-2 border-dashed rounded-xl border-border">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm">No reports generated yet</p>
          <p className="text-xs text-muted-foreground mt-1">Run an AI Reality Check on one of your ideas to generate a report.</p>
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
              className="group rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden cursor-pointer"
            >
              {/* Color accent based on type */}
              <div className={cn('h-1', {
                'bg-purple-500': report.type === 'reality-check',
                'bg-blue-500': report.type === 'market-analysis',
                'bg-orange-500': report.type === 'competitive',
                'bg-emerald-500': report.type === 'financial',
              })} />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Score / Loading */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border-2',
                    report.status === 'generating'
                      ? 'bg-muted border-border'
                      : `border-transparent ${getScoreColor(report.score)}`
                  )}>
                    {report.status === 'generating' ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : (
                      <span className={cn('text-xl font-display font-bold', getScoreColor(report.score))}>
                        {report.score}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', reportTypeColors[report.type])}>
                        {reportTypeLabels[report.type]}
                      </span>
                      <Badge variant={report.status === 'ready' ? 'success' : report.status === 'generating' ? 'info' : 'destructive'} className="text-xs">
                        {report.status}
                      </Badge>
                    </div>
                    <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{report.ideaTitle}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatRelativeTime(report.createdAt)}
                      {report.pageCount > 0 && ` · ${report.pageCount} pages`}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{report.summary}</p>

                {report.status === 'ready' && (
                  <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                      <Eye className="w-3 h-3" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                      <Download className="w-3 h-3" /> Export PDF
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
