import type {
  MissionResponse,
  OverviewResponse,
  ScheduleItemResponse,
  SessionResponse,
  UserResponse,
} from '@workshop/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  let detail = '';
  try {
    const body = (await response.json()) as { message?: string; error?: string };
    detail = body.message ?? body.error ?? '';
  } catch {
    // JSON 응답이 아니면 기본 메시지를 사용한다.
  }

  if (!detail) {
    return `요청이 실패했습니다. (${response.status})`;
  }

  return `${detail} (${response.status})`;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new ApiRequestError(response.status, await parseErrorMessage(response));
  }
  return (await response.json()) as T;
}

async function sendJson<T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiRequestError(response.status, await parseErrorMessage(response));
  }

  if (method === 'DELETE') {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const workshopApi = {
  getOverview: () => getJson<OverviewResponse>('/api/v1/workshop/overview'),
  getSchedules: () => getJson<ScheduleItemResponse[]>('/api/v1/workshop/schedules'),
  getMissions: () => getJson<MissionResponse[]>('/api/v1/workshop/missions'),
  getSessions: () => getJson<SessionResponse[]>('/api/v1/workshop/sessions'),
  getUsers: () => getJson<UserResponse[]>('/api/v1/workshop/users'),
  createSchedule: (payload: Omit<ScheduleItemResponse, 'id'>) =>
    sendJson<ScheduleItemResponse>('/api/v1/workshop/schedules', 'POST', payload),
  updateSchedule: (id: string, payload: Omit<ScheduleItemResponse, 'id'>) =>
    sendJson<ScheduleItemResponse>(`/api/v1/workshop/schedules/${id}`, 'PATCH', payload),
  deleteSchedule: (id: string) => sendJson<void>(`/api/v1/workshop/schedules/${id}`, 'DELETE'),
  createMission: (payload: Omit<MissionResponse, 'id'>) =>
    sendJson<MissionResponse>('/api/v1/workshop/missions', 'POST', payload),
  updateMission: (id: string, payload: Omit<MissionResponse, 'id'>) =>
    sendJson<MissionResponse>(`/api/v1/workshop/missions/${id}`, 'PATCH', payload),
  deleteMission: (id: string) => sendJson<void>(`/api/v1/workshop/missions/${id}`, 'DELETE'),
  createSession: (payload: Omit<SessionResponse, 'id'>) =>
    sendJson<SessionResponse>('/api/v1/workshop/sessions', 'POST', payload),
  updateSession: (id: string, payload: Omit<SessionResponse, 'id'>) =>
    sendJson<SessionResponse>(`/api/v1/workshop/sessions/${id}`, 'PATCH', payload),
  deleteSession: (id: string) => sendJson<void>(`/api/v1/workshop/sessions/${id}`, 'DELETE'),
  createUser: (payload: Omit<UserResponse, 'id'>) =>
    sendJson<UserResponse>('/api/v1/workshop/users', 'POST', payload),
  updateUser: (id: string, payload: Omit<UserResponse, 'id'>) =>
    sendJson<UserResponse>(`/api/v1/workshop/users/${id}`, 'PATCH', payload),
  deleteUser: (id: string) => sendJson<void>(`/api/v1/workshop/users/${id}`, 'DELETE'),
};
