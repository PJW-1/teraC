import { useNavigate } from 'react-router';
import { FullScreen } from '../../components/FullScreen';
import { Button, EmptyState } from '../../components/ui';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <FullScreen>
      <EmptyState
        title="페이지를 찾을 수 없습니다"
        description="주소가 바뀌었거나 없는 페이지입니다."
        action={<Button onClick={() => navigate('/', { replace: true })}>처음 화면으로</Button>}
      />
    </FullScreen>
  );
}
