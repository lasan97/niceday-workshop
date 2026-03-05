'use client';

import type { ReactNode } from 'react';
import { AdminNav } from './AdminNav';

type AdminScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function AdminScreen({ title, subtitle, children, action }: AdminScreenProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-100 pb-20 shadow-xl">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      </header>
      <section className="px-4 py-4">{children}</section>
      <AdminNav />
    </main>
  );
}
