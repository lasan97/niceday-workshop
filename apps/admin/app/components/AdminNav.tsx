'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Dashboard' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/missions', label: 'Missions' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/users', label: 'Users' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 w-full max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? 'rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary'
                  : 'px-2 py-1 text-[10px] font-medium text-slate-500'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
