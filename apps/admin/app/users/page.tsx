'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UserResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { Toast } from '../components/Toast';

const fallbackUsers: UserResponse[] = [
  { id: 'usr-local-1', name: '홍길동', team: '알파팀', department: '제품팀', role: 'PARTICIPANT' },
  { id: 'usr-local-2', name: '김수진', team: '베타팀', department: '마케팅팀', role: 'PARTICIPANT' },
];

type UserFieldKey = 'name' | 'team' | 'department' | 'role';
type UserFieldErrors = Partial<Record<UserFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>(fallbackUsers);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [search, setSearch] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, UserFieldErrors>>({});

  async function loadUsers() {
    try {
      const data = await workshopApi.getUsers();
      setUsers(data);
    } catch {
      setToast({ type: 'error', message: '사용자 조회에 실패했습니다. 로컬 데이터를 표시합니다.' });
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function clearFieldError(id: string, key: UserFieldKey) {
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

  function setClientValidationErrors(user: UserResponse): boolean {
    const errors: UserFieldErrors = {};
    if (!user.name.trim()) {
      errors.name = '이름을 입력해주세요.';
    }
    if (!user.team.trim()) {
      errors.team = '팀을 입력해주세요.';
    }
    if (!user.department.trim()) {
      errors.department = '부서를 입력해주세요.';
    }
    if (!user.role.trim()) {
      errors.role = '역할을 선택해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, [user.id]: errors }));
      setToast({ type: 'error', message: '입력값을 확인해주세요.' });
      return true;
    }

    setFieldErrors((prev) => ({ ...prev, [user.id]: {} }));
    return false;
  }

  async function handleCreateUser() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.createUser({
        name: '신규 사용자',
        team: '미배정',
        department: '부서 입력',
        role: 'PARTICIPANT',
      });
      await loadUsers();
      setToast({ type: 'success', message: '사용자를 추가했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '사용자 추가에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveUser(user: UserResponse) {
    if (submitting) {
      return;
    }
    if (setClientValidationErrors(user)) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.updateUser(user.id, {
        name: user.name,
        team: user.team,
        department: user.department,
        role: user.role,
      });
      setToast({ type: 'success', message: '사용자 정보를 저장했습니다.' });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors((prev) => ({ ...prev, [user.id]: error.fieldErrors as UserFieldErrors }));
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '사용자 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteUser(id);
      await loadUsers();
      setToast({ type: 'success', message: '사용자를 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '사용자 삭제에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }
    const keyword = search.trim();
    return users.filter((user) => `${user.name}${user.team}`.includes(keyword));
  }, [search, users]);

  return (
    <AdminScreen
      title="사용자 관리"
      subtitle={`총 ${users.length}명 참가자`}
      action={
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          disabled={submitting}
          onClick={() => {
            void handleCreateUser();
          }}
        >
          + 사용자
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="이름 또는 팀으로 검색..."
            value={search}
            disabled={submitting}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const rowErrors = fieldErrors[user.id] ?? {};

            return (
              <article key={user.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-4">
                  <input
                    className={`w-full rounded border px-2 py-1 text-sm font-bold ${
                      rowErrors.name ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 text-slate-900'
                    }`}
                    value={user.name}
                    disabled={submitting}
                    onChange={(event) => {
                      clearFieldError(user.id, 'name');
                      setUsers((prev) =>
                        prev.map((item) => (item.id === user.id ? { ...item, name: event.target.value } : item)),
                      );
                    }}
                  />
                  {rowErrors.name ? <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.name}</p> : null}
                  <input
                    className={`mt-1 w-full rounded border px-2 py-1 text-xs ${
                      rowErrors.team ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 text-slate-500'
                    }`}
                    value={user.team}
                    disabled={submitting}
                    onChange={(event) => {
                      clearFieldError(user.id, 'team');
                      setUsers((prev) =>
                        prev.map((item) => (item.id === user.id ? { ...item, team: event.target.value } : item)),
                      );
                    }}
                  />
                  {rowErrors.team ? <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.team}</p> : null}
                  <input
                    className={`mt-1 w-full rounded border px-2 py-1 text-xs ${
                      rowErrors.department ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 text-slate-500'
                    }`}
                    value={user.department}
                    disabled={submitting}
                    onChange={(event) => {
                      clearFieldError(user.id, 'department');
                      setUsers((prev) =>
                        prev.map((item) =>
                          item.id === user.id ? { ...item, department: event.target.value } : item,
                        ),
                      );
                    }}
                  />
                  {rowErrors.department ? (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.department}</p>
                  ) : null}
                  <select
                    className={`mt-1 w-full rounded border px-2 py-1 text-xs ${
                      rowErrors.role ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 text-slate-500'
                    }`}
                    value={user.role}
                    disabled={submitting}
                    onChange={(event) => {
                      clearFieldError(user.id, 'role');
                      setUsers((prev) =>
                        prev.map((item) => (item.id === user.id ? { ...item, role: event.target.value } : item)),
                      );
                    }}
                  >
                    <option value="PARTICIPANT">참가자</option>
                    <option value="ADMIN">관리자</option>
                  </select>
                  {rowErrors.role ? <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.role}</p> : null}
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                    disabled={submitting}
                    onClick={() => {
                      void handleSaveUser(user);
                    }}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600"
                    disabled={submitting}
                    onClick={() => {
                      void handleDeleteUser(user.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AdminScreen>
  );
}
