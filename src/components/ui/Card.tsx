import type { ComponentProps } from 'react';
import { cn } from './cn';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-card border border-border bg-surface p-4 shadow-card', className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn('text-base font-bold', className)} {...props} />;
}
