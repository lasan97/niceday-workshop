'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TeamResponse, UserResponse } from '@workshop/types';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { PageSpinner } from '../components/PageSpinner';
import { Toast } from '../components/Toast';

type UserRow = UserResponse;
type UserForm = {
  id: string | null;
  username: string;
  name: string;
  team: string;
  workshopTeamId: string | null;
  role: string;
};

type UserFieldKey = 'username' | 'name' | 'team' | 'workshopTeamId' | 'role';
type UserFieldErrors = Partial<Record<UserFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;

const emptyForm: UserForm = {
  id: null,
  username: '',
  name: '',
  team: '',
  workshopTeamId: null,
  role: 'PARTICIPANT',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [search, setSearch] = useState('');

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>(emptyForm);
  const [userFieldErrors, setUserFieldErrors] = useState<UserFieldErrors>({});

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamDrafts, setTeamDrafts] = useState<TeamResponse[]>([]);
  const [newTeamName, setNewTeamName] = useState('');

  async function loadUsers() {
    try {
      const data = await workshopApi.getUsers();
      setUsers(data);
    } catch {
      setToast({ type: 'error', message: '사용자 조회에 실패했습니다.' });
    }
  }

  async function loadTeams(): Promise<TeamResponse[]> {
    try {
      const data = await workshopApi.getTeams();
      setTeams(data);
      return data;
    } catch {
      setToast({ type: 'error', message: '워크샵 팀 조회에 실패했습니다.' });
      return [];
    }
  }

  useEffect(() => {
    void Promise.all([loadUsers(), loadTeams()]).finally(() => setLoading(false));
  }, []);

  function openCreateUserModal() {
    setUserFieldErrors({});
    setUserForm(emptyForm);
    setUserModalOpen(true);
  }

  function openEditUserModal(user: UserRow) {
    setUserFieldErrors({});
    setUserForm({
      id: user.id,
      username: user.username,
      name: user.name,
      team: user.team,
      workshopTeamId: user.workshopTeamId ?? null,
      role: user.role,
    });
    setUserModalOpen(true);
  }

  function openTeamModal() {
    setTeamDrafts(teams);
    setNewTeamName('');
    setTeamModalOpen(true);
  }

  function validateUserForm(): boolean {
    const errors: UserFieldErrors = {};

    if (!userForm.username.trim()) {
      errors.username = '아이디를 입력해주세요.';
    }
    if (!userForm.name.trim()) {
      errors.name = '이름을 입력해주세요.';
    }
    if (!userForm.team.trim()) {
      errors.team = '팀을 입력해주세요.';
    }
    if (!userForm.role.trim()) {
      errors.role = '권한을 선택해주세요.';
    }

    setUserFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveUser() {
    if (submitting || !validateUserForm()) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      const payload = {
        username: userForm.username,
        name: userForm.name,
        team: userForm.team,
        workshopTeamId: userForm.workshopTeamId,
        role: userForm.role,
      };

      if (userForm.id) {
        await workshopApi.updateUser(userForm.id, payload);
        setToast({ type: 'success', message: '사용자 정보를 저장했습니다.' });
      } else {
        await workshopApi.createUser(payload);
        setToast({ type: 'success', message: '사용자를 추가했습니다. 초기 비밀번호는 1111 입니다.' });
      }

      setUserModalOpen(false);
      await loadUsers();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setUserFieldErrors(error.fieldErrors as UserFieldErrors);
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '사용자 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteUser(userId);
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
      const nextTeams = await loadTeams();
      await loadUsers();
      if (teamModalOpen) {
        setTeamDrafts(nextTeams);
      }
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
      const nextTeams = await loadTeams();
      await loadUsers();
      if (teamModalOpen) {
        setTeamDrafts(nextTeams);
      }
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
      const nextTeams = await loadTeams();
      await loadUsers();
      if (teamModalOpen) {
        setTeamDrafts(nextTeams);
      }
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

  function roleBadgeClass(role: string): string {
    return role === 'ADMIN'
      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  return (
    <AdminScreen
      title="사용자 관리"
      subtitle={`총 ${users.length}명 사용자`}
      action={
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          disabled={submitting}
          onClick={openCreateUserModal}
        >
          + 사용자
        </button>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      {loading ? <PageSpinner label="사용자 데이터를 불러오는 중..." /> : null}

      {!loading ? (
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">워크샵 팀 관리</h2>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                disabled={submitting}
                onClick={openTeamModal}
              >
                편집
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {teams.length === 0 ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">등록된 팀 없음</span>
              ) : (
                teams.map((team) => (
                  <span
                    key={team.id}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
                  >
                    {team.name}
                  </span>
                ))
              )}
            </div>
          </section>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="아이디/이름/팀 검색"
              value={search}
              disabled={submitting}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <article key={user.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">@{user.username}</p>
                  <p className="mt-2 text-xs text-slate-500">팀: {user.team}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
                      워크샵팀 {user.workshopTeamName ?? '미배정'}
                    </span>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${roleBadgeClass(user.role)}`}>
                      권한 {user.role === 'ADMIN' ? '관리자' : '참가자'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                    disabled={submitting}
                    onClick={() => openEditUserModal(user)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-amber-200 bg-amber-50 py-1 text-[10px] font-semibold text-amber-700 disabled:opacity-50"
                    disabled={submitting}
                    onClick={() => {
                      void handleResetPassword(user.id);
                    }}
                  >
                    비번초기화
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
            ))}
          </div>
        </div>
      ) : null}

      {userModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{userForm.id ? '사용자 수정' : '사용자 추가'}</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setUserModalOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-[10px] font-semibold text-slate-500">아이디</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  userFieldErrors.username ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={userForm.username}
                disabled={submitting}
                onChange={(event) => {
                  setUserFieldErrors((prev) => ({ ...prev, username: undefined }));
                  setUserForm((prev) => ({ ...prev, username: event.target.value }));
                }}
              />
              {userFieldErrors.username ? (
                <p className="text-[10px] font-semibold text-red-600">{userFieldErrors.username}</p>
              ) : null}

              <label className="text-[10px] font-semibold text-slate-500">이름</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  userFieldErrors.name ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={userForm.name}
                disabled={submitting}
                onChange={(event) => {
                  setUserFieldErrors((prev) => ({ ...prev, name: undefined }));
                  setUserForm((prev) => ({ ...prev, name: event.target.value }));
                }}
              />
              {userFieldErrors.name ? <p className="text-[10px] font-semibold text-red-600">{userFieldErrors.name}</p> : null}

              <label className="text-[10px] font-semibold text-slate-500">팀</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  userFieldErrors.team ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={userForm.team}
                disabled={submitting}
                onChange={(event) => {
                  setUserFieldErrors((prev) => ({ ...prev, team: undefined }));
                  setUserForm((prev) => ({ ...prev, team: event.target.value }));
                }}
              />
              {userFieldErrors.team ? <p className="text-[10px] font-semibold text-red-600">{userFieldErrors.team}</p> : null}

              <label className="text-[10px] font-semibold text-slate-500">워크샵 팀</label>
              <select
                className="w-full rounded border border-slate-300 px-2 py-2 text-xs"
                value={userForm.workshopTeamId ?? ''}
                disabled={submitting}
                onChange={(event) => {
                  setUserForm((prev) => ({ ...prev, workshopTeamId: event.target.value || null }));
                }}
              >
                <option value="">미배정</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <label className="text-[10px] font-semibold text-slate-500">권한</label>
              <select
                className={`w-full rounded border px-2 py-2 text-xs ${
                  userFieldErrors.role ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={userForm.role}
                disabled={submitting}
                onChange={(event) => {
                  setUserFieldErrors((prev) => ({ ...prev, role: undefined }));
                  setUserForm((prev) => ({ ...prev, role: event.target.value }));
                }}
              >
                <option value="PARTICIPANT">참가자</option>
                <option value="ADMIN">관리자</option>
              </select>
              {userFieldErrors.role ? <p className="text-[10px] font-semibold text-red-600">{userFieldErrors.role}</p> : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 py-2 text-xs font-semibold text-slate-700"
                onClick={() => setUserModalOpen(false)}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-md bg-primary py-2 text-xs font-semibold text-white disabled:opacity-50"
                onClick={() => {
                  void handleSaveUser();
                }}
                disabled={submitting}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {teamModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">워크샵 팀 편집</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setTeamModalOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="mt-3 flex gap-2">
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
              {teamDrafts.map((team) => (
                <div key={team.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                    value={team.name}
                    disabled={submitting}
                    onChange={(event) => {
                      setTeamDrafts((prev) =>
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
          </div>
        </div>
      ) : null}
    </AdminScreen>
  );
}
