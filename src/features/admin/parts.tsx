import type { ReactNode } from 'react';

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
