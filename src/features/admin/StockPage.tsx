import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Button, Card, EmptyState, ErrorState, SkeletonList } from '../../components/ui';
import { groupByCategory } from '../../lib/inventory/catalog';
import { fetchRecords, historyKeys } from '../../lib/inventory/historyApi';
import { useInventory } from '../../lib/inventory/inventoryContext';
import { STALE_AFTER_DAYS, buildStock, type StockRow } from '../../lib/inventory/records';
import { formatQuantity, formatRelative } from './format';
import { PageHeader, PageShell, StockBadges } from './parts';

type Filter = 'all' | 'zero' | 'unchecked';
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'zero', label: '0개' },
  { id: 'unchecked', label: '미확인' },
];

export function StockPage() {
  const { status, items } = useInventory();
  const history = useQuery({ queryKey: historyKeys.recent(30), queryFn: () => fetchRecords(0, 30), refetchInterval: 60_000 });
  const [filter, setFilter] = useState<Filter>('all');

  const header = (
    <PageHeader
      title="재고 현황"
      description={`최근 30건의 조사 기록에서 품목마다 마지막으로 입력한 수량입니다. ${STALE_AFTER_DAYS}일 넘게 확인하지 않은 값은 "오래됨"으로 표시합니다.`}
    />
  );

  if (history.isError) {
    return (
      <PageShell>
        {header}
        <ErrorState onRetry={() => void history.refetch()} />
      </PageShell>
    );
  }
  if (status === 'loading' || !history.data) {
    return (
      <PageShell>
        {header}
        <SkeletonList rows={6} />
      </PageShell>
    );
  }

  const now = new Date(history.dataUpdatedAt);
  const rows = buildStock(items, history.data, now).filter(row => filter === 'all' || row.status === filter);
  const groups = groupByCategory(rows.map(row => ({ ...row, category: row.item.category })));

  return (
    <PageShell>
      {header}
      {items.length === 0 ? (
        <EmptyState
          title="등록된 품목이 없습니다"
          description="품목 관리에서 품목을 추가하면 여기에 마지막 수량이 표시됩니다."
          action={
            <Link to="/admin/items" className="font-semibold text-accent">
              품목 관리로 이동
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <Button key={f.id} variant={filter === f.id ? 'primary' : 'secondary'} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </Button>
            ))}
          </div>
          {groups.length === 0 && <p className="text-sm text-fg-muted">해당하는 품목이 없습니다.</p>}
          {groups.map(group => (
            <Card key={group.category} className="p-0">
              <h2 className="flex items-center gap-2 border-b border-border px-4 py-3 text-base font-bold">
                {group.category} <span className="text-sm font-normal text-fg-muted">{group.items.length}</span>
              </h2>
              <div
                aria-hidden
                className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_minmax(0,2fr)] gap-3 border-b border-border px-4 py-2 text-xs font-semibold text-fg-muted md:grid"
              >
                <span>품목</span>
                <span className="text-right">마지막 수량</span>
                <span>상태</span>
                <span>마지막 확인</span>
              </div>
              <ul className="divide-y divide-border">
                {group.items.map(row => (
                  <StockRowView key={row.item.id} row={row} now={now} />
                ))}
              </ul>
            </Card>
          ))}
        </>
      )}
    </PageShell>
  );
}

function StockRowView({ row, now }: { row: StockRow; now: Date }) {
  const { item, last } = row;
  return (
    <li
      aria-label={item.name}
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_minmax(0,2fr)] md:items-center"
    >
      <span className="truncate font-semibold">{item.name}</span>
      <span className={`text-right text-qty md:text-base md:font-semibold ${row.status === 'zero' ? 'text-danger' : ''}`}>
        {last ? formatQuantity(last.count, item.unit) : '–'}
      </span>
      <span>
        <StockBadges row={row} />
      </span>
      <span className="col-span-2 text-xs text-fg-muted md:col-span-1 md:text-sm">
        {last ? `${formatRelative(last.at, now)} 확인` : '아직 입력한 적이 없습니다'}
      </span>
    </li>
  );
}
