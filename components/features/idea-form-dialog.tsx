'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Idea } from '@/types';

const ideaSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(2000, 'Keep description under 2000 characters').optional(),
  category: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

const categories = [
  'SaaS', 'Marketplace', 'Consumer App', 'Fintech', 'HealthTech',
  'EdTech', 'E-commerce', 'Developer Tools', 'AI/ML', 'Other',
];

interface IdeaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: IdeaFormValues) => Promise<void>;
  defaultValues?: Partial<Idea>;
  mode?: 'create' | 'edit';
}

export function IdeaFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = 'create',
}: IdeaFormDialogProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      category: defaultValues?.category || 'Other',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues?.title || '',
        description: defaultValues?.description || '',
        category: defaultValues?.category || 'Other',
      });
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = async (values: IdeaFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="font-display">
              {mode === 'create' ? 'New Idea' : 'Edit Idea'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === 'create'
              ? "Capture your idea. Don't worry about perfection — you can refine it later."
              : 'Update your idea details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Idea Title *</label>
            <Input
              placeholder="e.g. AI-powered legal document analyzer"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <select
              {...register('category')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register('description')}
              placeholder="What problem does it solve? Who is the target customer? What's your unique insight?"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                mode === 'create' ? 'Add Idea' : 'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
