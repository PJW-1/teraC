import type { ComponentProps } from 'react';
import { cn } from './cn';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div aria-hidden className={cn('animate-pulse rounded-control bg-muted-bg motion-reduce:animate-none', className)} {...props} />;
}

/** Placeholder rows for a list while it loads. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="불러오는 중" className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-row w-full" />
      ))}
    </div>
  );
}
