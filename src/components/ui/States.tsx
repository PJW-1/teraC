import type { ReactNode } from 'react';
import { CircleAlert, Inbox } from 'lucide-react';
import { Button } from './Button';
import { cn } from './cn';

type StateProps = {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

function StateLayout({ title, description, icon, action, className, role }: StateProps & { role?: string }) {
  return (
    <div role={role} className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted-bg text-fg-muted">{icon}</div>
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, ...props }: StateProps) {
  return <StateLayout icon={icon ?? <Inbox className="size-6" aria-hidden />} {...props} />;
}

export function ErrorState({
  title = '불러오지 못했습니다',
  description = '잠시 후 다시 시도해 주세요.',
  onRetry,
  icon,
  ...props
}: Partial<StateProps> & { onRetry?: () => void }) {
  return (
    <StateLayout
      role="alert"
      title={title}
      description={description}
      icon={icon ?? <CircleAlert className="size-6 text-danger" aria-hidden />}
      action={
        props.action ??
        (onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            다시 시도
          </Button>
        ))
      }
      className={props.className}
    />
  );
}
