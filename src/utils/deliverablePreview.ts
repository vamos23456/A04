import type { LessonPlan } from '../services/kimiService';
import type { PptSlide } from '../types';

export type DeliverablePreviewKind = 'ppt' | 'docx';

export type DeliverablePreviewPayload = {
  kind: DeliverablePreviewKind;
  title: string;
  slides?: PptSlide[];
  word?: LessonPlan;
  createdAt: number;
};

export const DELIVERABLE_PREVIEW_STORAGE_KEY = 'teaching-studio-deliverable-preview';

export function saveDeliverablePreview(payload: DeliverablePreviewPayload) {
  sessionStorage.setItem(DELIVERABLE_PREVIEW_STORAGE_KEY, JSON.stringify(payload));
}

export function readDeliverablePreview(): DeliverablePreviewPayload | null {
  const raw = sessionStorage.getItem(DELIVERABLE_PREVIEW_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DeliverablePreviewPayload;
  } catch {
    return null;
  }
}

export function openDeliverablePreview(payload: DeliverablePreviewPayload) {
  saveDeliverablePreview(payload);
  window.location.hash = `studio-preview/${payload.kind}`;
}
