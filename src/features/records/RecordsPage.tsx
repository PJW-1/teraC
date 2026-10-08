import { RecordList } from './RecordList';

/** /records: 저장된 조사를 최신순으로 */
export function RecordsPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <h1 className="text-title font-bold">조사 기록</h1>
      <RecordList basePath="/records" />
    </section>
  );
}
