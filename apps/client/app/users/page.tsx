'use client';

import { useEffect, useState } from 'react';
import type { UserResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { PageSpinner } from '../components/PageSpinner';
import { ClientScreen } from '../components/ClientScreen';

type TeamGroup = {
  label: string;
  users: UserResponse[];
};

function normalizeLabel(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function buildTeamGroups(users: UserResponse[], groupBy: 'team' | 'workshopTeam'): TeamGroup[] {
  const grouped = new Map<string, UserResponse[]>();

  users.forEach((user) => {
    const groupLabel = groupBy === 'team'
      ? normalizeLabel(user.team, '미배정')
      : normalizeLabel(user.workshopTeamName, '미지정');
    const current = grouped.get(groupLabel) ?? [];
    current.push(user);
    grouped.set(groupLabel, current);
  });

  return Array.from(grouped.entries())
    .map(([label, members]) => ({
      label,
      users: [...members].sort((left, right) => left.name.localeCompare(right.name, 'ko')),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'ko'));
}

export default function ClientUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState<UserResponse | null>(null);
  const [groupBy, setGroupBy] = useState<'team' | 'workshopTeam'>('workshopTeam');

  useEffect(() => {
    async function load() {
      try {
        const data = await workshopApi.getUsers();
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const teamGroups = buildTeamGroups(users, groupBy);

  return (
    <ClientScreen title="참가자" subtitle={`총 ${users.length}명`}>
      {loading ? <PageSpinner label="참가자 정보를 불러오는 중..." /> : null}
      {!loading ? (
        <div className="space-y-4 pb-4">
          <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">People</p>
                <h2 className="mt-2 text-lg font-extrabold text-slate-900">함께하는 참가자들</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  카드를 눌러 상세 정보를 보고, 묶음 기준도 바꿀 수 있습니다.
                </p>
              </div>
              <div className="inline-flex shrink-0 rounded-full border border-sky-200 bg-white p-1">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    groupBy === 'team' ? 'bg-slate-900 text-white' : 'text-slate-500'
                  }`}
                  onClick={() => setGroupBy('team')}
                >
                  팀
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    groupBy === 'workshopTeam' ? 'bg-slate-900 text-white' : 'text-slate-500'
                  }`}
                  onClick={() => setGroupBy('workshopTeam')}
                >
                  워크샵팀
                </button>
              </div>
            </div>
          </section>

          {teamGroups.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
              <p className="text-sm font-semibold text-slate-500">표시할 참가자 정보가 없습니다.</p>
            </section>
          ) : null}

          {teamGroups.map((group) => (
            <section key={group.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{group.label}</h3>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {group.users.length}명
                </span>
              </div>
              <div className="space-y-2">
                {group.users.map((user) => (
                  <article
                    key={user.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)] outline-none transition hover:border-sky-300 focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => setDetailUser(user)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setDetailUser(user);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
                            팀 {normalizeLabel(user.team, '미배정')}
                          </span>
                          <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                            워크샵팀 {normalizeLabel(user.workshopTeamName, '미지정')}
                          </span>
                        </div>
                        <h4 className="mt-3 text-base font-bold text-slate-900">{user.name}</h4>
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500">카드를 누르면 상세 정보를 볼 수 있습니다.</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {detailUser ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">{normalizeLabel(detailUser.team, '미배정')}</p>
                <h3 className="text-base font-bold text-slate-900">{detailUser.name}</h3>
              </div>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setDetailUser(null)}
              >
                닫기
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
                    팀 {normalizeLabel(detailUser.team, '미배정')}
                  </span>
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
                    워크샵팀 {normalizeLabel(detailUser.workshopTeamName, '미지정')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ClientScreen>
  );
}
