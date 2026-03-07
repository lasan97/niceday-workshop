'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ScheduleItemResponse } from '@workshop/types';
import { MarkdownText, markdownToPlainText, twoLineClampStyle } from '@workshop/ui';
import { ApiRequestError, workshopApi } from '../../lib/workshop-api';
import { AdminScreen } from '../components/AdminScreen';
import { PageSpinner } from '../components/PageSpinner';
import { Toast } from '../components/Toast';

type ScheduleFieldKey = 'date' | 'startsAt' | 'endsAt' | 'title' | 'description';
type ScheduleFieldErrors = Partial<Record<ScheduleFieldKey, string>>;
type ToastState = { type: 'success' | 'error'; message: string } | null;
type SchedulePeriod = { startDate: string; endDate: string };
type ScheduleForm = {
  id: string | null;
  date: string;
  startsAt: string;
  endsAt: string;
  title: string;
  description: string;
};

const emptyForm: ScheduleForm = {
  id: null,
  date: '',
  startsAt: '09:00',
  endsAt: '10:00',
  title: '',
  description: '',
};

function extractDate(value: string): string {
  return value.split('T')[0] ?? '';
}

function extractTime(value: string): string {
  const time = value.split('T')[1] ?? '';
  return time.slice(0, 5);
}

function toDateTime(date: string, time: string): string {
  return `${date}T${time}`;
}

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(date);
}

