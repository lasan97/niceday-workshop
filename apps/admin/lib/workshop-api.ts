import type {
  paths,
} from '@workshop/types';

const WORKSHOP_PROXY_BASE = '/api/workshop';

type OverviewResponse = paths['/api/v1/workshop/overview']['get']['responses'][200]['content']['application/json'];
type ScheduleListResponse = paths['/api/v1/workshop/schedules']['get']['responses'][200]['content']['application/json'];
type ScheduleCreateRequest = paths['/api/v1/workshop/schedules']['post']['requestBody']['content']['application/json'];
type ScheduleCreateResponse = paths['/api/v1/workshop/schedules']['post']['responses'][201]['content']['application/json'];
type ScheduleUpdateRequest = paths['/api/v1/workshop/schedules/{id}']['patch']['requestBody']['content']['application/json'];
type ScheduleUpdateResponse = paths['/api/v1/workshop/schedules/{id}']['patch']['responses'][200]['content']['application/json'];

type MissionListResponse = paths['/api/v1/workshop/missions']['get']['responses'][200]['content']['application/json'];
type MissionCreateRequest = paths['/api/v1/workshop/missions']['post']['requestBody']['content']['application/json'];
type MissionCreateResponse = paths['/api/v1/workshop/missions']['post']['responses'][201]['content']['application/json'];
type MissionUpdateRequest = paths['/api/v1/workshop/missions/{id}']['patch']['requestBody']['content']['application/json'];
type MissionUpdateResponse = paths['/api/v1/workshop/missions/{id}']['patch']['responses'][200]['content']['application/json'];

type SessionListResponse = paths['/api/v1/workshop/sessions']['get']['responses'][200]['content']['application/json'];
type SessionCreateRequest = paths['/api/v1/workshop/sessions']['post']['requestBody']['content']['application/json'];
type SessionCreateResponse = paths['/api/v1/workshop/sessions']['post']['responses'][201]['content']['application/json'];
type SessionUpdateRequest = paths['/api/v1/workshop/sessions/{id}']['patch']['requestBody']['content']['application/json'];
type SessionUpdateResponse = paths['/api/v1/workshop/sessions/{id}']['patch']['responses'][200]['content']['application/json'];
type SessionReorderRequest = paths['/api/v1/workshop/sessions/reorder']['post']['requestBody']['content']['application/json'];
type SessionQuestionListResponse = paths['/api/v1/workshop/sessions/{id}/questions']['get']['responses'][200]['content']['application/json'];

type UserListResponse = paths['/api/v1/workshop/users']['get']['responses'][200]['content']['application/json'];
type UserCreateRequest = paths['/api/v1/workshop/users']['post']['requestBody']['content']['application/json'];
type UserCreateResponse = paths['/api/v1/workshop/users']['post']['responses'][201]['content']['application/json'];
type UserUpdateRequest = paths['/api/v1/workshop/users/{id}']['patch']['requestBody']['content']['application/json'];
type UserUpdateResponse = paths['/api/v1/workshop/users/{id}']['patch']['responses'][200]['content']['application/json'];
type TeamListResponse = paths['/api/v1/workshop/teams']['get']['responses'][200]['content']['application/json'];
type TeamCreateRequest = paths['/api/v1/workshop/teams']['post']['requestBody']['content']['application/json'];
type TeamCreateResponse = paths['/api/v1/workshop/teams']['post']['responses'][201]['content']['application/json'];
type TeamUpdateRequest = paths['/api/v1/workshop/teams/{id}']['patch']['requestBody']['content']['application/json'];
type TeamUpdateResponse = paths['/api/v1/workshop/teams/{id}']['patch']['responses'][200]['content']['application/json'];

export class ApiRequestError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type ApiErrorBody = {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function parseErrorResponse(response: Response): Promise<{ message: string; fieldErrors: Record<string, string> }> {
  let detail = '';
  let fieldErrors: Record<string, string> = {};
  try {
    const body = (await response.json()) as ApiErrorBody;
    detail = body.message ?? body.error ?? '';
    fieldErrors = body.fieldErrors ?? {};
  } catch {
    // JSON 응답이 아니면 기본 메시지를 사용한다.
  }

