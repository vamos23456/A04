import { PptSlide, InstructionSet } from '../types';
import { getApiUrl, API_CONFIG } from '../config/api';

export interface LessonPlan {
  title: string;
  objectives: string[];
  process: {
    stage: string;
    duration: string;
    activities: string[];
    knowledgePoints?: string[];  // 该阶段具体知识点内容（来自知识库）
  }[];
  methods: string[];
  classActivities?: string[];   // 课堂活动设计
  homework: string[];
}

export interface Courseware {
  slides: PptSlide[];
  word: LessonPlan;
  interactive?: string;
  instructionSet?: InstructionSet;
}

export type GenerationTarget = 'ppt' | 'docx' | 'both';

export type KimiUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type CompletionResult<T> = {
  data: T;
  usage?: KimiUsage;
};

export type GenerationUsageSummary = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_count: number;
};

function emptyUsageSummary(): GenerationUsageSummary {
  return {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    request_count: 0,
  };
}

function mergeUsageSummary(
  current: GenerationUsageSummary,
  usage?: KimiUsage,
): GenerationUsageSummary {
  if (!usage) {
    return current;
  }

  const promptTokens = Math.max(0, usage.prompt_tokens ?? 0);
  const completionTokens = Math.max(0, usage.completion_tokens ?? 0);
  const totalTokens = Math.max(0, usage.total_tokens ?? promptTokens + completionTokens);

  if (promptTokens === 0 && completionTokens === 0 && totalTokens === 0) {
    return current;
  }

  return {
    prompt_tokens: current.prompt_tokens + promptTokens,
    completion_tokens: current.completion_tokens + completionTokens,
    total_tokens: current.total_tokens + totalTokens,
    request_count: current.request_count + 1,
  };
}

// RAG 检索函数
async function searchKnowledge(query: string, topK: number = 5): Promise<string[]> {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    // 如果用户已登录，添加 Authorization header 以搜索用户知识库
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_SEARCH), {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, top_k: topK })
    });

    if (!response.ok) {
      console.warn('RAG 检索失败，继续使用原始 prompt');
      return [];
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.warn('RAG 检索出错，继续使用原始 prompt:', error);
    return [];
  }
}

function callLLM(messages: any[], apiKey: string, baseUrl: string, model: string, jsonMode = true) {
  return fetch(`/api-proxy/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Authorization header 由 Vite proxy 自动添加，不在前端代码中暴露 API key
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 8192,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
}

async function requestJSONCompletion(
  messages: any[],
  apiKey: string,
  baseUrl: string,
  model: string,
  stageLabel: string,
): Promise<CompletionResult<any>> {
  const firstResponse = await callLLM(messages, apiKey, baseUrl, model, true);
  if (firstResponse.ok) {
    const data = await firstResponse.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { data: parseJSON(text), usage: data.usage };
  }

  const firstErr = await firstResponse.json().catch(() => ({}));
  const firstMessage = firstErr?.error?.message || `${stageLabel}：${firstResponse.status}`;

  // Some OpenAI-compatible Gemini proxies intermittently fail on response_format=json_object.
  // Fall back to plain text JSON generation before surfacing the error.
  const fallbackMessages = [...messages];
  const lastMessage = fallbackMessages.at(-1);
  if (lastMessage) {
    lastMessage.content =
      typeof lastMessage.content === 'string'
        ? `${lastMessage.content}\n\n请直接返回合法 JSON，不要使用 markdown 代码块。`
        : lastMessage.content;
  }

  const secondResponse = await callLLM(fallbackMessages, apiKey, baseUrl, model, false);
  if (secondResponse.ok) {
    const data = await secondResponse.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { data: parseJSON(text), usage: data.usage };
  }

  const secondErr = await secondResponse.json().catch(() => ({}));
  throw new Error(secondErr?.error?.message || firstMessage || `${stageLabel}：${secondResponse.status}`);
}

function parseJSON(text: string): any {
  if (text.includes('```json')) {
    text = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    text = text.split('```')[1].split('```')[0].trim();
  }
  return JSON.parse(text || '{}');
}

