import type { ReactNode } from 'react';
import { Skeleton } from './ui';

/** Centered single-column screen for gates and system messages. */
export function FullScreen({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

export function FullScreenLoading() {
  return (
    <FullScreen>
      <div role="status" aria-label="불러오는 중" className="flex flex-col gap-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-row w-full" />
        <Skeleton className="h-row w-full" />
      </div>
    </FullScreen>
  );
}
