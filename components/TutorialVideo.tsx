import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';

const SCENE_DURATION = 90; // frames per scene
const TRANSITION = 20;     // overlap frames for 3D flip

// ── Rainbow light-band (mimics the WebGL shader stripe) ──────────────────────
const RainbowBand: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const stripes = Array.from({ length: 7 }, (_, i) => {
    const hue = (i * 51 + t * 30) % 360;
    const y = 50 + Math.sin(t * 0.8 + i * 0.9) * 2; // subtle wave
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${y}%`,
          height: '1px',
          background: `hsl(${hue}, 100%, 65%)`,
          opacity: 0.55,
          filter: 'blur(2px)',
          boxShadow: `0 0 18px 4px hsl(${hue}, 100%, 60%)`,
        }}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* main horizontal band */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${48 + Math.sin(t * 0.6) * 3}%`,
          height: '80px',
          background: `linear-gradient(90deg,
            hsl(${(t * 40) % 360},100%,55%) 0%,
            hsl(${(t * 40 + 60) % 360},100%,55%) 20%,
            hsl(${(t * 40 + 120) % 360},100%,55%) 40%,
            hsl(${(t * 40 + 180) % 360},100%,55%) 60%,
            hsl(${(t * 40 + 240) % 360},100%,55%) 80%,
            hsl(${(t * 40 + 300) % 360},100%,55%) 100%)`,
          opacity: 0.18,
          filter: 'blur(28px)',
        }}
      />
      {stripes}
    </div>
  );
};

// ── 3-D card flip transition ──────────────────────────────────────────────────
// progress 0→1: current scene rotates away (0→-90deg), next rotates in (90→0deg)
const useFlipProgress = (frame: number, fps: number, startFrame: number) =>
  spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 22, stiffness: 160, mass: 1 },
  });

