"use client"

import { Player } from '@remotion/player';
import { TutorialVideo } from '@/components/TutorialVideo';
import { PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type TutorialSectionProps = {
  isLight?: boolean
}

export function TutorialSection({ isLight = false }: TutorialSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('tutorial-section');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="tutorial-section" className="relative z-10 w-full px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* 标题 */}
        <div
          className="mb-16 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div className={
            isLight
              ? "mb-4 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/5 px-4 py-2 text-xs font-medium text-black/70 animate-pulse"
              : "mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 animate-pulse"
          }>
            <PlayCircle size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
            使用教程
          </div>
          <h2 className={
            isLight
              ? "mb-4 text-4xl font-bold tracking-tight text-black md:text-5xl"
              : "mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl"
          }>
            三步生成优质教学内容
          </h2>
          <p className={
            isLight
              ? "mx-auto max-w-2xl text-base text-black/60 md:text-lg"
              : "mx-auto max-w-2xl text-base text-white/60 md:text-lg"
          }>
            通过 AI 对话理解教学意图,智能检索知识库,自动生成专业 PPT 和教案
          </p>
        </div>

        {/* 视频播放器 */}
        <div
          className="relative mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.95)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
          }}
        >
          <div className={
            isLight
              ? "group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_80px_rgba(0,0,0,0.3)]"
              : "group overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_80px_rgba(255,255,255,0.1)]"
          }>
            <Player
              component={TutorialVideo}
              durationInFrames={270}
              compositionWidth={1920}
              compositionHeight={1080}
              fps={30}
              style={{
                width: '100%',
                aspectRatio: '16/9',
              }}
              controls
              loop
            />
          </div>

          {/* 装饰光晕 - 动态变化 */}
          {!isLight && (
            <>
              <div
                className="pointer-events-none absolute -inset-4 -z-10 opacity-50 blur-3xl transition-all duration-1000"
                style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
                  animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <div
                className="pointer-events-none absolute -inset-8 -z-20 opacity-30 blur-3xl transition-all duration-1000"
                style={{
                  background: 'linear-gradient(225deg, rgba(240, 147, 251, 0.2), rgba(245, 87, 108, 0.2))',
                  animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s'
                }}
              />
            </>
          )}
        </div>

      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </section>
  );
}
