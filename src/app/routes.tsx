import { Navigate, type RouteObject } from 'react-router';
import { ItemsPage } from '../features/admin/ItemsPage';
import { CountPage } from '../features/count/CountPage';
import { RecordDetailPage } from '../features/records/RecordDetailPage';
import { RecordsPage } from '../features/records/RecordsPage';
import { NotFoundPage } from '../features/system/NotFoundPage';
import { RouteErrorPage } from '../features/system/RouteErrorPage';
import { StaffLayout } from './layouts/StaffLayout';

// 로그인, 매장 선택, 역할(관리자 전용) 구분은 없다. 누구나 조사·기록·관리 화면을 쓴다.
// 관리는 지금 품목 관리만 쓴다. 예전 관리 화면(대시보드, 재고 현황, 조사 기록) 주소는 품목 관리로 보낸다.
export const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/count" replace /> },
      {
        element: <StaffLayout />,
        children: [
          { path: 'count', element: <CountPage /> },
          { path: 'records', element: <RecordsPage /> },
          { path: 'records/:recordId', element: <RecordDetailPage /> },
          { path: 'admin', element: <ItemsPage /> },
          { path: 'admin/*', element: <Navigate to="/admin" replace /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
