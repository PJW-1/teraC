import type { ReactNode } from 'react';

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-title font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm break-keep text-fg-muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}

// 조사·기록 화면과 같은 폭(max-w-3xl)으로 하단 탭 틀 안에 놓인다
export function PageShell({ children }: { children: ReactNode }) {
  return <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">{children}</section>;
}
