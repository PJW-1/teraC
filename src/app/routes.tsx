import { Navigate, type RouteObject } from 'react-router';
import { AdminRecordDetailPage } from '../features/admin/AdminRecordDetailPage';
import { AdminRecordsPage } from '../features/admin/AdminRecordsPage';
import { DashboardPage } from '../features/admin/DashboardPage';
import { ItemsPage } from '../features/admin/ItemsPage';
import { StockPage } from '../features/admin/StockPage';
import { CountPage } from '../features/count/CountPage';
import { RecordDetailPage } from '../features/records/RecordDetailPage';
import { RecordsPage } from '../features/records/RecordsPage';
import { NotFoundPage } from '../features/system/NotFoundPage';
import { RouteErrorPage } from '../features/system/RouteErrorPage';
import { OwnerLayout } from './layouts/OwnerLayout';
import { StaffLayout } from './layouts/StaffLayout';

// 로그인, 매장 선택, 역할(관리자 전용) 구분은 없다. 누구나 조사·기록·관리 화면을 쓴다.
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
        ],
      },
      {
        path: 'admin',
        element: <OwnerLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'stock', element: <StockPage /> },
          { path: 'records', element: <AdminRecordsPage /> },
          { path: 'records/:recordId', element: <AdminRecordDetailPage /> },
          { path: 'items', element: <ItemsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
