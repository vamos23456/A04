import { LessonPlan } from './kimiService';
import { PptSlide } from '../types';

function safeFileName(name: string, fallback: string): string {
  const trimmed = (name || '').trim();
  const base = trimmed || fallback;
  return base.replace(/[\\/:*?"<>|]/g, '_');
}

async function downloadBlob(endpoint: string, payload: unknown, fileName: string): Promise<void> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || err?.message || `导出失败：${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportDocx(word: LessonPlan): Promise<void> {
  const fileName = `${safeFileName(word.title || '教案', '教案')}.docx`;
  await downloadBlob('/export-proxy/export/docx', { word }, fileName);
}

export async function exportPptx(slides: PptSlide[], title: string): Promise<void> {
  const fileName = `${safeFileName(title || 'PPT课件', 'PPT课件')}.pptx`;
  await downloadBlob('/export-proxy/export/pptx', { slides, title }, fileName);
}
