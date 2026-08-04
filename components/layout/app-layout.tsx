'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { useIsMobile } from '@/hooks/use-media-query';
import { useAppStore } from '@/store/app-store';
import { PricingDialog } from '@/components/features/pricing-dialog';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  // Rehydrate Zustand store from localStorage after mount
  // (skipHydration: true prevents SSR/client mismatch)
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {!isMobile && <Sidebar />}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <PricingDialog />
    </div>
  );
}
