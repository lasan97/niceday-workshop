'use client';

import { useEffect, useState } from 'react';
import type { MissionResponse } from '@workshop/types';
import { workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';

const fallbackMissions: MissionResponse[] = [
  { id: 'mis-local-1', title: '숨은 보물 찾기', points: 50, active: true, pendingApprovals: 1 },
  { id: 'mis-local-2', title: '팀 피라미드 사진', points: 30, active: true, pendingApprovals: 2 },
  { id: 'mis-local-3', title: '커피 브레이크 퀴즈', points: 10, active: false, pendingApprovals: 0 },
];

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<MissionResponse[]>(fallbackMissions);
  const [submitting, setSubmitting] = useState(false);

  async function loadMissions() {
    try {
      const data = await workshopApi.getMissions();
      setMissions(data);
    } catch {
      // API 연결 실패 시 fallback 데이터를 유지한다.
    }
  }

  useEffect(() => {
    void loadMissions();
  }, []);

  async function handleCreateMission() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await workshopApi.createMission({
        title: '새 미션',
        points: 10,
        active: true,
        pendingApprovals: 0,
      });
      await loadMissions();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleMission(mission: MissionResponse, active: boolean) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await workshopApi.updateMission(mission.id, {
        title: mission.title,
        points: mission.points,
        active,
        pendingApprovals: mission.pendingApprovals,
      });
      await loadMissions();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMission(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await workshopApi.deleteMission(id);
      await loadMissions();
    } finally {
      setSubmitting(false);
    }
  }

  const pending = missions.reduce((sum, item) => sum + item.pendingApprovals, 0);

  return (
    <AdminScreen
      title="미션 관리"
      subtitle="미션과 사진 제출 관리"
      action={
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          onClick={handleCreateMission}
        >
          + 추가
        </button>
      }
    >
      <section className="space-y-3">
        {missions.map((mission) => (
          <article
            key={mission.id}
            className={
              mission.active
                ? 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
                : 'rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-70'
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{mission.title}</h2>
                <p className="text-xs text-slate-500">{mission.points}점</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                활성
                <input
                  checked={mission.active}
                  type="checkbox"
                  onChange={(event) => {
                    void handleToggleMission(mission, event.target.checked);
                  }}
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 disabled:opacity-50"
                onClick={() => {
                  void handleDeleteMission(mission.id);
                }}
              >
                삭제
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">사진 제출</h3>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
            대기 {pending}건
          </span>
        </div>
      </section>
    </AdminScreen>
  );
}
