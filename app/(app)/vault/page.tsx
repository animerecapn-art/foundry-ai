'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Search, RotateCcw, Trash2, Loader2, Copy,
  Eye, GitBranch, Sparkles, Filter, ChevronDown, CheckCircle2,
  DollarSign, Landmark, Target, Award, ListFilter, AlertCircle,
  HelpCircle, CheckSquare, Milestone, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/shared/progress-ring';
import { EmptyState } from '@/components/shared/empty-state';
import { supabase } from '@/lib/supabase/client';
import { cn, formatDate, getScoreColor } from '@/lib/utils';
import {
  archiveIdea, restoreIdea, deleteIdea, duplicateIdea,
  deserializeDescription
} from '@/services/ideas';
import type { Idea, IdeaInputs } from '@/types';
import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToIdea(row: any): Idea {
  const desc = row.description || '';
  const inputs = deserializeDescription(desc);
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: inputs.oneLinePitch ? inputs.solution : desc,
    category: row.category || 'Other',
    status: row.status,
    stage: row.stage,
    realityScore: row.reality_score || 0,
    marketScore: row.market_score || 0,
    uniquenessScore: row.uniqueness_score || 0,
    feasibilityScore: row.feasibility_score || 0,
    launchProgress: row.launch_progress || 0,
    checklistCompleted: row.checklist_completed || 0,
    checklistTotal: row.checklist_total || 25,
    version: row.version || 1,
    tags: row.tags || [],
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    inputs,
  };
}

const INDUSTRIES = ['All', 'SaaS', 'Marketplace', 'Consumer App', 'Fintech', 'HealthTech', 'EdTech', 'E-commerce', 'Developer Tools', 'AI/ML', 'Other'];
const STAGES = ['All', 'concept', 'validation', 'mvp', 'growth', 'scale'];
const STATUSES = ['All', 'Active', 'Archived'];

