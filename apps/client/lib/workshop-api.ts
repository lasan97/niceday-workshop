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

async function sendJson<T>(path: string, method: 'POST' | 'PATCH', body: unknown): Promise<T> {
  const response = await fetch(`${WORKSHOP_PROXY_BASE}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
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
type SessionQuestionListResponse = paths['/api/v1/workshop/sessions/{id}/questions']['get']['responses'][200]['content']['application/json'];
type SessionQuestionCreateRequest = paths['/api/v1/workshop/sessions/{id}/questions']['post']['requestBody']['content']['application/json'];
type SessionQuestionCreateResponse = paths['/api/v1/workshop/sessions/{id}/questions']['post']['responses'][201]['content']['application/json'];
type SessionQuestionAnswerRequest = paths['/api/v1/workshop/sessions/{sessionId}/questions/{questionId}/answer']['patch']['requestBody']['content']['application/json'];
type SessionQuestionAnswerResponse = paths['/api/v1/workshop/sessions/{sessionId}/questions/{questionId}/answer']['patch']['responses'][200]['content']['application/json'];

export const workshopApi = {
  getOverview: () => getJson<OverviewResponse>('/overview'),
  getSchedules: () => getJson<ScheduleListResponse>('/schedules'),
  getMissions: () => getJson<MissionListResponse>('/missions'),
  getSessions: () => getJson<SessionListResponse>('/sessions'),
  getSessionQuestions: (sessionId: string) => getJson<SessionQuestionListResponse>(`/sessions/${sessionId}/questions`),
  createSessionQuestion: (sessionId: string, payload: SessionQuestionCreateRequest) =>
    sendJson<SessionQuestionCreateResponse>(`/sessions/${sessionId}/questions`, 'POST', payload),
  answerSessionQuestion: (sessionId: string, questionId: string, payload: SessionQuestionAnswerRequest) =>
    sendJson<SessionQuestionAnswerResponse>(`/sessions/${sessionId}/questions/${questionId}/answer`, 'PATCH', payload),
};
