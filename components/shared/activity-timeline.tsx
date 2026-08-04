'use client';

import { motion } from 'framer-motion';
import {
  Lightbulb, RefreshCw, FileText, CheckSquare,
  Rocket, GitBranch, Brain
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Activity } from '@/types';

const activityConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  idea_created: {
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  idea_updated: {
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  report_generated: {
    icon: <Brain className="w-3.5 h-3.5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  reality_check: {
    icon: <FileText className="w-3.5 h-3.5" />,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  launched: {
    icon: <Rocket className="w-3.5 h-3.5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  version_saved: {
    icon: <GitBranch className="w-3.5 h-3.5" />,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  checklist_item: {
    icon: <CheckSquare className="w-3.5 h-3.5" />,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-900/30',
  },
};

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityTimeline({ activities, maxItems = 6 }: ActivityTimelineProps) {
  const displayed = activities.slice(0, maxItems);

  return (
    <div className="space-y-0">
      {displayed.map((activity, index) => {
        const config = activityConfig[activity.type] || activityConfig.idea_updated;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {/* Timeline line */}
            {index < displayed.length - 1 && (
              <div className="absolute left-[17px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Icon */}
            <div className={cn('relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5', config.bg, config.color)}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-medium leading-tight">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
