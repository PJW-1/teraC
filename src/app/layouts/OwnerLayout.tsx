import { useState } from 'react';
import { Boxes, ClipboardList, Ellipsis, History, LayoutDashboard, Package, type LucideIcon } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { BottomSheet, cn } from '../../components/ui';
import { STORE_NAME } from '../../lib/store';

type NavItem = { to: string; label: string; short: string; icon: LucideIcon; end?: boolean };

const primary: NavItem[] = [
  { to: '/admin', label: '대시보드', short: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/admin/stock', label: '재고 현황', short: '현황', icon: Boxes },
  { to: '/admin/records', label: '조사 기록', short: '기록', icon: History },
];
const secondary: NavItem[] = [
  { to: '/admin/items', label: '품목 관리', short: '품목', icon: Package },
  { to: '/count', label: '재고 조사', short: '조사', icon: ClipboardList },
];

/** 관리 화면: 데스크톱은 사이드바, 모바일은 하단 탭(대시보드, 현황, 기록, 더보기) */
export function OwnerLayout() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = secondary.some(item => pathname.startsWith(item.to));

  return (
    <div className="min-h-dvh bg-bg md:flex">
      {/* 데스크톱 사이드바 */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="py-4 pr-2 pl-5">
          <p className="text-xs font-semibold text-fg-muted">관리</p>
          <Link to="/count" className="block truncate text-lg font-bold">
            {STORE_NAME}
          </Link>
        </div>
        <nav aria-label="관리 메뉴" className="flex-1 px-3">
          <ul className="flex flex-col gap-1">
            {[...primary, ...secondary].map(item => (
              <li key={item.to}>
                <SidebarLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 모바일 머리글 */}
      <header className="sticky top-0 z-30 bg-primary text-primary-fg md:hidden">
        <div className="flex h-14 items-center px-4">
          <Link to="/count" className="flex min-h-touch min-w-0 items-center">
            <span className="truncate text-lg font-bold">{STORE_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="min-w-0 flex-1 pb-[calc(var(--spacing-row)+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </main>

      {/* 모바일 하단 탭 */}
      <nav aria-label="관리 메뉴" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="flex">
          {primary.map(item => (
            <li key={item.to} className="flex-1">
              <TabLink item={item} />
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(tabClass, moreActive ? 'text-accent' : 'text-fg-muted')}
            >
              <Ellipsis className="size-6" aria-hidden />
              더보기
            </button>
          </li>
        </ul>
      </nav>

      <BottomSheet open={moreOpen} onOpenChange={setMoreOpen} title="더보기">
        <ul className="flex flex-col">
          {secondary.map(item => (
            <li key={item.to}>
              <SidebarLink item={item} onClick={() => setMoreOpen(false)} />
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}

const tabClass =
  'flex min-h-row w-full flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors duration-(--duration-press)';

function TabLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => cn(tabClass, isActive ? 'text-accent' : 'text-fg-muted')}>
      <Icon className="size-6" aria-hidden />
      {item.short}
    </NavLink>
  );
}

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex min-h-touch items-center gap-3 rounded-control px-3 text-base font-semibold transition-colors duration-(--duration-press)',
          isActive ? 'bg-accent/10 text-accent' : 'text-fg hover:bg-muted-bg',
        )
      }
    >
      <Icon className="size-5" aria-hidden />
      {item.label}
    </NavLink>
  );
}
