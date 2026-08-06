import { supabase } from '@/lib/supabase/client';
import type { Idea, IdeaInputs } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateIdeaInput = {
  title: string;
  description?: string;
  category?: string;
  stage?: string;
  tags?: { id: string; name: string; color: string }[];
  inputs?: IdeaInputs;
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
  version: number;
  inputs: IdeaInputs;
  realityScore: number;
  marketScore: number;
  uniquenessScore: number;
  feasibilityScore: number;
}>;

// ─── Serialization Helpers ───────────────────────────────────────────────────

export function serializeDescription(inputs: IdeaInputs): string {
  return JSON.stringify(inputs);
}

export function deserializeDescription(desc: string): IdeaInputs {
  try {
    const parsed = JSON.parse(desc);
    if (parsed && typeof parsed === 'object' && 'oneLinePitch' in parsed) {
      return parsed as IdeaInputs;
    }
  } catch (e) {
    // Not serialized JSON
  }
  return {
    oneLinePitch: '',
    problem: '',
    solution: desc || '',
    targetAudience: '',
    businessModel: '',
    country: '',
    additionalNotes: '',
  };
}

// ─── Map DB row → Idea type ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToIdea(row: any): Idea {
  const desc = row.description || '';
  const inputs = deserializeDescription(desc);

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: inputs.oneLinePitch ? inputs.solution : desc, // backward compatibility: show raw description or solution
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

  const inputs: IdeaInputs = input.inputs || {
    oneLinePitch: '',
    problem: '',
    solution: input.description || '',
    targetAudience: '',
    businessModel: '',
    country: '',
    additionalNotes: '',
  };

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      user_id: user.id,
      title: input.title,
      description: serializeDescription(inputs),
      category: input.category || 'Other',
      stage: input.stage || 'concept',
      tags: input.tags || [],
      version: 1,
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
  const updateData: any = { ...input, updated_at: new Date().toISOString() };

  // Map camelCase fields to snake_case if present
  if (input.realityScore !== undefined) {
    updateData.reality_score = input.realityScore;
    delete updateData.realityScore;
  }
  if (input.marketScore !== undefined) {
    updateData.market_score = input.marketScore;
    delete updateData.marketScore;
  }
  if (input.uniquenessScore !== undefined) {
    updateData.uniqueness_score = input.uniquenessScore;
    delete updateData.uniquenessScore;
  }
  if (input.feasibilityScore !== undefined) {
    updateData.feasibility_score = input.feasibilityScore;
    delete updateData.feasibilityScore;
  }

  // Handle inputs serialization
  if (input.inputs) {
    updateData.description = serializeDescription(input.inputs);
    delete updateData.inputs;
  }

  const { data, error } = await supabase
    .from('ideas')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToIdea(data);
}

export async function duplicateIdea(id: string): Promise<Idea> {
  const idea = await getIdeaById(id);
  if (!idea) throw new Error('Idea not found');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const inputsCopy = { ...idea.inputs };

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      user_id: user.id,
      title: `${idea.title} (Copy)`,
      description: serializeDescription(inputsCopy),
      category: idea.category,
      stage: 'concept',
      status: 'draft',
      reality_score: 0,
      market_score: 0,
      uniqueness_score: 0,
      feasibility_score: 0,
      tags: idea.tags || [],
      notes: idea.notes || '',
      version: 1,
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
    title: 'Idea Duplicated',
    description: `Duplicated "${idea.title}" as "${data.title}"`,
  });

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

  // Fetch actual reports count
  const { count, error: countError } = await supabase
    .from('reality_checks')
    .select('*', { count: 'exact', head: true });

  const reportsCount = countError ? 0 : (count || 0);

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
    reportsGenerated: reportsCount,
  };
}
