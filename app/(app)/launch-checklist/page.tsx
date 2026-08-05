'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Check, AlertCircle, Rocket, Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockChecklistCategories } from '@/lib/mock-data';
import { useIdeas } from '@/hooks/use-ideas';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Idea } from '@/types';

export default function LaunchChecklistPage() {
  const { ideas, isLoading } = useIdeas();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [checklist, setChecklist] = useState(mockChecklistCategories);
  const [syncing, setSyncing] = useState(false);

  // Select first idea on load
  useEffect(() => {
    if (ideas.length > 0 && !selectedIdea) {
      setSelectedIdea(ideas[0]);
    }
  }, [ideas, selectedIdea]);

  // Load checklist items from localStorage per idea
  useEffect(() => {
    if (!selectedIdea) return;
    const stored = localStorage.getItem(`checklist-${selectedIdea.id}`);
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
  }, [selectedIdea]);

  const totalDone = checklist.reduce((a, c) => a + c.completedCount, 0);
  const totalItems = checklist.reduce((a, c) => a + c.totalCount, 0);
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const toggleItem = async (catId: string, itemId: string) => {
    if (!selectedIdea) return;

    const newChecklist = checklist.map(cat => {
      if (cat.id !== catId) return cat;
      const newItems = cat.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return {
        ...cat,
        items: newItems,
        completedCount: newItems.filter(i => i.completed).length
      };
    });

    setChecklist(newChecklist);
    localStorage.setItem(`checklist-${selectedIdea.id}`, JSON.stringify(newChecklist));

    // Calculate progress
    const newDone = newChecklist.reduce((a, c) => a + c.completedCount, 0);
    const newTotal = newChecklist.reduce((a, c) => a + c.totalCount, 0);
    const newProgress = Math.round((newDone / newTotal) * 100);

    try {
      setSyncing(true);
      await supabase
        .from('ideas')
        .update({
          checklist_completed: newDone,
          checklist_total: newTotal,
          launch_progress: newProgress,
        })
        .eq('id', selectedIdea.id);

      setSelectedIdea(prev => prev ? {
        ...prev,
        checklistCompleted: newDone,
        checklistTotal: newTotal,
        launchProgress: newProgress,
      } : null);
    } catch (err) {
      console.error('Failed to sync checklist progress:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleLaunch = async () => {
    if (!selectedIdea) return;
    try {
      setSyncing(true);
      await supabase
        .from('ideas')
        .update({
          status: 'launched',
          stage: 'growth',
        })
        .eq('id', selectedIdea.id);

      setSelectedIdea(prev => prev ? { ...prev, status: 'launched', stage: 'growth' } : null);
    } catch (err) {
      console.error('Failed to launch idea:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto border-2 border-dashed rounded-xl border-border p-6">
        <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-sm">No ideas to track</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create an idea on the dashboard or My Ideas page to start tracking your launch readiness.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Launch Checklist</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your progress from idea to launch
          </p>
        </div>
        <Button
          variant="gradient"
          className="gap-2"
          disabled={overallPct < 100 || !selectedIdea || selectedIdea.status === 'launched' || syncing}
          onClick={handleLaunch}
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
          {selectedIdea?.status === 'launched' ? 'Launched!' : overallPct >= 100 ? 'Ready to Launch!' : 'Launch (WIP)'}
        </Button>
      </motion.div>

      {/* Overall Progress */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-brand-gradient" style={{ width: `${overallPct}%`, transition: 'width 0.5s ease' }} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Overall Progress</p>
              <p className="text-xs text-muted-foreground mt-0.5">{totalDone} of {totalItems} tasks complete</p>
            </div>
            <span className="text-4xl font-display font-bold gradient-text">{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-2" />
        </CardContent>
      </Card>

      {/* Idea Selector */}
      <div className="flex gap-2 flex-wrap">
        {ideas.map(idea => (
          <button
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
              selectedIdea?.id === idea.id
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'
            )}
          >
            {idea.title.length > 28 ? idea.title.slice(0, 28) + '…' : idea.title}
          </button>
        ))}
      </div>

      {/* Categories */}
      {selectedIdea && (
        <div className="space-y-4">
          {checklist.map((cat, catIndex) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.08 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        cat.completedCount === cat.totalCount
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {cat.completedCount === cat.totalCount ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{cat.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{cat.completedCount}/{cat.totalCount} complete</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cat.completedCount === cat.totalCount && (
                        <Badge variant="success" className="text-xs">Done</Badge>
                      )}
                      <span className="text-sm font-bold">{Math.round((cat.completedCount / cat.totalCount) * 100)}%</span>
                    </div>
                  </div>
                  <Progress value={(cat.completedCount / cat.totalCount) * 100} className="h-1.5 mt-2" />
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(cat.id, item.id)}
                      disabled={syncing}
                      className="w-full flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className={cn(
                        'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all',
                        item.completed
                          ? 'bg-primary border-primary'
                          : 'border-border group-hover:border-primary/50'
                      )}>
                        {item.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-sm font-medium', item.completed && 'line-through text-muted-foreground')}>
                            {item.title}
                          </span>
                          {item.required && !item.completed && (
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
