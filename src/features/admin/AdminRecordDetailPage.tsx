import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Badge, Card, CardTitle, EmptyState, ErrorState, SkeletonList, cn } from '../../components/ui';
import { groupByCategory } from '../../lib/inventory/catalog';
import { fetchRecord, fetchRecordsBefore, historyKeys } from '../../lib/inventory/historyApi';
import { compareItems, isChanged, previousCounts, summarizeRecord, type ComparedItem } from '../../lib/inventory/records';
import { formatDateTime, formatQuantity } from './format';
import { PageHeader, PageShell } from './parts';

const COMPARE_LIMIT = 10;

export function AdminRecordDetailPage() {
  const { recordId = '' } = useParams();
  const [changedOnly, setChangedOnly] = useState(false);
  const [showUnchecked, setShowUnchecked] = useState(false);

  const record = useQuery({ queryKey: historyKeys.record(recordId), queryFn: () => fetchRecord(recordId) });
  const older = useQuery({
    queryKey: historyKeys.before(recordId),
    queryFn: () => fetchRecordsBefore(record.data!, COMPARE_LIMIT),
    enabled: !!record.data,
  });

  const back = (
    <Link to="/admin/records" className="inline-flex min-h-touch items-center gap-1 self-start text-sm font-semibold text-fg-muted">
      <ArrowLeft className="size-4" aria-hidden />
      조사 기록
    </Link>
  );

  if (record.isError) {
    return (
      <PageShell>
        {back}
        <ErrorState onRetry={() => void record.refetch()} />
      </PageShell>
    );
  }
  if (record.data === null) {
    return (
      <PageShell>
        {back}
        <EmptyState icon={<SearchX className="size-6" aria-hidden />} title="기록을 찾을 수 없습니다" description="삭제되었거나 볼 수 없는 기록입니다." />
      </PageShell>
    );
  }
  if (!record.data) {
    return (
      <PageShell>
        {back}
        <SkeletonList rows={6} />
      </PageShell>
    );
  }

  const { entered, zeros } = summarizeRecord(record.data);
  const previous = new Map([...previousCounts(older.data ?? [])].map(([id, last]) => [id, last.count]));
  const rows = compareItems(record.data.items, previous);
  const visible = rows.filter(row => (showUnchecked || row.change !== 'unchecked') && (!changedOnly || isChanged(row)));
  const truncated = (older.data?.length ?? 0) >= COMPARE_LIMIT;

  return (
    <PageShell>
      {back}
      <PageHeader
        title="조사 기록 상세"
        description={`${formatDateTime(record.data.createdAt)} 조사 완료 · 입력 ${entered}개 · 0개 ${zeros}개`}
      />

      <Card className="flex flex-col gap-3 p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
          <CardTitle>품목별 수량</CardTitle>
          <div className="flex flex-wrap gap-x-4">
            <label className="flex min-h-touch items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="size-5 accent-(--color-accent-fill)"
                checked={changedOnly}
                onChange={e => setChangedOnly(e.target.checked)}
              />
              변화 있는 품목만 보기
            </label>
            <label className="flex min-h-touch items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="size-5 accent-(--color-accent-fill)"
                checked={showUnchecked}
                onChange={e => setShowUnchecked(e.target.checked)}
              />
              미입력 품목도 보기
            </label>
          </div>
        </div>
        <p className="px-4 text-sm text-fg-muted">
          {older.isError
            ? '이전 기록과 비교하지 못했습니다. 이번 기록의 수량만 보여 줍니다.'
            : '이전 값은 이 기록보다 앞서 저장된 기록에서 그 품목을 마지막으로 입력한 수량입니다.'}
          {truncated && ' 최근 10건의 조사에서 찾지 못한 품목은 이전 값 없이 표시됩니다.'}
        </p>
        {visible.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-fg-muted">보여 줄 품목이 없습니다.</p>
        ) : (
          groupByCategory(visible.map(row => ({ ...row, category: row.item.category }))).map(group => (
            <section key={group.category} aria-label={group.category}>
              <h3 className="border-y border-border bg-muted-bg px-4 py-2 text-sm font-bold">{group.category}</h3>
              <ul className="divide-y divide-border">
                {group.items.map(row => (
                  <EntryRow key={row.item.id} row={row} loadingPrevious={older.isPending && !older.isError} />
                ))}
              </ul>
            </section>
          ))
        )}
      </Card>
    </PageShell>
  );
}

const changeTone: Record<ComparedItem['change'], string> = {
  up: 'text-success',
  down: 'text-warning',
  zero: 'text-danger',
  same: 'text-fg-muted',
  none: 'text-fg-muted',
  unchecked: 'text-fg-muted',
};

function EntryRow({ row, loadingPrevious }: { row: ComparedItem; loadingPrevious: boolean }) {
  const { item, previous, delta, change } = row;
  const tag =
    change === 'up'
      ? `+${delta}`
      : change === 'down'
        ? `${delta}`
        : change === 'zero'
          ? '0이 됨'
          : change === 'same'
            ? '변화 없음'
            : change === 'none' && !loadingPrevious
              ? '이전 기록 없음'
              : null;
  return (
    <li aria-label={item.name} className={cn('flex min-h-row items-center gap-3 px-4 py-2', isChanged(row) && 'bg-muted-bg/50')}>
      <span className="min-w-0 flex-1 truncate font-semibold">{item.name}</span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        {item.count === null ? (
          <Badge>미입력</Badge>
        ) : (
          <span className={cn('text-qty', change === 'zero' && 'text-danger')}>{formatQuantity(item.count, item.unit)}</span>
        )}
        <span className="flex gap-2 text-xs">
          {previous !== null && <span className="text-fg-muted">{`이전 ${formatQuantity(previous, item.unit)}`}</span>}
          {tag && <span className={cn('font-semibold', changeTone[change])}>{tag}</span>}
        </span>
      </span>
    </li>
  );
}
