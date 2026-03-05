'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TeamResponse, UserResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { Toast } from '../components/Toast';

type UserRow = UserResponse & { isNew?: boolean };

type UserFieldKey = 'username' | 'name' | 'team' | 'department' | 'role' | 'workshopTeamId';
type UserFieldErrors = Partial<Record<UserFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;

const fallbackUsers: UserRow[] = [
  {
    id: 'usr-local-1',
    username: 'user01',
    name: '홍길동',
    team: '알파팀',
    workshopTeamId: 'team-alpha',
    workshopTeamName: '알파팀',
    department: '제품팀',
    role: 'PARTICIPANT',
  },
];

const fallbackTeams: TeamResponse[] = [
  { id: 'team-alpha', name: '알파팀' },
  { id: 'team-beta', name: '베타팀' },
];

function createDraftUser(): UserRow {
  return {
    id: `tmp-${Date.now()}`,
    username: '',
    name: '',
    team: '',
    workshopTeamId: null,
    workshopTeamName: null,
    department: '',
    role: 'PARTICIPANT',
    isNew: true,
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(fallbackUsers);
  const [teams, setTeams] = useState<TeamResponse[]>(fallbackTeams);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [search, setSearch] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, UserFieldErrors>>({});

  async function loadUsers() {
    try {
      const data = await workshopApi.getUsers();
      setUsers(data);
    } catch {
      setToast({ type: 'error', message: '사용자 조회에 실패했습니다. 로컬 데이터를 표시합니다.' });
    }
  }

  async function loadTeams() {
    try {
      const data = await workshopApi.getTeams();
      setTeams(data);
    } catch {
      setToast({ type: 'error', message: '워크샵 팀 조회에 실패했습니다.' });
    }
  }

  useEffect(() => {
    void Promise.all([loadUsers(), loadTeams()]);
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

  function setClientValidationErrors(user: UserRow): boolean {
    const errors: UserFieldErrors = {};
    if (!user.username.trim()) {
      errors.username = '아이디를 입력해주세요.';
    }
    if (!user.name.trim()) {
      errors.name = '이름을 입력해주세요.';
    }
    if (!user.team.trim()) {
      errors.team = '표기용 팀을 입력해주세요.';
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

  async function handleAddDraftUser() {
    setUsers((prev) => [createDraftUser(), ...prev]);
    setToast(null);
  }

  async function handleSaveUser(user: UserRow) {
    if (submitting) {
      return;
    }
    if (setClientValidationErrors(user)) {
      return;
    }

    const payload = {
      username: user.username,
      name: user.name,
      team: user.team,
      workshopTeamId: user.workshopTeamId,
      department: user.department,
      role: user.role,
    };

    setSubmitting(true);
    setToast(null);
    try {
      if (user.isNew) {
        await workshopApi.createUser(payload);
        setToast({ type: 'success', message: '사용자를 추가했습니다. 초기 비밀번호는 1111 입니다.' });
      } else {
        await workshopApi.updateUser(user.id, payload);
        setToast({ type: 'success', message: '사용자 정보를 저장했습니다.' });
      }
      await loadUsers();
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

  async function handleDeleteUser(user: UserRow) {
    if (submitting) {
      return;
    }

    if (user.isNew) {
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteUser(user.id);
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

  async function handleResetPassword(userId: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.resetUserPassword(userId);
      setToast({ type: 'success', message: '비밀번호를 1111로 초기화했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '비밀번호 초기화에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateTeam() {
    if (submitting || !newTeamName.trim()) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.createTeam({ name: newTeamName.trim() });
      setNewTeamName('');
      await loadTeams();
      setToast({ type: 'success', message: '워크샵 팀을 추가했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '워크샵 팀 추가에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveTeam(team: TeamResponse) {
    if (submitting || !team.name.trim()) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.updateTeam(team.id, { name: team.name.trim() });
      await loadTeams();
      await loadUsers();
      setToast({ type: 'success', message: '워크샵 팀을 저장했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '워크샵 팀 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTeam(teamId: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteTeam(teamId);
      await Promise.all([loadTeams(), loadUsers()]);
      setToast({ type: 'success', message: '워크샵 팀을 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '워크샵 팀 삭제에 실패했습니다.',
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
    return users.filter((user) => `${user.username}${user.name}${user.team}${user.workshopTeamName ?? ''}`.includes(keyword));
  }, [search, users]);

  return (
    <AdminScreen
      title="사용자 관리"
      subtitle={`총 ${users.filter((user) => !user.isNew).length}명 참가자`}
      action={
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          disabled={submitting}
          onClick={() => {
            void handleAddDraftUser();
          }}
        >
          + 사용자
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-xs font-bold text-slate-700">워크샵 팀 관리</h2>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-xs"
              placeholder="새 워크샵 팀 이름"
              value={newTeamName}
              disabled={submitting}
              onChange={(event) => setNewTeamName(event.target.value)}
            />
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              disabled={submitting}
              onClick={() => {
                void handleCreateTeam();
              }}
            >
              추가
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-2">
                <input
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                  value={team.name}
                  disabled={submitting}
                  onChange={(event) => {
                    setTeams((prev) =>
                      prev.map((item) => (item.id === team.id ? { ...item, name: event.target.value } : item)),
                    );
                  }}
                />
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-[10px] font-semibold"
                  disabled={submitting}
                  onClick={() => {
                    void handleSaveTeam(team);
                  }}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600"
                  disabled={submitting}
                  onClick={() => {
                    void handleDeleteTeam(team.id);
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="아이디/이름/팀으로 검색..."
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
                  <label className="text-[10px] font-semibold text-slate-500">아이디</label>
                  <input
                    className={`mt-1 w-full rounded border px-2 py-1 text-xs font-semibold ${
                      rowErrors.username ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 text-slate-900'
                    }`}
                    value={user.username}
                    disabled={submitting}
                    onChange={(event) => {
                      clearFieldError(user.id, 'username');
                      setUsers((prev) =>
                        prev.map((item) => (item.id === user.id ? { ...item, username: event.target.value } : item)),
                      );
                    }}
                  />
                  {rowErrors.username ? (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">{rowErrors.username}</p>
                  ) : null}

                  <label className="mt-2 block text-[10px] font-semibold text-slate-500">이름</label>
                  <input
                    className={`mt-1 w-full rounded border px-2 py-1 text-sm font-bold ${
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

                  <label className="mt-2 block text-[10px] font-semibold text-slate-500">표기용 팀</label>
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

                  <label className="mt-2 block text-[10px] font-semibold text-slate-500">워크샵 팀</label>
                  <select
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-500"
                    value={user.workshopTeamId ?? ''}
                    disabled={submitting}
                    onChange={(event) => {
                      setUsers((prev) =>
                        prev.map((item) =>
                          item.id === user.id
                            ? {
                                ...item,
                                workshopTeamId: event.target.value || null,
                                workshopTeamName: teams.find((team) => team.id === event.target.value)?.name ?? null,
                              }
                            : item,
                        ),
                      );
                    }}
                  >
                    <option value="">미배정</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>

                  <label className="mt-2 block text-[10px] font-semibold text-slate-500">부서</label>
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

                  <label className="mt-2 block text-[10px] font-semibold text-slate-500">역할</label>
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

                <div className="grid grid-cols-3 gap-2 bg-slate-50 px-4 py-3">
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
                      void handleDeleteUser(user);
                    }}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-amber-200 bg-amber-50 py-1 text-[10px] font-semibold text-amber-700 disabled:opacity-50"
                    disabled={submitting || Boolean(user.isNew)}
                    onClick={() => {
                      void handleResetPassword(user.id);
                    }}
                  >
                    비번초기화
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
