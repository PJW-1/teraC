import { BottomSheet, Button } from '../../components/ui';
import type { CatalogItem } from '../../lib/inventory/catalog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: { entered: number; zeros: number };
  notEnteredItems: CatalogItem[];
  onJump: (itemId: string) => void;
  onSubmit: () => void;
};

/** 제출 전 "조사 완료" 요약. 일부 품목만 입력해도 제출할 수 있다. */
export function SubmitSheet({ open, onOpenChange, summary, notEnteredItems, onJump, onSubmit }: Props) {
  const empty = summary.entered === 0;
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="조사 완료"
      footer={
        <Button size="lg" fullWidth disabled={empty} onClick={onSubmit}>
          제출하기
        </Button>
      }
    >
      <p className="text-lg font-semibold">{`입력 ${summary.entered} · 0개 ${summary.zeros}`}</p>
      {empty ? (
        <p className="mt-3 text-sm text-danger">입력한 수량이 없습니다. 한 품목 이상 입력해 주세요.</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-fg-muted">제출하면 보고서 텍스트를 복사합니다.</p>
          {notEnteredItems.length > 0 && (
            <p className="mt-1 text-sm text-fg-muted">미입력 품목은 이번 기록에서 확인하지 않은 것으로 남고, 이전 값이 그대로 유지됩니다.</p>
          )}
        </>
      )}
      {notEnteredItems.length > 0 && (
        <details className="mt-3">
          <summary className="flex min-h-touch cursor-pointer items-center text-sm font-semibold">미입력 품목 보기</summary>
          <ul className="flex flex-col">
            {notEnteredItems.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex min-h-touch w-full items-center text-left text-base text-fg active:bg-muted-bg"
                  onClick={() => onJump(item.id)}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </BottomSheet>
  );
}
