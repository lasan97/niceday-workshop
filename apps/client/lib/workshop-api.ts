import type {
  paths,
} from '@workshop/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

type OverviewResponse = paths['/api/v1/workshop/overview']['get']['responses'][200]['content']['application/json'];
type ScheduleListResponse = paths['/api/v1/workshop/schedules']['get']['responses'][200]['content']['application/json'];
type MissionListResponse = paths['/api/v1/workshop/missions']['get']['responses'][200]['content']['application/json'];
type SessionListResponse = paths['/api/v1/workshop/sessions']['get']['responses'][200]['content']['application/json'];

export const workshopApi = {
  getOverview: () => getJson<OverviewResponse>('/api/v1/workshop/overview'),
  getSchedules: () => getJson<ScheduleListResponse>('/api/v1/workshop/schedules'),
  getMissions: () => getJson<MissionListResponse>('/api/v1/workshop/missions'),
  getSessions: () => getJson<SessionListResponse>('/api/v1/workshop/sessions'),
};
