import type {
  paths,
} from '@workshop/types';

const WORKSHOP_PROXY_BASE = '/api/workshop';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${WORKSHOP_PROXY_BASE}${path}`, {
    cache: 'no-store',
  });
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
  getOverview: () => getJson<OverviewResponse>('/overview'),
  getSchedules: () => getJson<ScheduleListResponse>('/schedules'),
  getMissions: () => getJson<MissionListResponse>('/missions'),
  getSessions: () => getJson<SessionListResponse>('/sessions'),
};
