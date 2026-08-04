'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, Tag as TagIcon, GitBranch } from 'lucide-react';
import { cn, formatRelativeTime, getStatusColor, getStageLabel, truncateText } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/shared/progress-ring';
import { Progress } from '@/components/ui/progress';
import type { Idea } from '@/types';

interface IdeaCardProps {
  idea: Idea;
  view?: 'grid' | 'list';
  index?: number;
}

const stageStepMap: Record<string, number> = {
  concept: 1,
  validation: 2,
  mvp: 3,
  growth: 4,
  scale: 5,
};

export function IdeaCard({ idea, view = 'grid', index = 0 }: IdeaCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/ideas/${idea.id}`);
  };

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06 }}
        whileHover={{ x: 2 }}
        onClick={handleClick}
        className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
      >
        <ProgressRing value={idea.realityScore} size={52} strokeWidth={4} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="font-display font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {idea.title}
            </h3>
            <Badge variant="outline" className={cn('shrink-0 text-xs', getStatusColor(idea.status))}>
              {idea.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {truncateText(idea.description, 90)}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatRelativeTime(idea.updatedAt)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GitBranch className="w-3 h-3" />
              v{idea.version}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {idea.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="w-24 hidden md:block">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Launch</span>
            <span className="text-xs font-medium">{idea.launchProgress}%</span>
          </div>
          <Progress value={idea.launchProgress} className="h-1.5" />
        </div>

        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      onClick={handleClick}
      className="group flex flex-col rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all cursor-pointer overflow-hidden"
    >
      {/* Card top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${idea.tags[0]?.color || '#8B5CF6'}, ${idea.tags[1]?.color || '#3B82F6'})`,
        }}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Badge
              variant="outline"
              className={cn('mb-2 text-xs', getStatusColor(idea.status))}
            >
              {idea.status}
            </Badge>
            <h3 className="font-display font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {idea.title}
            </h3>
          </div>
          <ProgressRing value={idea.realityScore} size={56} strokeWidth={5} />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
          {idea.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {idea.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              <TagIcon className="w-2.5 h-2.5" />
              {tag.name}
            </span>
          ))}
        </div>

        {/* Stage progress */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">
              Stage: {getStageLabel(idea.stage)}
            </span>
            <span className="text-xs font-semibold">{stageStepMap[idea.stage]}/5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all',
                  step <= stageStepMap[idea.stage] ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatRelativeTime(idea.updatedAt)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="w-3 h-3" />
            v{idea.version}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
