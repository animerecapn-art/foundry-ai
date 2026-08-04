import { supabase } from '@/lib/supabase/client';
import type { Idea } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateIdeaInput = {
  title: string;
  description?: string;
  category?: string;
  tags?: { id: string; name: string; color: string }[];
};

export type UpdateIdeaInput = Partial<{
  title: string;
  description: string;
  category: string;
  status: string;
  stage: string;
  tags: { id: string; name: string; color: string }[];
  notes: string;
  is_archived: boolean;
}>;

// ─── Map DB row → Idea type ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToIdea(row: any): Idea {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    category: row.category || 'Other',
    status: row.status,
    stage: row.stage,
    realityScore: row.reality_score,
    marketScore: row.market_score,
    uniquenessScore: row.uniqueness_score,
    feasibilityScore: row.feasibility_score,
    launchProgress: row.launch_progress,
    checklistCompleted: row.checklist_completed,
    checklistTotal: row.checklist_total,
    version: row.version,
    tags: row.tags || [],
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function getIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(mapRowToIdea);
}

export async function getArchivedIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('is_archived', true)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(mapRowToIdea);
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapRowToIdea(data);
}

export async function createIdea(input: CreateIdeaInput): Promise<Idea> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || '',
      category: input.category || 'Other',
      tags: input.tags || [],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Log activity
  await supabase.from('activities').insert({
    user_id: user.id,
    idea_id: data.id,
    idea_title: data.title,
    type: 'idea_created',
    title: 'New Idea Added',
    description: `Created "${data.title}"`,
  });

  return mapRowToIdea(data);
}

export async function updateIdea(id: string, input: UpdateIdeaInput): Promise<Idea> {
  const { data, error } = await supabase
    .from('ideas')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToIdea(data);
}

export async function archiveIdea(id: string): Promise<void> {
  const { error } = await supabase
    .from('ideas')
    .update({ is_archived: true, status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function restoreIdea(id: string): Promise<void> {
  const { error } = await supabase
    .from('ideas')
    .update({ is_archived: false, status: 'draft', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteIdea(id: string): Promise<void> {
  const { error } = await supabase.from('ideas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('ideas')
    .select('reality_score, status, is_archived');

  if (error) throw new Error(error.message);

  const ideas = data || [];
  const active = ideas.filter((i) => !i.is_archived);
  const launched = active.filter((i) => i.status === 'launched');
  const avgScore = active.length
    ? Math.round(active.reduce((s, i) => s + (i.reality_score || 0), 0) / active.length)
    : 0;

  return {
    totalIdeas: active.length,
    launchedIdeas: launched.length,
    averageScore: avgScore,
    reportsGenerated: active.length * 2, // placeholder
  };
}