// ── Scene 1: 问答对话 ─────────────────────────────────────────────────────────
const SceneChat: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const messages = [
    { text: '我需要准备一堂高三物理课', user: true, delay: 5 },
    { text: '主题是量子纠缠，时长 45 分钟', user: true, delay: 18 },
    { text: '好的，正在理解您的教学意图…', user: false, delay: 32 },
    { text: '已识别：高三 · 物理 · 量子纠缠 · 45min', user: false, delay: 46 },
  ];

  return (
    <AbsoluteFill style={{ padding: '8% 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        Step 01
      </p>
      <h2 style={{ color: '#fff', fontSize: '3.2rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '3rem', lineHeight: 1.1 }}>
        与 AI 对话，<br />描述教学需求
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '680px' }}>
        {messages.map((msg, i) => {
          const p = spring({ frame: frame - msg.delay, fps, config: { damping: 18, stiffness: 200 } });
          if (frame < msg.delay) return null;
          return (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.user ? 'flex-end' : 'flex-start',
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
            }}>
              <div style={{
                background: msg.user ? '#fff' : 'rgba(255,255,255,0.08)',
                color: msg.user ? '#000' : '#fff',
                border: msg.user ? 'none' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: msg.user ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                padding: '0.85rem 1.4rem',
                fontSize: '1.15rem',
                fontWeight: msg.user ? 500 : 400,
                backdropFilter: 'blur(8px)',
                maxWidth: '75%',
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: AI 生成 ──────────────────────────────────────────────────────────
const SceneGenerate: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE_DURATION;
  const items = ['分析教学目标', '检索知识库', '规划课程结构', '生成 PPT 大纲', '撰写教案内容'];

  return (
    <AbsoluteFill style={{ padding: '8% 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        Step 02
      </p>
      <h2 style={{ color: '#fff', fontSize: '3.2rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '3rem', lineHeight: 1.1 }}>
        AI 自动生成<br />课件与教案
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxWidth: '560px' }}>
        {items.map((label, i) => {
          const delay = i * 10 + 10;
          const p = spring({ frame: localFrame - delay, fps, config: { damping: 20, stiffness: 180 } });
          if (localFrame < delay) return null;

          const done = localFrame > delay + 18;
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              opacity: p,
              transform: `translateX(${interpolate(p, [0, 1], [-24, 0])}px)`,
            }}>
              {/* status dot */}
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: done ? '#fff' : 'rgba(255,255,255,0.25)',
                boxShadow: done ? '0 0 12px 4px rgba(255,255,255,0.5)' : 'none',
                flexShrink: 0,
                transition: 'all 0.3s',
              }} />
              <span style={{
                color: done ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: '1.2rem',
                fontWeight: done ? 500 : 400,
              }}>
                {label}
              </span>
              {done && (
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginLeft: 'auto' }}>✓</span>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: 导出 ─────────────────────────────────────────────────────────────
const SceneExport: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE_DURATION * 2;

  const cards = [
    { label: 'PPT 课件', sub: '15 页幻灯片', icon: '▤' },
    { label: '教案文档', sub: '完整教学设计', icon: '≡' },
  ];

  return (
    <AbsoluteFill style={{ padding: '8% 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        Step 03
      </p>
      <h2 style={{ color: '#fff', fontSize: '3.2rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '3rem', lineHeight: 1.1 }}>
        一键导出，<br />立即可用
      </h2>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {cards.map((card, i) => {
          const delay = i * 18 + 12;
          const p = spring({ frame: localFrame - delay, fps, config: { damping: 16, stiffness: 160 } });
          if (localFrame < delay) return null;

          return (
            <div key={i} style={{
              width: '260px',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '20px',
              padding: '2.2rem',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
            }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '1.2rem', color: '#fff' }}>{card.icon}</div>
              <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.4rem' }}>{card.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {localFrame > 55 && (
        <div style={{
          marginTop: '3rem',
          opacity: spring({ frame: localFrame - 55, fps, config: { damping: 20 } }),
          color: 'rgba(255,255,255,0.6)',
          fontSize: '1.1rem',
          letterSpacing: '0.08em',
        }}>
          支持 .pptx · .docx 格式导出
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Root composition ──────────────────────────────────────────────────────────
export const TutorialVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalScenes = 3;
  const flip1Start = SCENE_DURATION - TRANSITION;   // ~70
  const flip2Start = SCENE_DURATION * 2 - TRANSITION; // ~160

  // flip progress 0→1
  const flip1 = useFlipProgress(frame, fps, flip1Start);
  const flip2 = useFlipProgress(frame, fps, flip2Start);

  // which scenes are visible
  const showScene1 = frame < flip1Start + TRANSITION;
  const showScene2 = frame >= flip1Start && frame < flip2Start + TRANSITION;
  const showScene3 = frame >= flip2Start;

  // rotateY for each scene
  const rot1 = interpolate(flip1, [0, 1], [0, -90], { easing: Easing.inOut(Easing.quad) });
  const rot2in = interpolate(flip1, [0, 1], [90, 0], { easing: Easing.inOut(Easing.quad) });
  const rot2out = interpolate(flip2, [0, 1], [0, -90], { easing: Easing.inOut(Easing.quad) });
  const rot3 = interpolate(flip2, [0, 1], [90, 0], { easing: Easing.inOut(Easing.quad) });

  const sceneStyle = (rotY: number, visible: boolean): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    transform: `perspective(1800px) rotateY(${rotY}deg)`,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
  });

  return (
    <AbsoluteFill style={{ background: '#000', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      {/* Rainbow band background */}
      <RainbowBand frame={frame} />

      {/* Subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Scene 1 */}
      {showScene1 && (
        <div style={sceneStyle(rot1, showScene1)}>
          <SceneChat frame={frame} fps={fps} />
        </div>
      )}

      {/* Scene 2 */}
      {showScene2 && (
        <div style={sceneStyle(frame < flip2Start ? rot2in : rot2out, showScene2)}>
          <SceneGenerate frame={frame} fps={fps} />
        </div>
      )}

      {/* Scene 3 */}
      {showScene3 && (
        <div style={sceneStyle(rot3, showScene3)}>
          <SceneExport frame={frame} fps={fps} />
        </div>
      )}

      {/* Step indicator dots */}
      <div style={{
        position: 'absolute', bottom: '6%', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '10px',
      }}>
        {[0, 1, 2].map(i => {
          const active = (i === 0 && frame < flip1Start + TRANSITION / 2)
            || (i === 1 && frame >= flip1Start && frame < flip2Start + TRANSITION / 2)
            || (i === 2 && frame >= flip2Start);
          return (
            <div key={i} style={{
              width: active ? '28px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: active ? '#fff' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.4s',
            }} />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
