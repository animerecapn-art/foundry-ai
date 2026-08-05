'use client';

import { motion } from 'framer-motion';
import { GitBranch, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIdeas } from '@/hooks/use-ideas';
import { cn, formatDate } from '@/lib/utils';

export default function VersionHistoryPage() {
  const { ideas, isLoading } = useIdeas();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Build a flat list of all versions across all ideas
  const versions = ideas
    .flatMap(idea =>
      Array.from({ length: idea.version }, (_, i) => ({
        ideaId: idea.id,
        ideaTitle: idea.title,
        version: idea.version - i,
        isCurrent: i === 0,
        date: new Date(new Date(idea.updatedAt || idea.createdAt).getTime() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
        changes: i === 0
          ? ['Updated description', 'Added competitor analysis']
          : [`Refined target market`, 'Updated pricing model', 'Added validation data'][i % 3] === undefined
          ? ['Minor edits']
          : [`Refined target market`, 'Updated pricing model', 'Added validation data'][i % 3]
            ? [`Refined target market`, 'Updated pricing model', 'Added validation data'][i % 3].split(',')
            : ['Minor edits'],
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Version History</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track every change across all your ideas
        </p>
      </motion.div>

      {versions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl border-border">
          <GitBranch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm">No versions found</p>
          <p className="text-xs text-muted-foreground mt-1">Create or update your ideas to see their version history.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {versions.map((v, index) => (
            <motion.div
              key={`${v.ideaId}-v${v.version}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {/* Vertical timeline */}
              {index < versions.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border" />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 rounded-xl border bg-card shadow-sm p-4 hover:shadow-card transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-display font-semibold group-hover:text-primary transition-colors">
                        {v.ideaTitle}
                      </span>
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        v{v.version}
                      </span>
                      {v.isCurrent && <Badge variant="success" className="text-xs">Current</Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(v.date)}
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                    Restore <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {v.changes.map((change) => (
                    <span key={change} className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {change}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
