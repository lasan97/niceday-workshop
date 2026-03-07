import type { components } from './generated/workshop-api';

export type OverviewResponse = components['schemas']['OverviewResponse'];
export type ScheduleItemResponse = components['schemas']['ScheduleItemResponse'];
export type SchedulePeriodResponse = components['schemas']['SchedulePeriodResponse'];
export type MissionResponse = components['schemas']['MissionResponse'];
export type SessionResponse = components['schemas']['SessionResponse'];
export type UserResponse = components['schemas']['UserResponse'];
export type TeamResponse = components['schemas']['TeamResponse'];

export type ScheduleUpsertRequest = components['schemas']['ScheduleUpsertRequest'];
export type SchedulePeriodUpdateRequest = components['schemas']['SchedulePeriodUpdateRequest'];
export type MissionUpsertRequest = components['schemas']['MissionUpsertRequest'];
export type SessionUpsertRequest = components['schemas']['SessionUpsertRequest'];
export type UserUpsertRequest = components['schemas']['UserUpsertRequest'];
export type TeamUpsertRequest = components['schemas']['TeamUpsertRequest'];
export type AuthLoginRequest = components['schemas']['AuthLoginRequest'];
export type AuthLoginResponse = components['schemas']['AuthLoginResponse'];
export type ApiErrorResponse = components['schemas']['ApiErrorResponse'];
