import { Copy, Download } from 'lucide-react';
import { Button, toast } from '../../components/ui';
import { copyText, downloadReport } from '../../lib/report/reportText';

/** "텍스트 복사" and "파일 저장" for a report (design 4.2). Both run inside the tap for iOS. */
export function ReportActions({ text, fileName }: { text: string; fileName: string }) {
  const copy = async () => {
    if (await copyText(text)) toast.success('보고서 텍스트를 복사했습니다.');
    else toast.error('복사하지 못했습니다. 파일 저장을 이용해 주세요.');
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" onClick={() => void copy()}>
        <Copy className="size-5" aria-hidden />
        텍스트 복사
      </Button>
      <Button variant="secondary" onClick={() => downloadReport(text, fileName)}>
        <Download className="size-5" aria-hidden />
        파일 저장
      </Button>
    </div>
  );
}
