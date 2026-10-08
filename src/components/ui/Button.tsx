import type { ComponentProps } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary/90',
  secondary: 'border border-border bg-surface text-fg hover:bg-muted-bg',
  ghost: 'bg-transparent text-fg hover:bg-muted-bg',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

// Every size keeps the 44px minimum touch target.
const sizes: Record<Size, string> = {
  md: 'min-h-touch px-4 text-base',
  lg: 'min-h-row px-5 text-lg',
  icon: 'size-touch',
};

export type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

export function Button({ variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold select-none',
        'transition-[transform,background-color,opacity] duration-(--duration-press) ease-out',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
}
