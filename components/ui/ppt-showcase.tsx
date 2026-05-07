"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import show1 from "@/headPNG/show1.png"
import show2 from "@/headPNG/show2.png"
import show3 from "@/headPNG/show3.png"
import show4 from "@/headPNG/show4.png"
import { cn } from "@/lib/utils"

type PPTShowcaseProps = {
  isLight?: boolean
}

const slides = [
  {
    image: show1,
    label: "Physics",
    titleTop: "探究浮力",
    titleBottom: "阿基米德原理",
    description: "围绕实验现象、核心概念和课堂探究过程组织页面，方便教师直接用于物理讲解。",
  },
  {
    image: show2,
    label: "Computer",
    titleTop: "计算机",
    titleBottom: "网络",
    description: "把网络基础知识、关键概念和课堂重点拆成更清晰的教学页面，适合分步展开。",
  },
  {
    image: show3,
    label: "Chinese",
    titleTop: "走近",
    titleBottom: "李白",
    description: "适合语文课堂的人物主题课件，兼顾背景介绍、作品理解和审美引导。",
  },
  {
    image: show4,
    label: "Math",
    titleTop: "理解",
    titleBottom: "二次函数",
    description: "用更直观的版面呈现图像、性质与题型讲解，帮助教师快速搭建数学课堂内容。",
  },
] as const

export function PPTShowcase({ isLight = false }: PPTShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null)

  const currentSlide = slides[currentIndex]
  const slideCountText = useMemo(
    () => `${String(currentIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`,
    [currentIndex]
  )

  const goPrev = () => setCurrentIndex((value) => (value - 1 + slides.length) % slides.length)
  const goNext = () => setCurrentIndex((value) => (value + 1) % slides.length)

  const contentTransition = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const }
  const imageTransition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

  useEffect(() => {
    slides.forEach((slide) => {
      const image = new Image()
      image.src = slide.image
    })
  }, [])

  return (
    <section
      id="showcase"
      className={cn(
        "relative z-10 w-full px-4 pb-28 md:px-6 md:pb-36",
        isLight ? "text-black" : "text-white"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <p
            className={cn(
              "mb-3 text-xs font-semibold uppercase tracking-[0.32em]",
              isLight ? "text-black/45" : "text-white/45"
            )}
          >
            课件展览
          </p>
          <h2 className={cn("text-3xl font-semibold tracking-tight md:text-5xl", isLight ? "text-black" : "text-white")}>
            教师只要说清需求
            <span className="block">系统就能把结果整理成可展示的课件页面</span>
          </h2>
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl text-sm leading-7 md:text-base",
              isLight ? "text-black/60" : "text-white/60"
            )}
          >
            从封面、目录到课堂内容与教学活动，生成结果会以完整课件的形式展开，方便教师快速预览、筛选和继续调整。
          </p>
        </div>

        <div
          className="group relative flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-12 md:pl-10 md:pr-6 lg:gap-16 lg:pl-12 lg:pr-8"
          onMouseLeave={() => setHoverSide(null)}
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStartX == null) return
            const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX
            const delta = touchEndX - touchStartX
            if (delta > 40) goPrev()
            if (delta < -40) goNext()
            setTouchStartX(null)
          }}
        >
          <div
            className="absolute inset-y-0 left-0 z-10 hidden w-24 md:block"
            onMouseEnter={() => setHoverSide("left")}
          />
          <div
            className="absolute inset-y-0 right-0 z-10 hidden w-24 md:block"
            onMouseEnter={() => setHoverSide("right")}
          />
          <button
            type="button"
            onClick={goPrev}
            className={cn(
              "absolute left-0 top-[58%] z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 md:flex",
              hoverSide === "left" ? "-translate-x-1 opacity-100" : "-translate-x-5 opacity-0",
              isLight
                ? "bg-white/86 text-black shadow-[0_14px_30px_rgba(0,0,0,0.1)] hover:bg-white"
                : "bg-black/55 text-white shadow-[0_14px_30px_rgba(0,0,0,0.35)] hover:bg-black/70"
            )}
            aria-label="上一张课件"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className={cn(
              "absolute right-2 top-[58%] z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 md:flex",
              hoverSide === "right" ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
              isLight
                ? "bg-white/86 text-black shadow-[0_14px_30px_rgba(0,0,0,0.1)] hover:bg-white"
                : "bg-black/55 text-white shadow-[0_14px_30px_rgba(0,0,0,0.35)] hover:bg-black/70"
            )}
            aria-label="下一张课件"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="relative z-10 flex w-full max-w-[320px] shrink-0 flex-col items-center text-center md:w-[240px] md:items-start md:text-left lg:w-[280px] lg:pt-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`copy-${currentIndex}`}
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={contentTransition}
              >
                <motion.div
                  className="mb-6 flex items-center justify-center gap-3 md:mb-8 md:justify-start md:gap-4"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={contentTransition}
                >
                  <motion.div
                    className={cn("h-px", isLight ? "bg-black" : "bg-white")}
                    initial={{ width: 22, opacity: 0.6 }}
                    animate={{ width: 40, opacity: 1 }}
                    exit={{ width: 22, opacity: 0.4 }}
                    transition={contentTransition}
                  />
                  <motion.span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-[0.28em] md:text-xs",
                      isLight ? "text-black/70" : "text-white/70"
                    )}
                    initial={{ opacity: 0, letterSpacing: "0.18em" }}
                    animate={{ opacity: 1, letterSpacing: "0.28em" }}
                    exit={{ opacity: 0, letterSpacing: "0.18em" }}
                    transition={contentTransition}
                  >
                    {currentSlide.label}
                  </motion.span>
                </motion.div>

                <h2 className="relative">
                  <motion.span
                    className={cn("block text-4xl font-normal tracking-tight sm:text-5xl md:text-5xl lg:text-6xl", isLight ? "text-black" : "text-white")}
                    initial={{ opacity: 0, y: "45%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "-45%" }}
                    transition={contentTransition}
                  >
                    {currentSlide.titleTop}
                  </motion.span>
                  <motion.span
                    className={cn("block text-4xl font-normal tracking-tight sm:text-5xl md:text-5xl lg:text-6xl", isLight ? "text-black" : "text-white")}
                    initial={{ opacity: 0, y: "45%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "-45%" }}
                    transition={contentTransition}
                  >
                    {currentSlide.titleBottom}
                  </motion.span>
                </h2>

                <motion.p
                  className={cn("mt-6 max-w-[260px] text-sm leading-relaxed md:mt-8 md:max-w-[220px] md:text-base lg:mt-10 lg:max-w-[240px]", isLight ? "text-black/58" : "text-white/58")}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={contentTransition}
                >
                  {currentSlide.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-3 md:mt-8 lg:mt-10">
              <span className={cn("ml-2 text-xs font-medium tracking-[0.24em]", isLight ? "text-black/45" : "text-white/45")}>
                {slideCountText}
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-[720px] transition-all duration-700">
            <div className="relative h-[260px] w-full overflow-hidden rounded-[24px] sm:h-[320px] md:h-[380px] lg:h-[440px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={currentSlide.image}
                  src={currentSlide.image}
                  alt={`${currentSlide.titleTop}${currentSlide.titleBottom}课件展示`}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={imageTransition}
                  loading="eager"
                  decoding="async"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
