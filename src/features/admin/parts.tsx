import type { ReactNode } from 'react';
import { Badge } from '../../components/ui';
import type { StockRow } from '../../lib/inventory/records';

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-title font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8">{children}</section>;
}

export function StockBadges({ row }: { row: StockRow }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {row.status === 'unchecked' && <Badge>미확인</Badge>}
      {row.status === 'zero' && <Badge tone="danger">0개</Badge>}
      {row.isStale && <Badge>오래됨</Badge>}
    </span>
  );
}
