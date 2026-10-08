import type { ComponentProps } from 'react';
import { cn } from './cn';

/** Status badges from design 4.3: 부족(danger), 정상(success), 감소(warning), 미확인·오래됨(neutral). */
type Tone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning';

const tones: Record<Tone, string> = {
  neutral: 'bg-muted-bg text-fg-muted',
  accent: 'bg-accent/10 text-accent',
  danger: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
};

export type BadgeProps = ComponentProps<'span'> & { tone?: Tone };

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone], className)}
      {...props}
    />
  );
}
