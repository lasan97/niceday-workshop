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
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-100 pb-20 shadow-xl">
      <section className="px-4 pb-3 pt-5">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </section>
      <section className="px-4">{children}</section>
      <ClientBottomNav />
    </main>
  );
}
