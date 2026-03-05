import type { ReactNode } from 'react';

type AppCardProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function AppCard({ title, description, action }: AppCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
