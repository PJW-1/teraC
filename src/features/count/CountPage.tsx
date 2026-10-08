import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { BottomSheet, Button, cn, EmptyState, SkeletonList, toast } from '../../components/ui';
import { groupByCategory } from '../../lib/inventory/catalog';
import { historyKeys, saveRecord } from '../../lib/inventory/historyApi';
import { useInventory } from '../../lib/inventory/inventoryContext';
import type { RecordItem } from '../../lib/inventory/records';
import { inventoryReport } from '../../lib/report/inventoryReport';
import { copyText } from '../../lib/report/reportText';
import { CompletionView } from './CompletionView';
import { CountItemRow } from './CountItemRow';
import { SubmitSheet } from './SubmitSheet';

/** /count. 제출한 뒤에는 완료 화면(?submitted=<기록 id>)을 보여 준다. */
export function CountPage() {
  const [params, setParams] = useSearchParams();
  const submitted = params.get('submitted');
  if (submitted) return <CompletionView recordId={submitted} onNewCount={() => setParams({})} />;
  return <CountScreen onSubmitted={recordId => setParams({ submitted: recordId })} />;
}

function CountScreen({ onSubmitted }: { onSubmitted: (recordId: string) => void }) {
  const { status, source, items, counts, setCount, stepCount, resetCounts } = useInventory();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sections = useMemo(() => groupByCategory(items), [items]);
  const countOf = (id: string) => counts[id] ?? null;
  const enteredOf = (list: typeof items) => list.filter(item => countOf(item.id) !== null).length;
  const entered = enteredOf(items);
  const zeros = items.filter(item => countOf(item.id) === 0).length;

  const jumpTo = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpToItem = (itemId: string) => {
    setSheetOpen(false);
    // 시트가 닫힌 뒤에 옮겨야 포커스가 그 줄에 남는다
    setTimeout(() => {
      const row = document.getElementById(`item-${itemId}`);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row?.querySelector('input')?.focus({ preventScroll: true });
    }, 250);
  };

  const submit = async () => {
    if (submitting || entered === 0) return;
    const at = new Date();
    const recordItems: RecordItem[] = items.map(({ id, name, category, unit }) => ({ id, name, category, unit, count: countOf(id) }));
    // iOS 는 탭 처리 중에 바로 불러야 복사를 허락한다
    const copied = copyText(inventoryReport(recordItems, at).text);
    setSheetOpen(false);
    setSubmitting(true);
    try {
      const record = await saveRecord(recordItems, at);
      void queryClient.invalidateQueries({ queryKey: historyKeys.all });
      queryClient.setQueryData(historyKeys.record(record.id), record);
      resetCounts();
      void copied.then(ok => ok && toast.success('보고서 텍스트를 복사했습니다.'));
      onSubmitted(record.id);
    } catch (error) {
      console.error('기록 저장 실패:', error);
      toast.error('기록을 저장하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요. 입력한 수량은 그대로 남아 있습니다.');
      setSubmitting(false);
    }
  };

  const ready = status === 'ready';

  return (
    <section className="mx-auto w-full max-w-3xl pb-[calc(var(--spacing-row)+1.5rem)]">
      <div className="sticky top-14 z-20 border-b border-border bg-surface/95 px-4 pt-3 pb-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-title font-bold">재고 조사</h1>
          <Button variant="ghost" disabled={submitting || entered === 0} onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-5" aria-hidden />
            초기화
          </Button>
        </div>
        {source === 'offline' && (
          <p className="mt-1 text-xs text-warning">서버에 연결하지 못해 이 기기에 받아 둔 품목 목록을 보여 주고 있습니다.</p>
        )}
        {ready && sections.length > 0 && (
          <nav aria-label="카테고리" className="-mx-4 mt-2 overflow-x-auto px-4">
            <ul className="flex gap-2">
              {sections.map((section, index) => {
                const n = enteredOf(section.items);
                return (
                  <li key={section.category} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => jumpTo(`category-${index}`)}
                      className={cn(
                        'min-h-touch rounded-full border px-4 text-sm font-semibold whitespace-nowrap',
                        'transition-transform duration-(--duration-press) active:scale-[0.97]',
                        n > 0 ? 'border-accent-fill bg-accent/10 text-accent' : 'border-border bg-surface text-fg',
                      )}
                    >
                      {section.category}
                      {n > 0 && (
                        <>
                          {' '}
                          <span className="tabular-nums">{n}</span>
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      {!ready ? (
        <div className="px-4 py-4">
          <SkeletonList rows={8} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="조사할 품목이 없습니다" description="관리 > 품목 관리에서 품목을 추가하면 여기에 표시됩니다." />
      ) : (
        sections.map((section, index) => (
          <section
            key={section.category}
            id={`category-${index}`}
            aria-labelledby={`category-title-${index}`}
            className="scroll-mt-44"
          >
            <h2 id={`category-title-${index}`} className="bg-bg px-4 pt-5 pb-2 text-sm font-bold text-fg-muted">
              {section.category}
            </h2>
            <ul className="divide-y divide-border border-y border-border bg-surface">
              {section.items.map(item => (
                <CountItemRow
                  key={item.id}
                  item={item}
                  quantity={countOf(item.id)}
                  locked={submitting}
                  onSet={setCount}
                  onStep={stepCount}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      {ready && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(var(--spacing-row)+env(safe-area-inset-bottom))] z-20 border-t border-border bg-surface/95 px-4 py-2 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <Button size="lg" fullWidth disabled={submitting} onClick={() => setSheetOpen(true)}>
              {submitting ? '제출하는 중…' : entered > 0 ? `조사 완료 · 입력 ${entered}개` : '조사 완료'}
            </Button>
          </div>
        </div>
      )}

      <SubmitSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        summary={{ entered, zeros }}
        notEnteredItems={items.filter(item => countOf(item.id) === null)}
        onJump={jumpToItem}
        onSubmit={() => void submit()}
      />

      <BottomSheet
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="입력 초기화"
        description="입력한 수량을 모두 미입력으로 되돌립니다. 품목은 그대로 남습니다."
        footer={
          <div className="flex flex-col gap-2">
            <Button
              variant="danger"
              size="lg"
              fullWidth
              onClick={() => {
                resetCounts();
                setResetOpen(false);
                toast.success('입력을 초기화했습니다.');
              }}
            >
              모두 미입력으로 되돌리기
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setResetOpen(false)}>
              취소
            </Button>
          </div>
        }
      />
    </section>
  );
}
