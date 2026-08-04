import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export function Skeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/60',
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}

export function IdeaCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <div className="h-1 bg-muted/40" />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-14 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-1 flex-1 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === 0 ? 'w-48' : 'w-24 flex-1')} />
      ))}
    </div>
  );
}
