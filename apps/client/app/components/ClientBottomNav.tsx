import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '홈' },
  { href: '/schedule', label: '일정' },
  { href: '/missions', label: '미션' },
  { href: '/sessions', label: '세션' },
];

export function ClientBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'text-sm font-bold text-primary' : 'text-sm font-medium text-slate-500'}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
