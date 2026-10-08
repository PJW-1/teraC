import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button, cn } from '../../components/ui';
import type { CatalogItem } from '../../lib/inventory/catalog';
import { formatQuantity, parseQuantityInput } from '../../lib/quantity';

type Props = {
  item: CatalogItem;
  quantity: number | null;
  locked: boolean;
  onSet: (id: string, value: number | null) => void;
  onStep: (id: string, direction: 1 | -1) => void;
};

const stateStyles = {
  empty: 'border-border bg-muted-bg text-fg-muted',
  zero: 'border-danger/40 bg-danger/10 text-danger',
  counted: 'border-accent-fill bg-surface text-fg',
};

/** 품목 한 줄: [-] 수량 [+]. 비어 있으면 미입력, 0은 빨간색으로 보인다. */
export function CountItemRow({ item, quantity, locked, onSet, onStep }: Props) {
  // 입력하는 동안의 글자("1." 이나 "" 도 칠 수 있게)
  const [text, setText] = useState<string | null>(null);
  const state = quantity === null ? 'empty' : quantity === 0 ? 'zero' : 'counted';
  const invalid = text !== null && !parseQuantityInput(text).ok;

  const step = (direction: 1 | -1) => {
    setText(null);
    onStep(item.id, direction);
  };

  return (
    <li id={`item-${item.id}`} className={cn('flex min-h-row items-center gap-2 px-4 py-1.5', state !== 'empty' && 'bg-accent/5')}>
      <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
        <span className={cn('truncate font-semibold', state === 'empty' && 'text-fg-muted')}>{item.name}</span>
        <span className="shrink-0 text-xs text-fg-muted">({item.unit})</span>
      </div>
      <Button variant="secondary" size="icon" aria-label={`${item.name} 줄이기`} disabled={locked} onClick={() => step(-1)}>
        <Minus className="size-5" aria-hidden />
      </Button>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={`${item.name} 수량`}
        aria-invalid={invalid || undefined}
        data-state={state}
        placeholder="미입력"
        disabled={locked}
        value={text ?? formatQuantity(quantity)}
        onChange={e => {
          setText(e.target.value);
          const parsed = parseQuantityInput(e.target.value);
          if (parsed.ok) onSet(item.id, parsed.value);
        }}
        onBlur={() => setText(null)}
        className={cn(
          'h-touch w-20 shrink-0 rounded-control border text-center text-qty tabular-nums outline-none',
          'placeholder:text-sm placeholder:font-normal placeholder:text-fg-muted',
          'transition-colors duration-(--duration-change) focus-visible:border-accent disabled:opacity-60',
          stateStyles[state],
          invalid && 'border-danger',
        )}
      />
      <Button size="icon" aria-label={`${item.name} 늘리기`} disabled={locked} onClick={() => step(1)}>
        <Plus className="size-5" aria-hidden />
      </Button>
    </li>
  );
}
