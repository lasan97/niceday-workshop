'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const items = [
  { href: '/', label: '대시보드' },
  { href: '/schedule', label: '일정' },
  { href: '/missions', label: '미션' },
  { href: '/sessions', label: '세션' },
  { href: '/users', label: '사용자' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onLogout() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
      router.refresh();
      setSubmitting(false);
    }
  }

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
        <button
          type="button"
          onClick={onLogout}
          disabled={submitting}
          className="px-2 py-1 text-[10px] font-medium text-slate-500 disabled:opacity-50"
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
}
