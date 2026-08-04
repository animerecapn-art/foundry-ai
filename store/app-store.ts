'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Notification } from '@/types';
import { mockNotifications } from '@/lib/mock-data';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      selectedIdeaId: null,
      notifications: mockNotifications,
      upgradeDialogOpen: false,

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),

      setSelectedIdeaId: (id: string | null) =>
        set({ selectedIdeaId: id }),

      setUpgradeDialogOpen: (open: boolean) =>
        set({ upgradeDialogOpen: open }),

      markNotificationRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n: Notification) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n: Notification) => ({
            ...n,
            read: true,
          })),
        })),
    }),
    {
      name: 'foundry-app-store',
      skipHydration: true,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
