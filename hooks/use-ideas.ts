'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Idea } from '@/types';
import {
  getIdeas,
  getArchivedIdeas,
  createIdea,
  updateIdea,
  archiveIdea,
  restoreIdea,
  deleteIdea,
  type CreateIdeaInput,
  type UpdateIdeaInput,
} from '@/services/ideas';

// ─── Active ideas hook ────────────────────────────────────────────────────────

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getIdeas();
      setIdeas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const addIdea = async (input: CreateIdeaInput) => {
    const newIdea = await createIdea(input);
    setIdeas((prev) => [newIdea, ...prev]);
    return newIdea;
  };

  const editIdea = async (id: string, input: UpdateIdeaInput) => {
    const updated = await updateIdea(id, input);
    setIdeas((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  };

  const archive = async (id: string) => {
    await archiveIdea(id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const searchIdeas = (query: string) => {
    const q = query.toLowerCase();
    return ideas.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  };

  return { ideas, isLoading, error, addIdea, editIdea, archive, searchIdeas, refresh: fetchIdeas };
}

// ─── Archived ideas hook ──────────────────────────────────────────────────────

export function useArchivedIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getArchivedIdeas().then((data) => {
      setIdeas(data);
      setIsLoading(false);
    });
  }, []);

  const restore = async (id: string) => {
    await restoreIdea(id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const remove = async (id: string) => {
    await deleteIdea(id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  return { ideas, isLoading, restore, remove };
}
