import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Badge, Button, EmptyState, ErrorState, SkeletonList } from '../../components/ui';
import { fetchRecords, historyKeys } from '../../lib/inventory/historyApi';
import { summarizeRecord } from '../../lib/inventory/records';
import { formatTime, groupByDay } from './recordUtils';

const PAGE_SIZE = 20;
const PREVIEW_COUNT = 3;

function preview(names: string[]) {
  if (names.length === 0) return '입력한 품목 없음';
  const head = names.slice(0, PREVIEW_COUNT).join(', ');
  return names.length > PREVIEW_COUNT ? `${head} 외 ${names.length - PREVIEW_COUNT}개` : head;
}

/** 조사 기록 목록: 최신순, 날짜별로 묶어 한 번에 20건씩. basePath 는 '/records' 또는 '/admin/records'. */
export function RecordList({ basePath }: { basePath: string }) {
  const records = useInfiniteQuery({
    queryKey: [...historyKeys.list(), 'pages'],
    queryFn: ({ pageParam }) => fetchRecords(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length === PAGE_SIZE ? all.length : undefined),
  });

  // 새 기록이 끼면 페이지 경계에서 같은 행이 겹칠 수 있다.
  const groups = useMemo(() => {
    const seen = new Set<string>();
    const rows = (records.data?.pages.flat() ?? []).filter(r => !seen.has(r.id) && seen.add(r.id));
    return groupByDay(rows);
  }, [records.data]);

  if (records.isError && !records.data) return <ErrorState onRetry={() => void records.refetch()} />;
  if (records.isPending) return <SkeletonList rows={6} />;
  if (groups.length === 0)
    return <EmptyState title="아직 저장된 조사가 없습니다" description="조사를 제출하면 여기에 기록이 쌓입니다." />;

  return (
    <div className="flex flex-col gap-5">
      {groups.map(group => (
        <section key={group.key} aria-label={group.label}>
          <h2 className="mb-2 text-sm font-bold text-fg-muted">{group.label}</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {group.records.map(record => {
              const { entered, zeros, enteredNames } = summarizeRecord(record);
              return (
                <li key={record.id}>
                  <Link to={`${basePath}/${record.id}`} className="flex min-h-row items-center gap-3 px-4 py-2 transition-colors duration-(--duration-press) active:bg-muted-bg">
                    <span className="w-16 shrink-0 text-sm tabular-nums text-fg-muted">{formatTime(record.createdAt)}</span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold">{`입력 ${entered}개`}</span>
                      <span className="truncate text-sm text-fg-muted">{preview(enteredNames)}</span>
                    </span>
                    {zeros > 0 && <Badge tone="danger">{`0개 ${zeros}`}</Badge>}
                    <ChevronRight className="size-5 shrink-0 text-fg-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {records.hasNextPage && (
        <Button variant="secondary" fullWidth disabled={records.isFetchingNextPage} onClick={() => void records.fetchNextPage()}>
          {records.isFetchingNextPage ? '불러오는 중' : '더 보기'}
        </Button>
      )}
    </div>
  );
}
