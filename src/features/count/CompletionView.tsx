import { useQuery } from '@tanstack/react-query';
import { CircleCheck } from 'lucide-react';
import { Link } from 'react-router';
import { Button, Card, ErrorState, SkeletonList } from '../../components/ui';
import { fetchRecord, historyKeys } from '../../lib/inventory/historyApi';
import { summarizeRecord } from '../../lib/inventory/records';
import { inventoryReport } from '../../lib/report/inventoryReport';
import { TIME_ZONE } from '../../lib/store';
import { safeTimeZone } from '../../lib/timeZone';
import { ReportActions } from '../records/ReportActions';

const formatSubmittedAt = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: safeTimeZone(TIME_ZONE),
  });

/** 제출한 뒤: 보고서 텍스트와 복사, 파일 저장 */
export function CompletionView({ recordId, onNewCount }: { recordId: string; onNewCount: () => void }) {
  const query = useQuery({ queryKey: historyKeys.record(recordId), queryFn: () => fetchRecord(recordId) });

  let body;
  if (query.isError) {
    body = <ErrorState onRetry={() => void query.refetch()} />;
  } else if (query.isPending) {
    body = <SkeletonList rows={3} />;
  } else if (!query.data) {
    body = <ErrorState title="기록을 찾을 수 없습니다" description="기록 목록에서 다시 확인해 주세요." />;
  } else {
    const record = query.data;
    const summary = summarizeRecord(record);
    const report = inventoryReport(record.items, record.createdAt);
    body = (
      <div className="flex flex-col gap-4">
        <Card>
          <p className="text-sm text-fg-muted">{formatSubmittedAt(record.createdAt)}</p>
          <p className="mt-1 text-lg font-semibold">{`입력 ${summary.entered}개`}</p>
          {summary.zeros > 0 && <p className="text-sm font-semibold text-danger">{`0개 ${summary.zeros}개`}</p>}
        </Card>
        <section aria-labelledby="report-title" className="flex flex-col gap-2">
          <h2 id="report-title" className="font-bold">
            보고서
          </h2>
          <pre
            aria-label="보고서 텍스트"
            className="max-h-72 overflow-auto rounded-card border border-border bg-surface p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap"
          >
            {report.text}
          </pre>
          <ReportActions text={report.text} fileName={report.fileName} />
        </section>
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center gap-2">
        <CircleCheck className="size-7 text-success" aria-hidden />
        <h1 className="text-title font-bold">제출했습니다</h1>
      </div>
      {body}
      <div className="grid grid-cols-2 gap-2">
        <Link
          to={`/records/${recordId}`}
          className="inline-flex min-h-touch items-center justify-center rounded-control border border-border bg-surface px-4 font-semibold"
        >
          기록 보기
        </Link>
        <Button onClick={onNewCount}>새 조사 시작</Button>
      </div>
    </section>
  );
}
