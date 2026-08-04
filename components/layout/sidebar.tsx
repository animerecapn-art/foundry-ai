'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Lightbulb,
  Archive,
  FlaskConical,
  FileText,
  Bot,
  Users,
  GitBranch,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  Crown,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Separator } from '@/components/ui/separator';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Ideas',
    href: '/ideas',
    icon: Lightbulb,
  },
  {
    label: 'Idea Vault',
    href: '/vault',
    icon: Archive,
  },
  {
    label: 'Reality Checks',
    href: '/reality-checks',
    icon: FlaskConical,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'AI Co-Founder',
    href: '/ai-cofounder',
    icon: Bot,
    badge: 'Beta',
  },
  {
    label: 'Community',
    href: '/community',
    icon: Users,
  },
];

const bottomNavItems = [
  {
    label: 'Version History',
    href: '/version-history',
    icon: GitBranch,
  },
  {
    label: 'Launch Checklist',
    href: '/launch-checklist',
    icon: CheckSquare,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, setUpgradeDialogOpen } = useAppStore();
  const { user, profile } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const plan = profile?.plan || 'free';

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border overflow-hidden"
    >
      {/* Toggle button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={cn(
          'absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-md text-muted-foreground hover:text-foreground transition-colors',
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-display font-bold text-lg whitespace-nowrap gradient-text">
                FoundryAI
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Idea Button */}
      <div className={cn('px-3 mb-4', sidebarCollapsed && 'px-2')}>
        <Button
          variant="gradient"
          size={sidebarCollapsed ? 'icon' : 'default'}
          className="w-full gap-2 shadow-glow-sm"
        >
          <Plus className="w-4 h-4" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                New Idea
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            collapsed={sidebarCollapsed}
          />
        ))}

        <div className="my-3 px-2">
          <Separator className="opacity-50" />
        </div>

        {navItems && bottomNavItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Upgrade to Pro Card */}
      <AnimatePresence>
        {!sidebarCollapsed && plan === 'free' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 rounded-xl bg-brand-gradient p-4 text-white shadow-glow-sm"
          >
            <div className="flex items-start gap-2 mb-2">
              <Crown className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">Upgrade to Pro</p>
                <p className="text-xs opacity-80 mt-0.5">Unlimited AI checks & reports</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full bg-white/20 hover:bg-white/30 border-0 text-white text-xs h-7"
              onClick={() => setUpgradeDialogOpen(true)}
            >
              Upgrade — $19/mo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Plan Active Card */}
      <AnimatePresence>
        {!sidebarCollapsed && plan === 'pro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Pro Plan Active</span>
            </div>
            <p className="text-[10px] text-muted-foreground">All features unlocked</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <div className={cn('border-t border-sidebar-border p-3', sidebarCollapsed && 'p-2')}>
        <div className={cn('flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors cursor-pointer group', sidebarCollapsed && 'justify-center')}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xs bg-brand-gradient text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

interface NavItemProps {
  item: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  };
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <div
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? item.label : undefined}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
        )}

        <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-primary')} />

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap flex-1"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {!collapsed && item.badge && (
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}