// ─── 第一阶段：生成指令集 ────────────────────────────────────────────────────
async function generateInstructionSet(
  prompt: string,
  knowledgeChunks: string[],
  files: { mimeType: string, data: string }[],
  apiKey: string,
  baseUrl: string,
  model: string,
): Promise<CompletionResult<InstructionSet>> {

  const knowledgeContext = knowledgeChunks.length > 0
    ? knowledgeChunks.map((c, i) => `【知识点${i + 1}】\n${c}`).join('\n\n')
    : '';

  const systemPrompt = `你是一位资深教学设计专家。根据教师意图、参考资料和知识库内容，生成一份结构化的课件生成指令集（JSON格式）。

指令集要求：
1. 深度分析教师意图，提炼教学目标和重难点
2. 充分利用知识库中的具体知识点内容，将其融入教学过程指令
3. PPT指令需规划完整模块（封面、目录、内容页、总结页），内容图文并茂
4. 教案指令中每个教学阶段必须包含来自知识库的具体知识点内容

输出JSON结构：
{
  "subject": "学科名",
  "topic": "课题名称",
  "gradeLevel": "适用年级",
  "duration": "课时时长（如45分钟）",
  "teachingGoals": ["目标1", "目标2", "目标3"],
  "keyPoints": ["重点知识点1（知识库内容）", "重点知识点2", ...],
  "difficulties": ["难点1", "难点2"],
  "referenceContext": "参考资料中的关键信息摘要",
  "knowledgeContext": "知识库检索内容摘要",
  "pptInstructions": {
    "totalSlides": 12,
    "colorTheme": "推荐主题色（如蓝色系、绿色系）",
    "modules": [
      { "type": "cover", "title": "封面标题", "keyContent": ["副标题"], "suggestedLayout": "cover" },
      { "type": "toc", "title": "目录", "keyContent": ["章节1", "章节2", "章节3"], "suggestedLayout": "content" },
      { "type": "content", "title": "内容页标题", "keyContent": ["要点1", "要点2（来自知识库）", "要点3"], "suggestedLayout": "image-text" },
      { "type": "summary", "title": "总结", "keyContent": ["核心要点1", "核心要点2"], "suggestedLayout": "end" }
    ]
  },
  "lessonPlanInstructions": {
    "objectives": ["知识目标：...", "能力目标：...", "情感目标：..."],
    "processStages": [
      {
        "stage": "导入新课",
        "duration": "5分钟",
        "activities": ["活动描述"],
        "knowledgePoints": ["此阶段需讲解的具体知识点内容（直接从知识库提取）"]
      },
      {
        "stage": "新知讲授",
        "duration": "20分钟",
        "activities": ["讲解方法"],
        "knowledgePoints": ["详细的知识点内容1", "详细的知识点内容2"]
      },
      {
        "stage": "巩固练习",
        "duration": "10分钟",
        "activities": ["练习形式"],
        "knowledgePoints": ["对应的知识点"]
      },
      {
        "stage": "总结提升",
        "duration": "5分钟",
        "activities": ["总结方式"],
        "knowledgePoints": ["核心知识点总结"]
      },
      {
        "stage": "布置作业",
        "duration": "5分钟",
        "activities": ["作业说明"],
        "knowledgePoints": []
      }
    ],
    "classActivities": ["课堂活动1：具体描述", "课堂活动2：具体描述"],
    "homework": ["作业1", "作业2"]
  }
}

所有内容必须用中文，知识点内容要具体详实，直接引用知识库中的关键内容。`;

  const userContent: any[] = [
    { type: 'text', text: `教师教学意图：\n${prompt}${knowledgeContext ? `\n\n知识库参考内容：\n${knowledgeContext}` : ''}` }
  ];

  files.forEach(f => {
    if (f.mimeType.startsWith('image/')) {
      userContent.push({ type: 'image_url', image_url: { url: `data:${f.mimeType};base64,${f.data}` } });
    }
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent.length === 1 ? userContent[0].text : userContent },
  ];

  return (await requestJSONCompletion(messages, apiKey, baseUrl, model, '指令集生成失败')) as CompletionResult<InstructionSet>;
}

