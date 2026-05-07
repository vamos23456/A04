"use client"

import { useEffect, useState } from "react"
import { Database, FileText, MessageSquareText, Plus, Sparkles, Zap, Presentation } from "lucide-react"

import { cn } from "@/lib/utils"

type ProcessCardsProps = {
  isLight?: boolean
}

type ProcessCard = {
  step: string
  title: string
  subtitle: string
  status: string
  bgClass: string
  accentClass: string
  panelTone: string
  preview: {
    mode: "chat" | "intent" | "search" | "result"
    lines: string[]
  }
}

const processCards: ProcessCard[] = [
  {
    step: "Step 1",
    title: "教师提出需求",
    subtitle: "像对话一样直接说课堂目标",
    status: "已接收",
    bgClass: "bg-[#9cb89a]",
    accentClass: "bg-[#516b52]",
    panelTone: "bg-[#f5f2ea]/78",
    preview: {
      mode: "chat",
      lines: [
        "您好，你的教学偏好是怎么样的？",
        "我想做高一语文课件",
        "需要同步生成配套教案",
      ],
    },
  },
  {
    step: "Step 2",
    title: "AI理解意图",
    subtitle: "自动拆成可执行教学指令",
    status: "解析中",
    bgClass: "bg-[#8ca6ba]",
    accentClass: "bg-[#415b6f]",
    panelTone: "bg-[#edf2f6]/78",
    preview: {
      mode: "intent",
      lines: [
        "学段：高中",
        "输出：PPT + 教案",
        "重点：意象、情感、结构",
      ],
    },
  },
  {
    step: "Step 3",
    title: "检索本地知识库",
    subtitle: "匹配课件素材与教案内容",
    status: "检索中",
    bgClass: "bg-[#9d94b8]",
    accentClass: "bg-[#544d72]",
    panelTone: "bg-[#f3eff9]/78",
    preview: {
      mode: "search",
      lines: [
        "教材解析.pdf",
        "名师教案.docx",
        "课堂活动模板.pptx",
      ],
    },
  },
  {
    step: "Step 4",
    title: "生成PPT与教案",
    subtitle: "输出可直接修改与导出的结果",
    status: "已生成",
    bgClass: "bg-[#c3ab88]",
    accentClass: "bg-[#736044]",
    panelTone: "bg-[#f7f1e8]/80",
    preview: {
      mode: "result",
      lines: [
        "12页教学PPT",
        "1份课堂教案",
        "导出 / 继续修改",
      ],
    },
  },
]

