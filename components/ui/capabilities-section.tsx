'use client';

import { Database, Layers3, Sparkles } from 'lucide-react';

import { SpotlightCard } from '@/components/ui/spotlight-card';
import { cn } from '@/lib/utils';

type CapabilitiesSectionProps = {
  isLight?: boolean;
};

const items = [
  {
    icon: Database,
    title: '智能知识抽取',
    description: '把教案、讲义与题库整理成一条更清晰的课堂知识主线。',
    accentClass: 'text-white border-white/10',
    spotlightColor: 'rgba(255, 255, 255, 0.14)',
  },
  {
    icon: Layers3,
    title: '课件结构生成',
    description: '自动补齐导入、知识推进、练习与总结，减少从零开始的整理时间。',
    accentClass: 'text-sky-400 border-sky-500/30',
    spotlightColor: 'rgba(56, 189, 248, 0.18)',
  },
  {
    icon: Sparkles,
    title: '课堂互动设计',
    description: '把提问、练习和互动节奏提前编进课件里，课堂上可以直接使用。',
    accentClass: 'text-violet-400 border-violet-500/30',
    spotlightColor: 'rgba(167, 139, 250, 0.18)',
  },
] as const;

export function CapabilitiesSection({ isLight = false }: CapabilitiesSectionProps) {
  return (
    <section
      className={cn(
        'relative z-10 w-full px-4 py-18 md:px-6 md:py-24',
        isLight ? 'bg-transparent text-black' : 'bg-transparent text-white',
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-14">
          <p className={cn('mb-3 text-xs font-semibold uppercase tracking-[0.32em]', isLight ? 'text-black/45' : 'text-white/45')}>
            能力模块
          </p>
          <h2 className={cn('text-3xl font-semibold tracking-tight md:text-5xl', isLight ? 'text-black' : 'text-white')}>
            把教学资料组织成可直接使用的课堂内容
          </h2>
          <p className={cn('mx-auto mt-4 max-w-2xl text-sm leading-7 md:text-base', isLight ? 'text-black/60' : 'text-white/60')}>
            从知识抽取到结构编排，再到课堂互动设计，系统会把零散素材整理成一套更完整的教学输出。
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <SpotlightCard
                key={item.title}
                spotlightColor={item.spotlightColor}
                className={cn(
                  'min-h-[220px] rounded-[28px] px-7 py-7 md:min-h-[240px] md:px-8 md:py-8',
                  isLight
                    ? 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300'
                    : 'border-neutral-800 bg-[#171717] text-neutral-200 hover:border-neutral-700',
                )}
              >
                <div className="flex h-full flex-col">
                  <div
                    className={cn(
                      'flex h-18 w-18 items-center justify-center rounded-3xl border bg-white/3',
                      isLight ? 'border-neutral-200 bg-neutral-50' : item.accentClass,
                    )}
                  >
                    <Icon className={cn('size-8', isLight ? 'text-neutral-900' : item.accentClass.split(' ')[0])} strokeWidth={1.9} />
                  </div>

                  <h3 className={cn('mt-8 text-[2rem] font-semibold tracking-tight', isLight ? 'text-neutral-950' : 'text-white')}>
                    {item.title}
                  </h3>
                  <p className={cn('mt-4 max-w-[18ch] text-[1.05rem] leading-8', isLight ? 'text-neutral-600' : 'text-neutral-400')}>
                    {item.description}
                  </p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