// ─── 第二阶段：基于指令集生成PPT和教案 ──────────────────────────────────────
async function generateFromInstructionSet(
  instructionSet: InstructionSet,
  history: any[],
  apiKey: string,
  baseUrl: string,
  model: string,
  target: GenerationTarget = 'both',
): Promise<CompletionResult<Partial<Courseware>>> {
  const targetPrompt =
    target === 'ppt'
      ? `你是一位世界级教学材料设计师。请严格基于以下课件生成指令集，只生成高质量的PPT课件（JSON格式）。

【指令集】
${JSON.stringify(instructionSet, null, 2)}

生成要求：
1. 必须包含封面（cover）、目录页（content）、各内容页（content/image-text/two-col）、总结页（end）
2. 内容页要图文并茂，充分利用 image-text 和 two-col 布局
3. 每张内容页的正文要具体，直接引用指令集中的知识点内容
4. 幻灯片数量按指令集中 totalSlides 生成（至少12张）
5. 逻辑层次清晰：封面→目录→各章节内容→总结

输出JSON结构：
{
  "slides": [
    { "layout": "cover", "title": "课题标题", "subtitle": "副标题或年级信息", "accent": "hex色值（不含#）" },
    { "layout": "content", "title": "目录", "body": ["一、...", "二、...", "三、..."], "accent": "同上" },
    { "layout": "image-text", "title": "内容页标题", "body": ["要点1", "要点2"], "imageKeyword": "English keyword", "accent": "同上" },
    { "layout": "end", "title": "课堂小结", "subtitle": "核心收获", "accent": "同上" }
  ]
}

所有文字内容必须是中文，imageKeyword 必须是英文。`
      : target === 'docx'
        ? `你是一位世界级教学材料设计师。请严格基于以下课件生成指令集，只生成高质量的教案（JSON格式）。

【指令集】
${JSON.stringify(instructionSet, null, 2)}

生成要求：
1. 教学过程的每个阶段必须包含 knowledgePoints 字段
2. knowledgePoints 要包含来自知识库的具体知识点内容，不能是空的占位符
3. 课堂活动设计（classActivities）要贴合实际教学场景，具有可操作性
4. 教学目标要三维（知识、能力、情感）

输出JSON结构：
{
  "word": {
    "title": "教案标题",
    "objectives": ["知识目标：...", "能力目标：...", "情感目标：..."],
    "process": [
      {
        "stage": "导入新课",
        "duration": "5分钟",
        "activities": ["活动描述"],
        "knowledgePoints": ["具体知识点内容"]
      }
    ],
    "methods": ["讲授法", "讨论法", "..."],
    "classActivities": ["课堂活动1：具体描述", "课堂活动2：具体描述"],
    "homework": ["作业1", "作业2"]
  },
  "interactive": "趣味课堂互动游戏创意（中文）"
}

所有文字内容必须是中文。`
        : `你是一位世界级教学材料设计师。请严格基于以下课件生成指令集，生成高质量的PPT课件和配套教案（JSON格式）。

【指令集】
${JSON.stringify(instructionSet, null, 2)}

生成要求：
1. PPT：
   - 必须包含封面（cover）、目录页（content）、各内容页（content/image-text/two-col）、总结页（end）
   - 内容页要图文并茂，充分利用 image-text 和 two-col 布局
   - 每张内容页的正文要具体，直接引用指令集中的知识点内容
   - 幻灯片数量按指令集中 totalSlides 生成（至少12张）
   - 逻辑层次清晰：封面→目录→各章节内容→总结

2. 教案（word）：
   - 教学过程的每个阶段必须包含 knowledgePoints 字段
   - knowledgePoints 要包含来自知识库的具体知识点内容，不能是空的占位符
   - 课堂活动设计（classActivities）要贴合实际教学场景，具有可操作性
   - 教学目标要三维（知识、能力、情感）

输出JSON结构：
{
  "slides": [
    { "layout": "cover", "title": "课题标题", "subtitle": "副标题或年级信息", "accent": "hex色值（不含#）" },
    { "layout": "content", "title": "目录", "body": ["一、...", "二、...", "三、..."], "accent": "同上" },
    { "layout": "image-text", "title": "内容页标题", "body": ["要点1", "要点2"], "imageKeyword": "English keyword", "accent": "同上" },
    ...更多内容页...,
    { "layout": "end", "title": "课堂小结", "subtitle": "核心收获", "accent": "同上" }
  ],
  "word": {
    "title": "教案标题",
    "objectives": ["知识目标：...", "能力目标：...", "情感目标：..."],
    "process": [
      {
        "stage": "导入新课",
        "duration": "5分钟",
        "activities": ["活动描述"],
        "knowledgePoints": ["具体知识点内容"]
      }
    ],
    "methods": ["讲授法", "讨论法", "..."],
    "classActivities": ["课堂活动1：具体描述", "课堂活动2：具体描述"],
    "homework": ["作业1", "作业2"]
  },
  "interactive": "趣味课堂互动游戏创意（中文）"
}

所有文字内容必须是中文，imageKeyword 必须是英文。`;

  const messages: any[] = [
    { role: 'system', content: targetPrompt },
    ...history.map((h: any) => ({
      role: h.role === 'model' ? 'assistant' : h.role,
      content: h.parts?.[0]?.text || h.content || '',
    })),
    {
      role: 'user',
      content:
        target === 'ppt'
          ? '请基于指令集生成完整的 PPT 课件。'
          : target === 'docx'
            ? '请基于指令集生成完整的教案。'
            : '请基于指令集生成完整的PPT课件和教案。'
    },
  ];

  return await requestJSONCompletion(messages, apiKey, baseUrl, model, '课件生成失败');
}

