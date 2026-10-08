import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { BottomSheet, Button, Card, cn, EmptyState, ErrorState, SkeletonList, toast } from '../../components/ui';
import { groupByCategory } from '../../lib/inventory/catalog';
import { fetchRecord, historyKeys } from '../../lib/inventory/historyApi';
import { useInventory } from '../../lib/inventory/inventoryContext';
import { summarizeRecord } from '../../lib/inventory/records';
import { formatQuantity } from '../../lib/quantity';
import { inventoryReport } from '../../lib/report/inventoryReport';
import { ReportActions } from './ReportActions';
import { formatDateTime } from './recordUtils';

/** /records/:recordId: 저장된 조사 한 건을 읽기 전용으로 */
export function RecordDetailPage() {
  const recordId = useParams().recordId ?? '';
  const navigate = useNavigate();
  const { loadCounts } = useInventory();
  const [showUnchecked, setShowUnchecked] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const query = useQuery({ queryKey: historyKeys.record(recordId), queryFn: () => fetchRecord(recordId) });

  let body;
  if (query.isError) body = <ErrorState onRetry={() => void query.refetch()} />;
  else if (query.isPending) body = <SkeletonList rows={6} />;
  else if (!query.data) body = <EmptyState title="기록을 찾을 수 없습니다" description="삭제되었거나 볼 수 없는 기록입니다." />;
  else {
    const record = query.data;
    const { entered, zeros } = summarizeRecord(record);
    const report = inventoryReport(record.items, record.createdAt);
    const items = showUnchecked ? record.items : record.items.filter(item => item.count !== null);
    body = (
      <div className="flex flex-col gap-4">
        <Card>
          <p className="text-sm text-fg-muted">{`${formatDateTime(record.createdAt)} 완료`}</p>
          <p className="mt-1 text-sm">
            {`입력 ${entered}개`}
            {zeros > 0 && <span className="font-semibold text-danger">{` · 0개 ${zeros}`}</span>}
          </p>
        </Card>
        <label className="flex min-h-touch items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            className="size-5 accent-(--color-accent-fill)"
            checked={showUnchecked}
            onChange={e => setShowUnchecked(e.target.checked)}
          />
          미입력 품목도 보기
        </label>
        {groupByCategory(items).map(group => (
          <section key={group.category} aria-label={group.category}>
            <h2 className="mb-2 text-sm font-bold text-fg-muted">{group.category}</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
              {group.items.map(item => (
                <li key={item.id} className="flex min-h-row items-center justify-between gap-3 px-4 py-2">
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className={cn('truncate font-semibold', item.count === null && 'text-fg-muted')}>{item.name}</span>
                    <span className="shrink-0 text-xs text-fg-muted">({item.unit})</span>
                  </span>
                  {item.count === null ? (
                    <span className="text-sm text-fg-muted">미입력</span>
                  ) : (
                    <span className={cn('text-qty tabular-nums', item.count === 0 && 'text-danger')}>{formatQuantity(item.count)}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section aria-labelledby="record-report-title" className="flex flex-col gap-2">
          <h2 id="record-report-title" className="text-sm font-bold text-fg-muted">
            보고서
          </h2>
          <ReportActions text={report.text} fileName={report.fileName} />
        </section>
        <Button variant="secondary" fullWidth onClick={() => setLoadOpen(true)}>
          이 수량 불러오기
        </Button>
        <BottomSheet
          open={loadOpen}
          onOpenChange={setLoadOpen}
          title="기록 불러오기"
          description="이 기록의 수량으로 지금 입력한 수량을 덮어씁니다. 품목 목록은 그대로입니다."
          footer={
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                fullWidth
                onClick={() => {
                  loadCounts(record);
                  setLoadOpen(false);
                  toast.success('기록의 수량을 불러왔습니다.');
                  void navigate('/count');
                }}
              >
                불러오기
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setLoadOpen(false)}>
                취소
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <Link to="/records" className="-ml-2 inline-flex min-h-touch w-fit items-center gap-1 px-2 text-sm font-semibold text-fg-muted">
        <ChevronLeft className="size-5" aria-hidden />
        기록 목록
      </Link>
      <h1 className="text-title font-bold">조사 기록</h1>
      {body}
    </section>
  );
}
