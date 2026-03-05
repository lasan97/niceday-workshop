'use client';

type PageSpinnerProps = {
  label?: string;
};

export function PageSpinner({ label = '불러오는 중...' }: PageSpinnerProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}
