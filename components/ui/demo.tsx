import { CapabilitiesSection } from "@/components/ui/capabilities-section"
import { Header } from "@/components/ui/header"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { ProcessCards } from "@/components/ui/process-cards"
import { PPTShowcase } from "@/components/ui/ppt-showcase"
import { TutorialSection } from "@/components/ui/tutorial-section"
import { WebGLShader } from "@/components/ui/web-gl-shader"

type DemoOneProps = {
  brandName?: string
  isLight?: boolean
  onToggleTheme?: () => void
  onEnter?: () => void
  onLogin?: () => void
}

function FlipLine({ text }: { text: string }) {
  return (
    <span className="block">
      {text.split("").map((char, index) => (
        <span
          key={`${text}-${index}`}
          className="inline-block opacity-0 [transform-origin:bottom_center] [transform:rotateX(-90deg)_translateY(24px)] [animation:hero-flip-up_0.78s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]"
          style={{ animationDelay: `${index * 0.055}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  )
}

export default function DemoOne({
  brandName = "TDesign.ai",
  isLight = false,
  onToggleTheme,
  onEnter,
  onLogin,
}: DemoOneProps) {
  const lightPanelClass = "relative mx-auto w-full max-w-3xl bg-transparent"

  return (
    <div
      className={
        isLight
          ? "relative w-full overflow-x-hidden bg-[#ffffff]"
          : "relative w-full overflow-x-hidden bg-black"
      }
    >
      <WebGLShader className={isLight ? "pointer-events-none opacity-45" : "opacity-100"} isLight={isLight} />

      {isLight && <div className="pointer-events-none absolute inset-0 bg-white/30" />}

      <div
        className={
          isLight
            ? "pointer-events-none absolute inset-0 bg-transparent"
            : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.6))]"
        }
      />

      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-3">
        <Header isLight={isLight} onToggleTheme={onToggleTheme} onLogin={onLogin} onStart={onEnter} />
      </div>

      <section className="relative z-10 flex min-h-screen w-full items-center px-4 py-24 pt-36 md:pt-40">
        <div className="mx-auto w-full">
          <div
            className={
              isLight
                ? lightPanelClass
                : "relative mx-auto w-full max-w-3xl p-2"
            }
          >
            <main
              className={
                isLight
                  ? "relative overflow-hidden rounded-[32px] py-10"
                  : "relative overflow-hidden py-10"
              }
            >
              {!isLight && (
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.07),transparent_28%)]" />
              )}

              <div className="relative px-4">
                <h1
                  className={
                    isLight
                      ? "mb-3 text-center text-6xl font-extrabold tracking-tighter text-black [perspective:800px] md:text-[clamp(2rem,8vw,7rem)]"
                      : "mb-3 text-center text-6xl font-extrabold tracking-tighter text-white [perspective:800px] md:text-[clamp(2rem,8vw,7rem)]"
                  }
                >
                  <FlipLine text="Teaching" />
                  <FlipLine text="Design" />
                </h1>
                <p
                  className={
                    isLight
                      ? "px-6 text-center text-xs text-black/65 md:text-sm lg:text-lg"
                      : "px-6 text-center text-xs text-white/60 md:text-sm lg:text-lg"
                  }
                >
                  {brandName} 面向教师与教学团队，帮助你快速完成教案梳理、课件生成、课堂活动设计与内容导出。
                </p>

                <div className="my-8 flex items-center justify-center gap-1">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <p className="text-xs text-green-500">智能备课与课件生成已就绪</p>
                </div>

                <div className="flex justify-center">
                  <LiquidButton
                    className={
                      isLight
                        ? "h-12 rounded-full border border-black bg-transparent px-8 text-black shadow-none"
                        : "h-13 rounded-full border border-white px-9 text-white shadow-none"
                    }
                    isLight={isLight}
                    size="xl"
                    onClick={onEnter}
                  >
                    开始生成课程
                  </LiquidButton>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

        <TutorialSection isLight={isLight} />
      <ProcessCards isLight={isLight} />
      <PPTShowcase isLight={isLight} />

      <CapabilitiesSection isLight={isLight} />

      <style>{`
        @keyframes hero-flip-up {
          0% {
            opacity: 0;
            transform: rotateX(-90deg) translateY(40px);
          }
          100% {
            opacity: 1;
            transform: rotateX(0deg) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