function getPeriodDateOptions(period: SchedulePeriod): string[] {
  if (!period.startDate || !period.endDate || period.startDate > period.endDate) {
    return [];
  }

  const options: string[] = [];
  let cursor = new Date(`${period.startDate}T00:00:00`);
  const end = new Date(`${period.endDate}T00:00:00`);
  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    const day = String(cursor.getDate()).padStart(2, '0');
    options.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
}

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItemResponse[]>([]);
  const [period, setPeriod] = useState<SchedulePeriod>({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [periodEditing, setPeriodEditing] = useState(false);
  const [periodDraft, setPeriodDraft] = useState<SchedulePeriod>({ startDate: '', endDate: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalSchedule, setDetailModalSchedule] = useState<ScheduleItemResponse | null>(null);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ScheduleFieldErrors>({});
  const [descriptionEditorTab, setDescriptionEditorTab] = useState<'editor' | 'preview'>('editor');

  const periodDateOptions = useMemo(() => getPeriodDateOptions(period), [period]);

  const modalDateOptions = useMemo(() => {
    if (!form.date || periodDateOptions.includes(form.date)) {
      return periodDateOptions;
    }
    return [form.date, ...periodDateOptions];
  }, [form.date, periodDateOptions]);

  async function loadSchedules() {
    try {
      const [schedulesData, periodData] = await Promise.all([
        workshopApi.getSchedules(),
        workshopApi.getSchedulePeriod(),
      ]);
      setSchedules(schedulesData);
      setPeriod(periodData);
      setPeriodDraft(periodData);
    } catch {
      setToast({ type: 'error', message: '일정 조회에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSchedules();
  }, []);

  function openCreateModal(date?: string) {
    if (periodDateOptions.length === 0) {
      setToast({ type: 'error', message: '먼저 워크샵 기간을 설정해주세요.' });
      return;
    }

    const targetDate = date ?? periodDateOptions[0];
    setFieldErrors({});
    setDescriptionEditorTab('editor');
    setForm({ ...emptyForm, date: targetDate, title: '새 일정', description: '상세 설명을 입력하세요.' });
    setModalOpen(true);
  }

  function openEditModal(item: ScheduleItemResponse) {
    setFieldErrors({});
    setDescriptionEditorTab('editor');
    setForm({
      id: item.id,
      date: extractDate(item.startsAt),
      startsAt: extractTime(item.startsAt),
      endsAt: extractTime(item.endsAt),
      title: item.title,
      description: item.description,
    });
    setModalOpen(true);
  }

  function openDetailModal(item: ScheduleItemResponse) {
    setDetailModalSchedule(item);
  }

  function startPeriodEdit() {
    setPeriodDraft(period);
    setPeriodError(null);
    setPeriodEditing(true);
  }

  function cancelPeriodEdit() {
    setPeriodDraft(period);
    setPeriodError(null);
    setPeriodEditing(false);
  }

  function validateForm(): boolean {
    const errors: ScheduleFieldErrors = {};

    if (!form.date) {
      errors.date = '날짜를 입력해주세요.';
    }
    if (!form.startsAt) {
      errors.startsAt = '시작 시간을 입력해주세요.';
    }
    if (!form.endsAt) {
      errors.endsAt = '종료 시간을 입력해주세요.';
    }

    if (form.date && form.startsAt && form.endsAt) {
      const start = new Date(`${form.date}T${form.startsAt}:00`);
      const end = new Date(`${form.date}T${form.endsAt}:00`);
      if (!(start < end)) {
        errors.endsAt = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }

      if (period.startDate && period.endDate && (form.date < period.startDate || form.date > period.endDate)) {
        errors.date = '워크샵 기간 내 날짜만 선택할 수 있습니다.';
      }
    }

    if (!form.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    }
    if (!form.description.trim()) {
      errors.description = '설명을 입력해주세요.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSavePeriod() {
    if (submitting) {
      return;
    }

    if (!periodDraft.startDate || !periodDraft.endDate) {
      setPeriodError('시작일/종료일을 모두 입력해주세요.');
      setToast({ type: 'error', message: '워크샵 기간을 확인해주세요.' });
      return;
    }

    if (periodDraft.startDate > periodDraft.endDate) {
      setPeriodError('종료일은 시작일보다 빠를 수 없습니다.');
      setToast({ type: 'error', message: '워크샵 기간을 확인해주세요.' });
      return;
    }

    setSubmitting(true);
    setToast(null);
    setPeriodError(null);
    try {
      const updated = await workshopApi.updateSchedulePeriod(periodDraft);
      setPeriod(updated);
      setPeriodDraft(updated);
      setPeriodEditing(false);
      setToast({ type: 'success', message: '워크샵 기간을 저장했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '워크샵 기간 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveSchedule() {
    if (submitting || !validateForm()) {
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const payload = {
        startsAt: toDateTime(form.date, form.startsAt),
        endsAt: toDateTime(form.date, form.endsAt),
        title: form.title,
        description: form.description,
      };

      if (form.id) {
        await workshopApi.updateSchedule(form.id, payload);
        setToast({ type: 'success', message: '일정을 저장했습니다.' });
      } else {
        await workshopApi.createSchedule(payload);
        setToast({ type: 'success', message: '일정을 추가했습니다.' });
      }

      setModalOpen(false);
      await loadSchedules();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.fieldErrors as ScheduleFieldErrors);
      }
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '일정 저장에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      await workshopApi.deleteSchedule(id);
      if (detailModalSchedule?.id === id) {
        setDetailModalSchedule(null);
      }
      await loadSchedules();
      setToast({ type: 'success', message: '일정을 삭제했습니다.' });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof ApiRequestError ? error.message : '일정 삭제에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const grouped = useMemo(() => {
    return schedules.reduce<Record<string, ScheduleItemResponse[]>>((acc, item) => {
      const date = extractDate(item.startsAt) || '미분류';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  }, [schedules]);

  const dayEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  const hasSchedules = dayEntries.length > 0;

  return (
    <AdminScreen
      title="일정 관리"
      subtitle="행사 일정 관리"
      action={
        <div className="flex items-center gap-2">
          <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50" disabled>
            공지 발송
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
            disabled={submitting || loading}
            onClick={() => openCreateModal()}
          >
            + 이벤트 추가
          </button>
        </div>
      }
    >
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      {loading ? <PageSpinner label="일정 목록을 불러오는 중..." /> : null}

      {!loading ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">워크샵 전체 기간</h2>
              {!periodEditing ? (
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                  disabled={submitting}
                  onClick={startPeriodEdit}
                >
                  편집
                </button>
              ) : null}
            </div>

            {!periodEditing ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {period.startDate && period.endDate
                  ? `${formatDateLabel(period.startDate)} ~ ${formatDateLabel(period.endDate)}`
                  : '기간이 설정되지 않았습니다.'}
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
                    value={periodDraft.startDate}
                    disabled={submitting}
                    onChange={(event) => {
                      setPeriodError(null);
                      setPeriodDraft((prev) => ({ ...prev, startDate: event.target.value }));
                    }}
                  />
                  <input
                    type="date"
                    className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
                    value={periodDraft.endDate}
                    disabled={submitting}
                    onChange={(event) => {
                      setPeriodError(null);
                      setPeriodDraft((prev) => ({ ...prev, endDate: event.target.value }));
                    }}
                  />
                </div>
                {periodError ? <p className="mt-1 text-[10px] font-semibold text-red-600">{periodError}</p> : null}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                    disabled={submitting}
                    onClick={cancelPeriodEdit}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-primary bg-primary px-3 py-1 text-xs font-semibold text-white"
                    disabled={submitting}
                    onClick={() => {
                      void handleSavePeriod();
                    }}
                  >
                    기간 저장
                  </button>
                </div>
              </>
            )}
          </section>

          {!hasSchedules ? (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-700">등록된 일정이 없습니다.</p>
              <p className="mt-1 text-xs text-slate-500">이벤트 추가 버튼으로 일정을 등록하세요.</p>
            </section>
          ) : null}

          {dayEntries.map(([date, items]) => (
            <section key={date} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-bold text-primary">{formatDateLabel(date)}</h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary"
                  disabled={submitting}
                  onClick={() => openCreateModal(date)}
                >
                  + 이벤트 추가
                </button>
              </div>

              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => openDetailModal(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openDetailModal(item);
                      }
                    }}
                  >
                    <p className="text-xs font-semibold text-slate-500">
                      {extractTime(item.startsAt)} - {extractTime(item.endsAt)}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-600" style={twoLineClampStyle}>
                      {markdownToPlainText(item.description)}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                      disabled={submitting}
                      onClick={(event) => {
                        event.stopPropagation();
                        openDetailModal(item);
                      }}
                    >
                      상세
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 bg-white py-1 text-[10px] font-semibold"
                      disabled={submitting}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditModal(item);
                      }}
                    >
                      편집
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-200 bg-red-50 py-1 text-[10px] font-semibold text-red-600"
                      disabled={submitting}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDelete(item.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{form.id ? '일정 편집' : '일정 추가'}</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => {
                  setModalOpen(false);
                  setDescriptionEditorTab('editor');
                }}
              >
                닫기
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-[10px] font-semibold text-slate-500">날짜</label>
              <select
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.date ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.date}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, date: undefined }));
                  setForm((prev) => ({ ...prev, date: event.target.value }));
                }}
              >
                {modalDateOptions.map((date) => (
                  <option key={date} value={date}>
                    {formatDateLabel(date)}
                  </option>
                ))}
                {periodDateOptions.length === 0 ? <option value="">기간을 먼저 설정해주세요</option> : null}
              </select>
              {fieldErrors.date ? <p className="text-[10px] font-semibold text-red-600">{fieldErrors.date}</p> : null}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">시작 시간</label>
                  <input
                    type="time"
                    className={`mt-1 w-full rounded border px-2 py-2 text-xs ${
                      fieldErrors.startsAt ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                    }`}
                    value={form.startsAt}
                    disabled={submitting}
                    onChange={(event) => {
                      setFieldErrors((prev) => ({ ...prev, startsAt: undefined }));
                      setForm((prev) => ({ ...prev, startsAt: event.target.value }));
                    }}
                  />
                  {fieldErrors.startsAt ? (
                    <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.startsAt}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">종료 시간</label>
                  <input
                    type="time"
                    className={`mt-1 w-full rounded border px-2 py-2 text-xs ${
                      fieldErrors.endsAt ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                    }`}
                    value={form.endsAt}
                    disabled={submitting}
                    onChange={(event) => {
                      setFieldErrors((prev) => ({ ...prev, endsAt: undefined }));
                      setForm((prev) => ({ ...prev, endsAt: event.target.value }));
                    }}
                  />
                  {fieldErrors.endsAt ? <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.endsAt}</p> : null}
                </div>
              </div>

              <label className="text-[10px] font-semibold text-slate-500">제목</label>
              <input
                className={`w-full rounded border px-2 py-2 text-xs ${
                  fieldErrors.title ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                }`}
                value={form.title}
                disabled={submitting}
                onChange={(event) => {
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  setForm((prev) => ({ ...prev, title: event.target.value }));
                }}
              />
              {fieldErrors.title ? <p className="text-[10px] font-semibold text-red-600">{fieldErrors.title}</p> : null}

              <label className="text-[10px] font-semibold text-slate-500">설명</label>
              {fieldErrors.description ? (
                <p className="text-[10px] font-semibold text-red-600">{fieldErrors.description}</p>
              ) : null}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold text-slate-500">설명 편집</p>
                  <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                        descriptionEditorTab === 'editor' ? 'bg-slate-900 text-white' : 'text-slate-500'
                      }`}
                      onClick={() => setDescriptionEditorTab('editor')}
                    >
                      에디터
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                        descriptionEditorTab === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500'
                      }`}
                      onClick={() => setDescriptionEditorTab('preview')}
                    >
                      미리보기
                    </button>
                  </div>
                </div>
                {descriptionEditorTab === 'editor' ? (
                  <textarea
                    rows={5}
                    className={`mt-2 w-full rounded border px-2 py-2 text-xs ${
                      fieldErrors.description ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                    }`}
                    value={form.description}
                    disabled={submitting}
                    onChange={(event) => {
                      setFieldErrors((prev) => ({ ...prev, description: undefined }));
                      setForm((prev) => ({ ...prev, description: event.target.value }));
                    }}
                  />
                ) : (
                  <div className="mt-2 min-h-24 rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
                    <MarkdownText content={form.description || '미리보기할 설명이 없습니다.'} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                disabled={submitting}
                onClick={() => {
                  setModalOpen(false);
                  setDescriptionEditorTab('editor');
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-md border border-primary bg-primary px-3 py-1 text-xs font-semibold text-white"
                disabled={submitting}
                onClick={() => {
                  void handleSaveSchedule();
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailModalSchedule ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">일정 상세</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setDetailModalSchedule(null)}
              >
                닫기
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <p className="text-xs font-semibold text-slate-500">
                {formatDateLabel(extractDate(detailModalSchedule.startsAt))} · {extractTime(detailModalSchedule.startsAt)} -{' '}
                {extractTime(detailModalSchedule.endsAt)}
              </p>
              <h4 className="text-base font-bold text-slate-900">{detailModalSchedule.title}</h4>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <MarkdownText content={detailModalSchedule.description} />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                onClick={() => setDetailModalSchedule(null)}
              >
                닫기
              </button>
              <button
                type="button"
                className="rounded-md border border-primary bg-primary px-3 py-1 text-xs font-semibold text-white"
                disabled={submitting}
                onClick={() => {
                  openEditModal(detailModalSchedule);
                  setDetailModalSchedule(null);
                }}
              >
                편집
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminScreen>
  );
}
