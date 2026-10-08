import { FullScreen } from '../../components/FullScreen';
import { ErrorState } from '../../components/ui';

/** Router error boundary: an unexpected error while rendering a screen. */
export function RouteErrorPage() {
  return (
    <FullScreen>
      <ErrorState
        title="화면을 표시하지 못했습니다"
        description="일시적인 문제일 수 있습니다. 새로고침한 뒤 다시 시도해 주세요."
        onRetry={() => window.location.reload()}
      />
    </FullScreen>
  );
}
