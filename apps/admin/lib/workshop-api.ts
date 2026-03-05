import type {
  MissionResponse,
  OverviewResponse,
  ScheduleItemResponse,
  SessionResponse,
  UserResponse,
} from '@workshop/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
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
    throw new Error(`API request failed: ${response.status}`);
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
  createMission: (payload: Omit<MissionResponse, 'id'>) =>
    sendJson<MissionResponse>('/api/v1/workshop/missions', 'POST', payload),
  updateMission: (id: string, payload: Omit<MissionResponse, 'id'>) =>
    sendJson<MissionResponse>(`/api/v1/workshop/missions/${id}`, 'PATCH', payload),
  deleteMission: (id: string) => sendJson<void>(`/api/v1/workshop/missions/${id}`, 'DELETE'),
};
