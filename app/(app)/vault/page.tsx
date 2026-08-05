'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Search, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/shared/progress-ring';
import { EmptyState } from '@/components/shared/empty-state';
import { useArchivedIdeas } from '@/hooks/use-ideas';
import { cn, formatDate } from '@/lib/utils';

export default function VaultPage() {
  const [search, setSearch] = useState('');
  const { ideas: archivedIdeas, isLoading, restore, remove } = useArchivedIdeas();

  const displayed = search
    ? archivedIdeas.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : archivedIdeas;

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Archive className="w-4 h-4 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Idea Vault</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {archivedIdeas.length} archived {archivedIdeas.length === 1 ? 'idea' : 'ideas'} stored safely
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search vault..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 flex items-start gap-3">
        <Archive className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Archived ideas</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
            These ideas have been archived. You can restore them at any time or permanently delete them.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="vault"
          title="Vault is empty"
          description="Archived ideas will appear here. Ideas you archive from My Ideas are stored safely."
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group"
            >
              <ProgressRing value={idea.realityScore} size={48} strokeWidth={4} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{idea.title}</h3>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Archived
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {idea.category} · Archived {formatDate(idea.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon-sm" className="h-7 w-7" onClick={() => restore(idea.id)}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon-sm" className="h-7 w-7 text-destructive hover:bg-destructive hover:text-white" onClick={() => remove(idea.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
