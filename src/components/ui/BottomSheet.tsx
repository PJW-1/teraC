import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from './cn';

export type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Actions pinned under the content, e.g. the main button. */
  footer?: ReactNode;
  className?: string;
};

/** Bottom sheet for confirmations and small forms (replaces alert/confirm, design 4.4). */
export function BottomSheet({ open, onOpenChange, title, description, children, footer, className }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-fg/40" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-lg flex-col',
            'rounded-t-sheet bg-surface shadow-sheet outline-none',
            className,
          )}
        >
          <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border" />
          <div className="px-5 pt-4 pb-2">
            <Drawer.Title className="text-lg font-bold">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-1 text-sm text-fg-muted">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          <div className="overflow-y-auto px-5 pb-4">{children}</div>
          {footer && <div className="border-t border-border px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