function CardPreview({ card }: { card: ProcessCard }) {
  if (card.preview.mode === "chat") {
    return (
      <div className="space-y-3 overflow-hidden">
        <div className="rounded-[22px] bg-white/44 px-4 py-4 text-sm leading-6 text-black/82">
          {card.preview.lines[0]}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="rounded-full border border-black/12 bg-white/18 px-3 py-2 text-xs text-black/82 backdrop-blur-sm">
            {card.preview.lines[1]}
          </span>
          <span className="rounded-full border border-black/12 bg-white/18 px-3 py-2 text-xs text-black/82 backdrop-blur-sm">
            {card.preview.lines[2]}
          </span>
        </div>
      </div>
    )
  }

  if (card.preview.mode === "intent") {
    return (
      <div className="space-y-2 overflow-hidden">
        <div className="rounded-[22px] bg-white/40 px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-white/44 px-3 py-1.5 text-sm text-black/62">教学工作流</span>
            <span className="text-sm text-[#00a63e]">Running</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col items-center">
              <div className="flex size-12 items-center justify-center rounded-[16px] bg-[#3b82f6] text-white shadow-[0_10px_24px_rgba(59,130,246,0.25)]">
                <Zap className="size-5" />
              </div>
              <div className="mt-1.5 text-[11px] text-black/72">需求</div>
            </div>
            <div className="relative h-[2px] flex-1 bg-white/62">
              <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#c7b0eb] shadow-[0_0_14px_rgba(199,176,235,0.9)]" />
            </div>
            <div className="flex flex-col items-center">
              <div className="relative flex size-12 items-center justify-center rounded-[16px] bg-[#a855f7] text-white shadow-[0_10px_24px_rgba(168,85,247,0.28)]">
                <Sparkles className="size-5" />
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-white/90 animate-pulse" />
                <span className="absolute left-2 top-2 size-1.5 rounded-full bg-white/80 animate-pulse" />
              </div>
              <div className="mt-1.5 text-[11px] text-black/72">AI 解析</div>
            </div>
            <div className="relative h-[2px] flex-1 bg-white/62">
              <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#c7b0eb] shadow-[0_0_14px_rgba(199,176,235,0.9)]" />
            </div>
            <div className="flex flex-col items-center">
              <div className="flex size-12 items-center justify-center rounded-[16px] bg-[#22c55e] text-white shadow-[0_10px_24px_rgba(34,197,94,0.24)]">
                <Plus className="size-5" />
              </div>
              <div className="mt-1.5 text-[11px] text-black/72">指令集</div>
            </div>
          </div>
          <div className="mt-2 border-t border-white/32 pt-2">
            <div className="flex items-center justify-between text-sm text-black/62">
              <span>最近一次</span>
              <span className="font-medium text-black/84">2 分钟前</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (card.preview.mode === "search") {
    return (
      <div className="flex min-h-[10.9rem] flex-col justify-between space-y-1 overflow-hidden">
        <div className="rounded-[20px] bg-white/40 px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between text-sm text-black/76">
            <span>本地知识库</span>
            <span>286 / 1,240</span>
          </div>
          <div className="h-2 rounded-full bg-white/36">
            <div className="h-full w-[23.06%] rounded-full bg-gradient-to-r from-[#6fcb7e] to-[#6b63a7]" />
          </div>
          <div className="mt-1.5 text-[11px] text-black/52">已检索 23.06% 的资源</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[18px] bg-white/34 px-4 py-2">
            <div className="text-xs text-black/46">知识库总量</div>
            <div className="mt-0.5 text-[1.3rem] font-semibold leading-none text-black/88">1,240</div>
            <div className="mt-0.5 text-[11px] text-black/52">本地资源</div>
          </div>
          <div className="rounded-[18px] bg-white/34 px-4 py-2">
            <div className="text-xs text-black/46">已检索数量</div>
            <div className="mt-0.5 text-[1.3rem] font-semibold leading-none text-black/88">286</div>
            <div className="mt-0.5 text-[11px] text-[#544d72]">当前命中</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 overflow-hidden">
      <div className="flex items-center gap-3 rounded-[18px] border border-black/16 bg-white/8 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-[#18c964] text-white">
          <Presentation className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-black/88">PPT</div>
          <div className="truncate text-xs text-black/58">已生成，可继续编辑</div>
        </div>
        <span className="shrink-0 rounded-full bg-white/72 px-2.5 py-1 text-xs text-black/58">PPT</span>
      </div>
      <div className="flex items-center gap-3 rounded-[18px] border border-black/16 bg-white/8 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-[#9b51ff] text-white">
          <FileText className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-black/88">Word</div>
          <div className="truncate text-xs text-black/58">教案内容已同步完成</div>
        </div>
        <span className="shrink-0 rounded-full bg-white/72 px-2.5 py-1 text-xs text-black/58">Word</span>
      </div>
    </div>
  )
}

export function ProcessCards({ isLight = false }: ProcessCardsProps) {
  const [currentCard, setCurrentCard] = useState(0)
  const [cycleTick, setCycleTick] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % processCards.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [cycleTick])

  const currentConfig = processCards[currentCard]
  return (
    <section
      id="features"
      className={cn(
        "relative z-10 w-full px-4 pb-24 pt-6 md:px-6 md:pb-32",
        isLight ? "text-black" : "text-white"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <p className={cn("mb-3 text-xs font-semibold uppercase tracking-[0.32em]", isLight ? "text-black/45" : "text-white/45")}>
            功能亮点
          </p>
          <h2 className={cn("text-3xl font-semibold tracking-tight md:text-5xl", isLight ? "text-black" : "text-white")}>
            教师只要说清需求
            <span className="block">系统就会顺着流程完成生成</span>
          </h2>
          <p className={cn("mx-auto mt-4 max-w-2xl text-sm leading-7 md:text-base", isLight ? "text-black/60" : "text-white/60")}>
            不是抽象流程图，而是把真实生成过程压缩成几张易懂的卡片，让教师一眼看明白系统在做什么。
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div className="relative mx-auto w-full max-w-3xl">
            <div className="pointer-events-none absolute inset-0 translate-x-3 translate-y-5 rotate-[4deg] scale-[0.96]">
              <div
                className={cn(
                  "h-[22rem] rounded-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.14)] transition-all duration-700",
                  currentCard === 1 ? "scale-[1.02] opacity-78" : "opacity-48",
                  isLight ? "bg-[#cdbda3]" : "bg-[#7f8f8f]"
                )}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 -translate-x-2 translate-y-3 rotate-[-3deg] scale-[0.98]">
              <div
                className={cn(
                  "h-[22rem] rounded-[32px] shadow-[0_20px_64px_rgba(0,0,0,0.16)] transition-all duration-700",
                  currentCard === 2 ? "scale-[1.02] opacity-82" : "opacity-54",
                  isLight ? "bg-[#b8b1c7]" : "bg-[#8a7f95]"
                )}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 translate-x-1 -translate-y-1 rotate-[1.5deg] scale-[0.99]">
              <div
                className={cn(
                  "h-[22rem] rounded-[32px] shadow-[0_18px_56px_rgba(0,0,0,0.16)] transition-all duration-700",
                  currentCard === 3 ? "scale-[1.02] opacity-86" : "opacity-60",
                  isLight ? "bg-[#b1c0ba]" : "bg-[#7e8f9c]"
                )}
              />
            </div>

            <div className={cn("relative z-10 h-[22rem] rounded-[32px] p-5 shadow-[0_32px_90px_rgba(0,0,0,0.18)] transition-all duration-700", currentConfig.bgClass)}>
              <div className={cn("flex h-full flex-col rounded-[26px] p-5 backdrop-blur-md", currentConfig.panelTone)}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-[#ee7b7b]" />
                    <span className="size-3 rounded-full bg-[#ebc970]" />
                    <span className="size-3 rounded-full bg-[#71bf7a]" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="mt-2">
                      <CardPreview card={currentConfig} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 h-2 rounded-full bg-white/34">
                      <div className={cn("h-full rounded-full transition-all duration-700", currentConfig.accentClass)} style={{ width: `${(currentCard + 1) * 25}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-black/58">
                      <span>当前状态</span>
                      <span>{currentConfig.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-20 mt-8 flex justify-center gap-2">
              {processCards.map((card, index) => (
                <button
                  key={card.step}
                  type="button"
                  onClick={() => {
                    setCurrentCard(index)
                    setCycleTick((value) => value + 1)
                  }}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    currentCard === index ? "w-8 bg-black/75" : cn("w-2.5", isLight ? "bg-black/25 hover:bg-black/40" : "bg-white/25 hover:bg-white/40")
                  )}
                  aria-label={`查看${card.title}`}
                  aria-pressed={currentCard === index}
                />
              ))}
            </div>
          </div>

          <div id="scenes" className="space-y-4">
            {processCards.map((card, index) => (
              <div
                key={card.step}
                className={cn(
                  "rounded-[24px] border px-5 py-4 transition-all duration-500",
                  currentCard === index
                    ? isLight
                      ? "border-black/12 bg-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
                      : "border-white/12 bg-white/8 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                    : isLight
                      ? "border-black/8 bg-white/36"
                      : "border-white/8 bg-white/4"
                )}
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7d95]">{card.step}</div>
                <div className={cn("text-lg font-semibold", isLight ? "text-black" : "text-white")}>{card.title}</div>
                <div className={cn("mt-1 text-sm", isLight ? "text-black/58" : "text-white/58")}>{card.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          id="about"
          className={cn(
            "mx-auto mt-14 max-w-4xl rounded-[28px] border px-6 py-6 text-center text-sm leading-7 md:px-10 md:text-base",
            isLight ? "border-black/8 bg-white/40 text-black/62" : "border-white/8 bg-white/5 text-white/60"
          )}
        >
          对话不是终点，而是开始。系统会把教师语言转成可执行指令，再遍历本地知识库，组合出更贴近课堂的演示文稿与配套教案。
        </div>
      </div>
    </section>
  )
}