// ─── 主函数：两阶段生成 ────────────────────────────────────────────────────────
export async function generateCourseware(
  prompt: string,
  history: any[] = [],
  files: { mimeType: string, data: string }[] = []
): Promise<Courseware & { usageSummary: GenerationUsageSummary }> {
  const apiKey = process.env.OPENAI_COMPAT_API_KEY || '';
  const baseUrl = process.env.OPENAI_COMPAT_BASE_URL || 'https://api.moonshot.ai/v1';
  const model = process.env.OPENAI_COMPAT_MODEL || 'kimi-k2.5';

  // 🔍 RAG 检索：增加检索数量以获取更丰富的知识点
  const knowledgeChunks = await searchKnowledge(prompt, 5);

  // 第一阶段：融合信息，生成结构化指令集
  const instructionResult = await generateInstructionSet(
    prompt,
    knowledgeChunks,
    files,
    apiKey,
    baseUrl,
    model,
  );

  // 第二阶段：基于指令集生成PPT和教案
  const coursewareResult = await generateFromInstructionSet(
    instructionResult.data,
    history,
    apiKey,
    baseUrl,
    model,
    'both',
  );

  return {
    ...(coursewareResult.data as Courseware),
    instructionSet: instructionResult.data,
    usageSummary: mergeUsageSummary(
      mergeUsageSummary(emptyUsageSummary(), instructionResult.usage),
      coursewareResult.usage,
    ),
  };
}

export async function generateCoursewareAsset(
  prompt: string,
  target: Exclude<GenerationTarget, 'both'>,
  history: any[] = [],
  files: { mimeType: string, data: string }[] = [],
  existingInstructionSet?: InstructionSet,
): Promise<Partial<Courseware> & { instructionSet: InstructionSet; usageSummary: GenerationUsageSummary }> {
  const apiKey = process.env.OPENAI_COMPAT_API_KEY || '';
  const baseUrl = process.env.OPENAI_COMPAT_BASE_URL || 'https://api.moonshot.ai/v1';
  const model = process.env.OPENAI_COMPAT_MODEL || 'kimi-k2.5';

  let usageSummary = emptyUsageSummary();

  const instructionResult = existingInstructionSet
    ? { data: existingInstructionSet }
    : await generateInstructionSet(
        prompt,
        await searchKnowledge(prompt, 5),
        files,
        apiKey,
        baseUrl,
        model,
      );

  usageSummary = mergeUsageSummary(usageSummary, instructionResult.usage);

  const result = await generateFromInstructionSet(
    instructionResult.data,
    history,
    apiKey,
    baseUrl,
    model,
    target,
  );

  usageSummary = mergeUsageSummary(usageSummary, result.usage);

  return { ...result.data, instructionSet: instructionResult.data, usageSummary };
}
