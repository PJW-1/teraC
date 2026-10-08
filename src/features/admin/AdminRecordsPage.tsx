import { RecordList } from '../records/RecordList';
import { PageHeader, PageShell } from './parts';

export function AdminRecordsPage() {
  return (
    <PageShell>
      <PageHeader title="조사 기록" />
      <RecordList basePath="/admin/records" />
    </PageShell>
  );
}
