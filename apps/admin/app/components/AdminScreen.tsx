'use client';

import type { ReactNode } from 'react';
import { AdminNav } from './AdminNav';

type AdminScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AdminScreen({ title, subtitle, children }: AdminScreenProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl bg-slate-50 px-6 py-8">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-4">
        <AdminNav />
      </div>
      {children}
    </main>
  );
}
