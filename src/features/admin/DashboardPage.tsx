import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Badge, Card, CardTitle, EmptyState, ErrorState, Skeleton, SkeletonList } from '../../components/ui';
import { fetchRecords, historyKeys } from '../../lib/inventory/historyApi';
import { useInventory } from '../../lib/inventory/inventoryContext';
import { buildStock, summarizeRecord } from '../../lib/inventory/records';
import { formatDateTime, formatQuantity, formatRelative } from './format';
import { PageHeader, PageShell } from './parts';

const RECENT = 5;
const RECENT_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
// 다른 기기에서 제출한 조사도 보이도록 주기적으로 다시 읽는다.
const REFRESH_MS = 60_000;

export function DashboardPage() {
  const { status, items } = useInventory();
  const history = useQuery({ queryKey: historyKeys.recent(30), queryFn: () => fetchRecords(0, 30), refetchInterval: REFRESH_MS });

  const header = <PageHeader title="대시보드" description="최근 30건의 조사 기록으로 계산합니다." />;
  if (history.isError) {
    return (
      <PageShell>
        <PageHeader title="대시보드" />
        <ErrorState onRetry={() => void history.refetch()} />
      </PageShell>
    );
  }

  const records = history.data;
  const now = new Date(history.dataUpdatedAt);
  const stock = records && status === 'ready' ? buildStock(items, records, now) : null;
  const zeroRows = stock?.filter(row => row.status === 'zero');
  const uncheckedCount = stock?.filter(row => row.status === 'unchecked').length;
  const recentCount = records?.filter(r => now.getTime() - new Date(r.createdAt).getTime() <= RECENT_DAYS * DAY_MS).length;
  const latest = records?.[0];
  const latestSummary = latest && summarizeRecord(latest);

  return (
    <PageShell>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="등록 품목" value={status === 'ready' ? items.length : undefined} />
        <Kpi
          label="0개 품목"
          value={zeroRows?.length}
          tone={zeroRows && zeroRows.length > 0 ? 'text-danger' : undefined}
          sub={zeroRows && zeroRows.length > 0 ? `그중 오래됨 ${zeroRows.filter(r => r.isStale).length}개` : undefined}
        />
        <Kpi label="미확인 품목" value={uncheckedCount} sub="한 번도 입력하지 않은 품목" />
        <Kpi label="최근 7일 조사" value={recentCount === undefined ? undefined : `${recentCount}건`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="마지막 조사">
          {!records ? (
            <Skeleton className="h-20 w-full" />
          ) : !latest || !latestSummary ? (
            <p className="text-sm text-fg-muted">아직 제출된 조사가 없습니다.</p>
          ) : (
            <Link to={`/admin/records/${latest.id}`} className="flex items-center justify-between gap-3 rounded-control p-1 hover:bg-muted-bg">
              <div className="min-w-0">
                <p className="text-sm text-fg-muted">
                  {formatRelative(latest.createdAt, now)} · {formatDateTime(latest.createdAt)}
                </p>
                <p className="mt-1 text-lg font-bold">{`입력 ${latestSummary.entered}개 · 0개 ${latestSummary.zeros}개`}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-fg-muted" aria-hidden />
            </Link>
          )}
        </Section>

        <Section title="0개 품목" action={<Link to="/admin/stock" className="text-sm font-semibold text-accent">전체 보기</Link>}>
          {!zeroRows ? (
            <SkeletonList rows={3} />
          ) : zeroRows.length === 0 ? (
            <p className="text-sm text-fg-muted">0개로 입력된 품목이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-border">
              {zeroRows.map(row => (
                <li key={row.item.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{row.item.name}</p>
                    <p className="text-xs text-fg-muted">{row.last && `${formatRelative(row.last.at, now)} 확인`}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {row.isStale && <Badge>오래됨</Badge>}
                    <span className="text-sm font-semibold whitespace-nowrap text-danger">{formatQuantity(0, row.item.unit)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="최근 제출" action={<Link to="/admin/records" className="text-sm font-semibold text-accent">전체 기록</Link>}>
        {!records ? (
          <SkeletonList rows={3} />
        ) : records.length === 0 ? (
          <EmptyState title="아직 제출된 조사가 없습니다" description="조사를 저장하면 여기에 바로 표시됩니다." />
        ) : (
          <ul className="divide-y divide-border">
            {records.slice(0, RECENT).map(record => {
              const summary = summarizeRecord(record);
              return (
                <li key={record.id}>
                  <Link to={`/admin/records/${record.id}`} className="flex min-h-row items-center gap-3 py-2 hover:bg-muted-bg md:px-2">
                    <span className="w-20 shrink-0 text-sm text-fg-muted">{formatDateTime(record.createdAt)}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{`입력 ${summary.entered}개`}</span>
                    {summary.zeros > 0 && <Badge tone="danger">0개</Badge>}
                    <ChevronRight className="size-4 shrink-0 text-fg-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </PageShell>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: number | string | undefined; sub?: string; tone?: string }) {
  return (
    <Card role="group" aria-label={label} className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-fg-muted">{label}</span>
      {value === undefined ? <Skeleton className="h-8 w-16" /> : <span className={`text-display font-bold ${tone ?? ''}`}>{value}</span>}
      {sub && <span className="text-xs text-fg-muted">{sub}</span>}
    </Card>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const id = `dashboard-${title.replace(/\s/g, '-')}`;
  return (
    <Card role="region" aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <CardTitle id={id}>{title}</CardTitle>
        {action}
      </div>
      {children}
    </Card>
  );
}
