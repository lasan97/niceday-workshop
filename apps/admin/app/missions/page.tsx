'use client';

import { useEffect, useState } from 'react';
import type { MissionResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { Toast } from '../components/Toast';

const fallbackMissions: MissionResponse[] = [
  { id: 'mis-local-1', title: '숨은 보물 찾기', points: 50, active: true, pendingApprovals: 1 },
  { id: 'mis-local-2', title: '팀 피라미드 사진', points: 30, active: true, pendingApprovals: 2 },
  { id: 'mis-local-3', title: '커피 브레이크 퀴즈', points: 10, active: false, pendingApprovals: 0 },
];

type MissionFieldKey = 'title' | 'points';
type MissionFieldErrors = Partial<Record<MissionFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<MissionResponse[]>(fallbackMissions);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, MissionFieldErrors>>({});

  async function loadMissions() {
    try {
      const data = await workshopApi.getMissions();
      setMissions(data);
    } catch {
      setToast({ type: 'error', message: '미션 조회에 실패했습니다.' });
    }
  }

  useEffect(() => {
    void loadMissions();
  }, []);

  function clearFieldError(id: string, key: MissionFieldKey) {
    setFieldErrors((prev) => {
      const row = prev[id];
      if (!row?.[key]) {
        return prev;
      }
      const nextRow = { ...row };
      delete nextRow[key];
      return { ...prev, [id]: nextRow };
    });
  }

  function setClientValidationErrors(mission: MissionResponse): boolean {
    const errors: MissionFieldErrors = {};
    if (!mission.title.trim()) {
      errors.title = '미션 제목을 입력해주세요.';
    }
    if (mission.points < 0) {
      errors.points = '점수는 0 이상이어야 합니다.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, [mission.id]: errors }));
      setToast({ type: 'error', message: '입력값을 확인해주세요.' });
      return true;
    }

    setFieldErrors((prev) => ({ ...prev, [mission.id]: {} }));
    return false;
  }

  async function handleCreateMission() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.createMission({
        title: '새 미션',
        points: 10,
        active: true,
        pendingApprovals: 0,
      });
      await loadMissions();
      setToast({ type: 'success', message: '미션을 추가했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '미션 추가에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveMission(mission: MissionResponse) {
    if (submitting) {
      return;
    }
    if (setClientValidationErrors(mission)) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.updateMission(mission.id, {
        title: mission.title,
        points: mission.points,
        active: mission.active,
        pendingApprovals: mission.pendingApprovals,
      });
      await loadMissions();
      setToast({ type: 'success', message: '미션 상태를 저장했습니다.' });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors((prev) => ({ ...prev, [mission.id]: error.fieldErrors as MissionFieldErrors }));
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '미션 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMission(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteMission(id);
      await loadMissions();
      setToast({ type: 'success', message: '미션을 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '미션 삭제에 실패했습니다.',
      });
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
          disabled={submitting}
        >
          + 추가
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <section className="space-y-3">
        {missions.map((mission) => {
          const rowErrors = fieldErrors[mission.id] ?? {};

          return (
            <article
              key={mission.id}
              className={
                mission.active
                  ? 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
                  : 'rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-70'
              }
            >
              <div className="space-y-2">
                <input
                  className={`w-full rounded border px-2 py-1 text-sm font-bold ${
                    rowErrors.title ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 text-slate-900'
                  }`}
                  value={mission.title}
                  disabled={submitting}
                  onChange={(event) => {
                    clearFieldError(mission.id, 'title');
                    setMissions((prev) =>
                      prev.map((item) => (item.id === mission.id ? { ...item, title: event.target.value } : item)),
                    );
                  }}
                />
                {rowErrors.title ? <p className="text-[10px] font-semibold text-red-600">{rowErrors.title}</p> : null}
                <input
                  className={`w-full rounded border px-2 py-1 text-xs ${
                    rowErrors.points ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 text-slate-500'
                  }`}
                  value={mission.points}
                  disabled={submitting}
                  type="number"
                  min={0}
                  onChange={(event) => {
                    clearFieldError(mission.id, 'points');
                    setMissions((prev) =>
                      prev.map((item) =>
                        item.id === mission.id ? { ...item, points: Number(event.target.value) || 0 } : item,
                      ),
                    );
                  }}
                />
                {rowErrors.points ? (
                  <p className="text-[10px] font-semibold text-red-600">{rowErrors.points}</p>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  활성
                  <input
                    checked={mission.active}
                    type="checkbox"
                    disabled={submitting}
                    onChange={(event) => {
                      setMissions((prev) =>
                        prev.map((item) =>
                          item.id === mission.id ? { ...item, active: event.target.checked } : item,
                        ),
                      );
                    }}
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold disabled:opacity-50"
                    onClick={() => {
                      void handleSaveMission(mission);
                    }}
                    disabled={submitting}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 disabled:opacity-50"
                    onClick={() => {
                      void handleDeleteMission(mission.id);
                    }}
                    disabled={submitting}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">사진 제출</h3>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">대기 {pending}건</span>
        </div>
      </section>
    </AdminScreen>
  );
}
