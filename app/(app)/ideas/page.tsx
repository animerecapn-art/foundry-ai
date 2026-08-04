'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IdeaCard } from '@/components/shared/idea-card';
import { IdeaCardSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { IdeaFormDialog } from '@/components/features/idea-form-dialog';
import { useIdeas } from '@/hooks/use-ideas';
import { cn } from '@/lib/utils';
import type { IdeaStatus } from '@/types';

const statusFilters: { label: string; value: IdeaStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Validating', value: 'validating' },
  { label: 'Validated', value: 'validated' },
  { label: 'Launched', value: 'launched' },
];

export default function IdeasPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<IdeaStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { ideas, isLoading, error, addIdea, searchIdeas } = useIdeas();

  const displayed = search
    ? searchIdeas(search)
    : activeFilter === 'all'
    ? ideas
    : ideas.filter((i) => i.status === activeFilter);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Ideas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {ideas.length} active {ideas.length === 1 ? 'idea' : 'ideas'} in your portfolio
          </p>
        </div>
        <Button variant="gradient" className="gap-2 shadow-glow-sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          New Idea
        </Button>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setActiveFilter(f.value); setSearch(''); }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-all',
                activeFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <button
            onClick={() => setView('grid')}
            className={cn('rounded p-1.5 transition-colors', view === 'grid' ? 'bg-muted' : 'hover:bg-muted/50')}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('rounded p-1.5 transition-colors', view === 'list' ? 'bg-muted' : 'hover:bg-muted/50')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3')}>
          {Array.from({ length: 6 }).map((_, i) => <IdeaCardSkeleton key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="ideas"
          title={search ? 'No ideas found' : "You haven't added any ideas yet"}
          description={search ? `No ideas match "${search}".` : "Click New Idea to capture your first startup idea."}
          action={!search ? { label: 'Add Your First Idea', onClick: () => setDialogOpen(true) } : undefined}
        />
      ) : (
        <div className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3')}>
          {displayed.map((idea, index) => (
            <IdeaCard key={idea.id} idea={idea} view={view} index={index} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <IdeaFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={async (values) => { await addIdea(values); }}
        mode="create"
      />
    </div>
  );
}
