import { Hammer } from 'lucide-react';
import { EmptyState } from './ui';

/** 아직 만들지 않은 화면 자리 */
export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-title font-bold">{title}</h1>
      <EmptyState
        className="mt-6 rounded-card border border-dashed border-border"
        icon={<Hammer className="size-6" aria-hidden />}
        title="준비 중입니다"
        description={description}
      />
    </section>
  );
}
