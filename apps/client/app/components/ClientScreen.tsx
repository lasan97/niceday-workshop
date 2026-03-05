'use client';

import type { ReactNode } from 'react';
import { ClientBottomNav } from './ClientBottomNav';

type ClientScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ClientScreen({ title, subtitle, children }: ClientScreenProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-24 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </header>
      {children}
      <ClientBottomNav />
    </main>
  );
}
