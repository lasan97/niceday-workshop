'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { OverviewResponse } from '@workshop/types';
import { workshopApi } from '../lib/workshop-api';
import { AdminScreen } from './components/AdminScreen';
import { PageSpinner } from './components/PageSpinner';

export default function AdminHomePage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getOverview();
        setOverview(data);
      } catch {
        setOverview({
          activeMissions: 0,
          upcomingSessions: 0,
          totalUsers: 0,
          totalSchedules: 0,
          pendingSubmissions: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading || !overview) {
    return (
      <AdminScreen title="나이스데이 관리자" subtitle="워크샵 개요 · 강릉 행사 운영">
        <PageSpinner label="대시보드 데이터를 불러오는 중..." />
      </AdminScreen>
    );
  }

  const stats = [
    { title: '활성 미션', value: String(overview.activeMissions), note: '현재 진행 중인 미션 수' },
    { title: '예정 세션', value: String(overview.upcomingSessions), note: '다음 세션 2시간 후 시작' },
    { title: '전체 사용자', value: String(overview.totalUsers), note: '체크인 인원 포함' },
    { title: '일정 블록', value: String(overview.totalSchedules), note: '오늘/내일 일정 포함' },
  ];

  const modules = [
    { href: '/schedule', title: '일정 관리', desc: '일별 이벤트와 시간표를 관리합니다.' },
    { href: '/missions', title: '미션 관리', desc: '팀 미션 승인과 현황을 관리합니다.' },
    { href: '/sessions', title: '세션 관리', desc: '발표 세션과 질문 현황을 관리합니다.' },
    { href: '/users', title: '사용자 관리', desc: '참가자 계정과 팀 배정을 관리합니다.' },
  ];

  return (
    <AdminScreen title="나이스데이 관리자" subtitle="워크샵 개요 · 강릉 행사 운영">
      <section className="mb-5 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <article key={stat.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{stat.title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-[11px] text-emerald-600">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700">관리 모듈</h2>
        {modules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-bold text-slate-900">{module.title}</p>
            <p className="mt-1 text-xs text-slate-500">{module.desc}</p>
          </Link>
        ))}
      </section>
    </AdminScreen>
  );
}
