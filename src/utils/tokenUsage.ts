export type LlmUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type TokenUsageDay = {
  date: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
};

export type TokenUsageSnapshot = {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  lastUpdatedAt?: number;
  daily: TokenUsageDay[];
};

const TOKEN_USAGE_STORAGE_PREFIX = 'teaching-studio-token-usage';
const MAX_DAILY_POINTS = 90;

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createEmptySnapshot(): TokenUsageSnapshot {
  return {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    requestCount: 0,
    daily: [],
  };
}

function sanitizeUsage(usage?: LlmUsage | null) {
  return {
    promptTokens: Math.max(0, usage?.prompt_tokens ?? 0),
    completionTokens: Math.max(0, usage?.completion_tokens ?? 0),
    totalTokens: Math.max(
      0,
      usage?.total_tokens ?? (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0),
    ),
  };
}

function getStorageKey(userKey: string) {
  return `${TOKEN_USAGE_STORAGE_PREFIX}:${userKey}`;
}

export function resolveTokenUsageUserKey(username?: string | null) {
  const normalized = username?.trim();
  if (normalized) {
    return normalized;
  }

  if (typeof window !== 'undefined') {
    const localUsername = window.localStorage.getItem('username')?.trim();
    if (localUsername) {
      return localUsername;
    }
  }

  return 'guest';
}

export function readTokenUsageSnapshot(userKey: string): TokenUsageSnapshot {
  if (typeof window === 'undefined') {
    return createEmptySnapshot();
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userKey));
    if (!raw) {
      return createEmptySnapshot();
    }

    const parsed = JSON.parse(raw) as Partial<TokenUsageSnapshot>;
    return {
      totalTokens: Math.max(0, parsed.totalTokens ?? 0),
      promptTokens: Math.max(0, parsed.promptTokens ?? 0),
      completionTokens: Math.max(0, parsed.completionTokens ?? 0),
      requestCount: Math.max(0, parsed.requestCount ?? 0),
      lastUpdatedAt: parsed.lastUpdatedAt,
      daily: Array.isArray(parsed.daily)
        ? parsed.daily
            .filter((item): item is TokenUsageDay => Boolean(item?.date))
            .slice(-MAX_DAILY_POINTS)
        : [],
    };
  } catch (error) {
    console.warn('读取 token 统计失败，已回退为空统计:', error);
    return createEmptySnapshot();
  }
}

export function recordTokenUsage(userKey: string, usage?: LlmUsage | null): TokenUsageSnapshot {
  const sanitized = sanitizeUsage(usage);
  const hasUsage = sanitized.totalTokens > 0 || sanitized.promptTokens > 0 || sanitized.completionTokens > 0;
  const currentSnapshot = readTokenUsageSnapshot(userKey);

  if (!hasUsage) {
    return currentSnapshot;
  }

  const todayKey = getTodayKey();
  const existingDay = currentSnapshot.daily.find((item) => item.date === todayKey);
  const nextDay: TokenUsageDay = existingDay
    ? {
        ...existingDay,
        totalTokens: existingDay.totalTokens + sanitized.totalTokens,
        promptTokens: existingDay.promptTokens + sanitized.promptTokens,
        completionTokens: existingDay.completionTokens + sanitized.completionTokens,
        requestCount: existingDay.requestCount + 1,
      }
    : {
        date: todayKey,
        totalTokens: sanitized.totalTokens,
        promptTokens: sanitized.promptTokens,
        completionTokens: sanitized.completionTokens,
        requestCount: 1,
      };

  const nextSnapshot: TokenUsageSnapshot = {
    totalTokens: currentSnapshot.totalTokens + sanitized.totalTokens,
    promptTokens: currentSnapshot.promptTokens + sanitized.promptTokens,
    completionTokens: currentSnapshot.completionTokens + sanitized.completionTokens,
    requestCount: currentSnapshot.requestCount + 1,
    lastUpdatedAt: Date.now(),
    daily: [...currentSnapshot.daily.filter((item) => item.date !== todayKey), nextDay]
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-MAX_DAILY_POINTS),
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getStorageKey(userKey), JSON.stringify(nextSnapshot));
  }

  return nextSnapshot;
}
