import React, { useMemo } from 'react';
import { ArrowLeft, Download, FileText, Presentation } from 'lucide-react';
import { exportDocx, exportPptx } from '../services/exportService';
import type { LessonPlan } from '../services/kimiService';
import type { PptSlide } from '../types';
import type { DeliverablePreviewKind } from '../utils/deliverablePreview';

function PptSlidePreview({ slide, index }: { slide: PptSlide; index: number }) {
  const accent = slide.accent || '7c9cff';

  return (
    <section
      className="overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-[0_18px_40px_rgba(29,29,31,0.08)]"
      style={{ minHeight: 320 }}
    >
      <div
        className="flex items-center justify-between border-b border-black/6 px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black/38"
        style={{ background: `linear-gradient(135deg, rgba(18,24,40,0.04), rgba(18,24,40,0.01) 48%, #${accent}20)` }}
      >
        <span>Slide {index + 1}</span>
        <span>{slide.layout}</span>
      </div>

      <div className="space-y-5 px-7 py-7">
        <div>
          <h2 className="text-[28px] font-medium tracking-[-0.05em] text-[#171717]">
            {slide.title || '未命名页面'}
          </h2>
          {slide.subtitle ? <p className="mt-3 text-sm leading-7 text-black/56">{slide.subtitle}</p> : null}
        </div>

        {slide.body?.length ? (
          <div className="grid gap-3">
            {slide.body.map((item) => (
              <div key={item} className="rounded-[18px] border border-black/6 bg-[#faf8f4] px-4 py-3 text-sm leading-7 text-black/72">
                {item}
              </div>
            ))}
          </div>
        ) : null}

        {slide.note ? (
          <div className="rounded-[18px] bg-black/[0.04] px-4 py-3 text-sm leading-7 text-black/58">
            备注：{slide.note}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DocxPreview({ word }: { word: LessonPlan }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-black/8 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(29,29,31,0.08)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-black/38">Lesson Plan</p>
        <h1 className="mt-4 text-[34px] font-medium tracking-[-0.05em] text-[#171717]">{word.title || '未命名教案'}</h1>
      </section>

      <section className="rounded-[28px] border border-black/8 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(29,29,31,0.08)]">
        <h2 className="text-xl font-medium text-[#171717]">教学目标</h2>
        <div className="mt-5 grid gap-3">
          {(word.objectives.length ? word.objectives : ['暂无教学目标']).map((item) => (
            <div key={item} className="rounded-[18px] bg-[#faf8f4] px-4 py-3 text-sm leading-7 text-black/72">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-black/8 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(29,29,31,0.08)]">
        <h2 className="text-xl font-medium text-[#171717]">教学流程</h2>
        <div className="mt-5 space-y-4">
          {(word.process.length ? word.process : [{ stage: '教学流程待生成', duration: '', activities: [] }]).map((item) => (
            <div key={`${item.stage}-${item.duration}`} className="rounded-[22px] border border-black/6 bg-[#fcfbf8] px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-[#171717]">{item.stage}</h3>
                {item.duration ? <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs text-black/54">{item.duration}</span> : null}
              </div>
              <div className="mt-4 grid gap-2">
                {(item.activities?.length ? item.activities : ['暂无活动内容']).map((activity) => (
                  <div key={activity} className="rounded-[16px] bg-[#f4efe6] px-4 py-3 text-sm leading-7 text-black/70">
                    {activity}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {word.methods?.length ? (
        <section className="rounded-[28px] border border-black/8 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(29,29,31,0.08)]">
          <h2 className="text-xl font-medium text-[#171717]">教学方法</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {word.methods.map((item) => (
              <span key={item} className="rounded-full border border-black/8 px-4 py-2 text-sm text-black/64">
                {item}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {word.homework?.length ? (
        <section className="rounded-[28px] border border-black/8 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(29,29,31,0.08)]">
          <h2 className="text-xl font-medium text-[#171717]">课后作业</h2>
          <div className="mt-5 grid gap-3">
            {word.homework.map((item) => (
              <div key={item} className="rounded-[18px] bg-[#faf8f4] px-4 py-3 text-sm leading-7 text-black/72">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function DeliverablePreviewPage({
  kind,
  title,
  slides,
  word,
}: {
  kind: DeliverablePreviewKind;
  title: string;
  slides?: PptSlide[];
  word?: LessonPlan;
}) {
  const isPpt = kind === 'ppt';
  const headerTitle = isPpt ? 'PPT 预览' : '教案预览';
  const Icon = isPpt ? Presentation : FileText;

  const subtitle = useMemo(() => {
    if (isPpt) {
      return `${slides?.length ?? 0} 页内容`;
    }
    return `${word?.process?.length ?? 0} 个教学环节`;
  }, [isPpt, slides?.length, word?.process?.length]);

  const handleExport = async () => {
    if (isPpt && slides?.length) {
      await exportPptx(slides, title);
      return;
    }

    if (!isPpt && word) {
      await exportDocx(word);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe4] text-[#171717]">
      <header className="sticky top-0 z-20 border-b border-black/8 bg-[#f3efe4]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '';
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm text-black/72 transition-colors hover:bg-[#fbfaf6]"
            >
              <ArrowLeft size={16} />
              返回工作台
            </button>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-black text-white">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-black/38">{headerTitle}</p>
              <h1 className="mt-1 text-xl font-medium tracking-[-0.04em] text-[#171717]">{title || headerTitle}</h1>
              <p className="mt-1 text-sm text-black/46">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm text-white transition-colors hover:bg-black/88"
          >
            <Download size={16} />
            {isPpt ? '导出 PPT' : '导出教案'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-8 py-8">
        {isPpt ? (
          <div className="grid gap-6">
            {(slides?.length ? slides : [{ layout: 'cover', title: '暂无可预览内容' }]).map((slide, index) => (
              <PptSlidePreview key={`${slide.title || 'slide'}-${index}`} slide={slide} index={index} />
            ))}
          </div>
        ) : word ? (
          <DocxPreview word={word} />
        ) : (
          <section className="rounded-[28px] border border-black/8 bg-white px-8 py-10 text-sm text-black/56 shadow-[0_18px_40px_rgba(29,29,31,0.08)]">
            当前没有可预览的教案内容。
          </section>
        )}
      </main>
    </div>
  );
}
