import { useRef, useState } from 'react';
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
  empty: 'border-border bg-surface text-fg-muted',
  zero: 'border-danger/40 bg-danger/10 text-danger',
  counted: 'border-accent-fill bg-primary/15 text-fg',
};

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** 품목 한 줄: [-] 수량 [+]. 비어 있으면 미입력, 0은 빨간색으로 보인다. */
export function CountItemRow({ item, quantity, locked, onSet, onStep }: Props) {
  // 입력하는 동안의 글자("1." 이나 "" 도 칠 수 있게)
  const [text, setText] = useState<string | null>(null);
  const state = quantity === null ? 'empty' : quantity === 0 ? 'zero' : 'counted';
  const invalid = text !== null && !parseQuantityInput(text).ok;
  const inputRef = useRef<HTMLInputElement>(null);

  const step = (direction: 1 | -1) => {
    setText(null);
    onStep(item.id, direction);
    // 바뀐 수량이 눈에 들어오게 살짝 튀게 한다(jsdom 등 animate 가 없는 환경은 건너뛴다)
    if (!prefersReducedMotion()) {
      inputRef.current?.animate?.([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], {
        duration: 220,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      });
    }
  };

  return (
    <li id={`item-${item.id}`} className="flex min-h-13 items-center gap-1.5 px-3 py-2">
      {/* 좁은 화면에서는 이름을 자르지 않고 두 줄로 보여 준다(품목을 알아볼 수 있게). 칸보다 긴 한 단어만 중간에서 끊는다. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
        <span className={cn('text-item font-medium break-keep wrap-anywhere', state === 'empty' && 'text-fg-muted')}>{item.name}</span>
        <span className="shrink-0 text-xs text-fg-muted">({item.unit})</span>
      </div>
      <Button variant="soft" size="icon-sm" aria-label={`${item.name} 줄이기`} disabled={locked} onClick={() => step(-1)}>
        <Minus className="size-4" aria-hidden />
      </Button>
      <input
        ref={inputRef}
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
          'h-9 w-16 shrink-0 rounded-control border text-center text-lg font-semibold tabular-nums outline-none',
          'placeholder:text-xs placeholder:font-normal placeholder:text-fg-muted',
          'transition-colors duration-(--duration-change) focus-visible:border-accent disabled:opacity-60',
          stateStyles[state],
          invalid && 'border-danger',
        )}
      />
      <Button variant="soft" size="icon-sm" aria-label={`${item.name} 늘리기`} disabled={locked} onClick={() => step(1)}>
        <Plus className="size-4" aria-hidden />
      </Button>
    </li>
  );
}