export default function VaultPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filters
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedScore, setSelectedScore] = useState('All'); // 'All', 'High' (>80), 'Medium' (60-79), 'Low' (<60)

  // Selection for Compare
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const fetchAllIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setIdeas((data || []).map(mapRowToIdea));
    } catch (e) {
      console.error('Failed to load Vault ideas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllIdeas();
  }, []);

  const handleArchive = async (id: string, isArchived: boolean) => {
    try {
      if (isArchived) {
        await restoreIdea(id);
      } else {
        await archiveIdea(id);
      }
      await fetchAllIdeas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this startup idea? This will remove all versions and reports.')) return;
    try {
      await deleteIdea(id);
      await fetchAllIdeas();
      // Remove from comparison selection if it was there
      setSelectedForCompare(prev => prev.filter(x => x !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateIdea(id);
      await fetchAllIdeas();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCompareSelection = (ideaId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(ideaId)) {
        return prev.filter(id => id !== ideaId);
      }
      if (prev.length >= 2) {
        return [prev[1]!, ideaId];
      }
      return [...prev, ideaId];
    });
  };

  // Filter ideas logic
  const filtered = ideas.filter(idea => {
    // Search query match
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) ||
      (idea.inputs?.oneLinePitch || '').toLowerCase().includes(search.toLowerCase()) ||
      (idea.inputs?.problem || '').toLowerCase().includes(search.toLowerCase());

    // Industry filter match
    const matchesIndustry = selectedIndustry === 'All' || idea.category === selectedIndustry;

    // Stage filter match
    const matchesStage = selectedStage === 'All' || idea.stage === selectedStage;

    // Status filter match
    const isArchived = idea.status === 'archived' || idea.is_archived === true;
    const matchesStatus = selectedStatus === 'All' || 
      (selectedStatus === 'Active' && !isArchived) ||
      (selectedStatus === 'Archived' && isArchived);

    // Score filter match
    const score = idea.realityScore;
    let matchesScore = true;
    if (selectedScore === 'High') matchesScore = score >= 80;
    else if (selectedScore === 'Medium') matchesScore = score >= 60 && score < 80;
    else if (selectedScore === 'Low') matchesScore = score > 0 && score < 60;

    return matchesSearch && matchesIndustry && matchesStage && matchesStatus && matchesScore;
  });

  const compareIdea1 = ideas.find(i => i.id === selectedForCompare[0]);
  const compareIdea2 = ideas.find(i => i.id === selectedForCompare[1]);

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Archive className="w-4 h-4 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Idea Vault</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {ideas.length} saved startup ideas and reports in your vault
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedForCompare.length === 2 && (
            <Button variant="gradient" size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => setCompareModalOpen(true)}>
              <Milestone className="w-4 h-4" /> Compare Selected
            </Button>
          )}
          <Link href="/reality-checks">
            <Button variant="gradient" size="sm" className="gap-1.5 text-xs font-semibold">
              <Plus className="w-4 h-4" /> New Reality Check
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Toolbar / Search & Filters */}
      <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, pitch or problem statement..."
              className="pl-9 h-9 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Detailed filters row */}
        <div className="flex flex-wrap gap-2.5 items-center pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          {/* Industry */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">Industry:</span>
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-[11px] focus:outline-none"
            >
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          {/* Stage */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">Stage:</span>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-[11px] focus:outline-none"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-[11px] focus:outline-none"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Reality Score */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">Reality Score:</span>
            <select
              value={selectedScore}
              onChange={e => setSelectedScore(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-[11px] focus:outline-none"
            >
              <option value="All">All Scores</option>
              <option value="High">High (80+)</option>
              <option value="Medium">Medium (60-79)</option>
              <option value="Low">Low (&lt;60)</option>
            </select>
          </div>

          {(selectedIndustry !== 'All' || selectedStage !== 'All' || selectedStatus !== 'All' || selectedScore !== 'All' || search) && (
            <button
              onClick={() => {
                setSelectedIndustry('All');
                setSelectedStage('All');
                setSelectedStatus('All');
                setSelectedScore('All');
                setSearch('');
              }}
              className="text-[11px] text-primary hover:underline font-semibold ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="vault"
          title={search || selectedIndustry !== 'All' || selectedStage !== 'All' || selectedStatus !== 'All' || selectedScore !== 'All' ? "No matching ideas found" : "Your Vault is empty"}
          description={search ? `No ideas match "${search}". Try adjusting your filters.` : "Analyze startup concepts with AI to save your first business report in the vault."}
          action={!(search || selectedIndustry !== 'All') ? { label: 'Analyze Your First Idea', onClick: () => router.push('/reality-checks') } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((idea, index) => {
            const isArchived = idea.status === 'archived' || idea.is_archived === true;
            const isSelected = selectedForCompare.includes(idea.id);

            return (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
                  isArchived && "opacity-75 bg-muted/20"
                )}
              >
                {/* Checkbox for Compare */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCompareSelection(idea.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                {/* Score Indicator */}
                <div className="flex-shrink-0">
                  {idea.realityScore > 0 ? (
                    <ProgressRing value={idea.realityScore} size={48} strokeWidth={4} />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground font-semibold">
                      v{idea.version}
                    </div>
                  )}
                </div>

                {/* Info Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm truncate max-w-[200px] sm:max-w-xs">{idea.title}</h3>
                    <Badge variant={isArchived ? "outline" : "info"} className="text-[10px] py-0 px-1.5">
                      {isArchived ? "Archived" : "v" + idea.version}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                      {idea.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate leading-relaxed max-w-sm sm:max-w-xl">
                    {idea.inputs?.oneLinePitch || idea.description || 'No pitch provided.'}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Updated {formatDate(idea.updatedAt)} · Stage: {getStageLabel(idea.stage)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 ml-auto sm:ml-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/ideas/${idea.id}`}>
                    <Button variant="outline" size="icon-sm" className="h-7 w-7" title="View details">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon-sm" className="h-7 w-7 text-muted-foreground" onClick={() => handleDuplicate(idea.id)} title="Duplicate Idea">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="icon-sm" className="h-7 w-7 text-muted-foreground" onClick={() => handleArchive(idea.id, isArchived)} title={isArchived ? "Restore to active" : "Archive Idea"}>
                    {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="outline" size="icon-sm" className="h-7 w-7 text-destructive hover:bg-destructive hover:text-white" onClick={() => handleDelete(idea.id)} title="Permanently delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VERSION COMPARE SIDE-BY-SIDE MODAL */}
      <AnimatePresence>
        {compareModalOpen && compareIdea1 && compareIdea2 && (
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
                  <Milestone className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-lg">Compare Startup Concepts</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCompareModalOpen(false)}>Close</Button>
              </div>

              {/* Modal Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                <div className="grid grid-cols-3 gap-4 border-b pb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div>Field Profile</div>
                  <div>{compareIdea1.title}</div>
                  <div>{compareIdea2.title}</div>
                </div>

                {/* Score comparison */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b items-center">
                  <div className="font-semibold text-foreground">AI Reality Score</div>
                  <div className={cn("text-base font-bold", getScoreColor(compareIdea1.realityScore))}>
                    {compareIdea1.realityScore > 0 ? `${compareIdea1.realityScore}/100` : 'No report'}
                  </div>
                  <div className={cn("text-base font-bold", getScoreColor(compareIdea2.realityScore))}>
                    {compareIdea2.realityScore > 0 ? `${compareIdea2.realityScore}/100` : 'No report'}
                  </div>
                </div>

                {/* One line pitch */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">One-line Pitch</div>
                  <div className="italic text-xs text-muted-foreground leading-relaxed">{compareIdea1.inputs?.oneLinePitch || 'N/A'}</div>
                  <div className="italic text-xs text-muted-foreground leading-relaxed">{compareIdea2.inputs?.oneLinePitch || 'N/A'}</div>
                </div>

                {/* Problem Statement */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Problem Statement</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareIdea1.inputs?.problem || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareIdea2.inputs?.problem || 'N/A'}</div>
                </div>

                {/* Solution Model */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Solution Model</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareIdea1.inputs?.solution || compareIdea1.description || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{compareIdea2.inputs?.solution || compareIdea2.description || 'N/A'}</div>
                </div>

                {/* Target Audience */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Target Customers</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareIdea1.inputs?.targetAudience || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareIdea2.inputs?.targetAudience || 'N/A'}</div>
                </div>

                {/* Business Model */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Business Model</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareIdea1.inputs?.businessModel || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{compareIdea2.inputs?.businessModel || 'N/A'}</div>
                </div>

                {/* Target Geography */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <div className="font-semibold text-foreground">Geography</div>
                  <div className="text-xs text-muted-foreground font-semibold">{compareIdea1.inputs?.country || 'United States'}</div>
                  <div className="text-xs text-muted-foreground font-semibold">{compareIdea2.inputs?.country || 'United States'}</div>
                </div>

                {/* Industry Category */}
                <div className="grid grid-cols-3 gap-4 py-3">
                  <div className="font-semibold text-foreground">Industry Category</div>
                  <div className="text-xs"><Badge variant="info">{compareIdea1.category}</Badge></div>
                  <div className="text-xs"><Badge variant="info">{compareIdea2.category}</Badge></div>
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
