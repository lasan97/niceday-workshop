'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '개요' },
  { href: '/schedule', label: '일정' },
  { href: '/missions', label: '미션' },
  { href: '/sessions', label: '세션' },
  { href: '/users', label: '사용자' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? 'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white'
                : 'rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