  if (!detail) {
    return { message: `요청이 실패했습니다. (${response.status})`, fieldErrors };
  }

  return { message: `${detail} (${response.status})`, fieldErrors };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${WORKSHOP_PROXY_BASE}${path}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const parsed = await parseErrorResponse(response);
    throw new ApiRequestError(response.status, parsed.message, parsed.fieldErrors);
  }
  return (await response.json()) as T;
}

async function sendJson<T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<T> {
  const response = await fetch(`${WORKSHOP_PROXY_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const parsed = await parseErrorResponse(response);
    throw new ApiRequestError(response.status, parsed.message, parsed.fieldErrors);
  }

  if (method === 'DELETE' || response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const workshopApi = {
  getOverview: () => getJson<OverviewResponse>('/overview'),
  getSchedules: () => getJson<ScheduleListResponse>('/schedules'),
  getMissions: () => getJson<MissionListResponse>('/missions'),
  getSessions: () => getJson<SessionListResponse>('/sessions'),
  getUsers: () => getJson<UserListResponse>('/users'),
  getTeams: () => getJson<TeamListResponse>('/teams'),
  createSchedule: (payload: ScheduleCreateRequest) =>
    sendJson<ScheduleCreateResponse>('/schedules', 'POST', payload),
  updateSchedule: (id: string, payload: ScheduleUpdateRequest) =>
    sendJson<ScheduleUpdateResponse>(`/schedules/${id}`, 'PATCH', payload),
  deleteSchedule: (id: string) => sendJson<void>(`/schedules/${id}`, 'DELETE'),
  createMission: (payload: MissionCreateRequest) =>
    sendJson<MissionCreateResponse>('/missions', 'POST', payload),
  updateMission: (id: string, payload: MissionUpdateRequest) =>
    sendJson<MissionUpdateResponse>(`/missions/${id}`, 'PATCH', payload),
  deleteMission: (id: string) => sendJson<void>(`/missions/${id}`, 'DELETE'),
  createSession: (payload: SessionCreateRequest) =>
    sendJson<SessionCreateResponse>('/sessions', 'POST', payload),
  updateSession: (id: string, payload: SessionUpdateRequest) =>
    sendJson<SessionUpdateResponse>(`/sessions/${id}`, 'PATCH', payload),
  deleteSession: (id: string) => sendJson<void>(`/sessions/${id}`, 'DELETE'),
  reorderSessions: (payload: SessionReorderRequest) => sendJson<void>('/sessions/reorder', 'POST', payload),
  getSessionQuestions: (sessionId: string) => getJson<SessionQuestionListResponse>(`/sessions/${sessionId}/questions`),
  deleteSessionQuestion: (sessionId: string, questionId: string) =>
    sendJson<void>(`/sessions/${sessionId}/questions/${questionId}`, 'DELETE'),
  createUser: (payload: UserCreateRequest) =>
    sendJson<UserCreateResponse>('/users', 'POST', payload),
  updateUser: (id: string, payload: UserUpdateRequest) =>
    sendJson<UserUpdateResponse>(`/users/${id}`, 'PATCH', payload),
  deleteUser: (id: string) => sendJson<void>(`/users/${id}`, 'DELETE'),
  resetUserPassword: (id: string) => sendJson<void>(`/users/${id}/password/reset`, 'POST'),
  createTeam: (payload: TeamCreateRequest) => sendJson<TeamCreateResponse>('/teams', 'POST', payload),
  updateTeam: (id: string, payload: TeamUpdateRequest) =>
    sendJson<TeamUpdateResponse>(`/teams/${id}`, 'PATCH', payload),
  deleteTeam: (id: string) => sendJson<void>(`/teams/${id}`, 'DELETE'),
};
