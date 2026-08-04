'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Search, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap = {
  ideas: Lightbulb,
  search: Search,
  reports: FileText,
  vault: FolderOpen,
};

interface EmptyStateProps {
  icon?: keyof typeof iconMap;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = 'ideas', title, description, action }: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-gradient-subtle border border-primary/20 flex items-center justify-center">
          <Icon className="w-9 h-9 text-primary" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl -z-10" />
      </div>

      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>

      {action && (
        <Button
          variant="gradient"
          className="mt-6"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
