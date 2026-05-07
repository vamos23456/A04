import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookCopy,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  FileImage,
  FileText,
  FolderKanban,
  Globe2,
  HelpCircle,
  Loader2,
  Download,
  MessageSquarePlus,
  Mic,
  MicOff,
  Moon,
  Plus,
  Presentation,
  PanelLeft,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  WandSparkles
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo1 from '@/logo/logo1.png';
import ThermodynamicGrid from './ThermodynamicGrid';
import { API_CONFIG, getApiUrl } from '../config/api';
import { generateCoursewareAsset } from '../services/kimiService';
import { exportDocx, exportPptx } from '../services/exportService';
import type { Message, Project } from '../types';
import type { DeliverablePreviewPayload } from '../utils/deliverablePreview';
import {
  readTokenUsageSnapshot,
  recordTokenUsage,
  resolveTokenUsageUserKey,
  type TokenUsageSnapshot,
} from '../utils/tokenUsage';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

type StudioView = 'workshop' | 'knowledge' | 'assets' | 'profile';

type UploadedFile = {
  name: string;
  type: string;
  data: string;
};

type KnowledgeStats = {
  total_documents: number;
  public_documents: number;
  public_chunks: number;
  user_documents: number;
  user_chunks: number;
  collection_name: string;
};

type KnowledgeDocumentRecord = {
  id: number;
  title: string;
  source_name?: string | null;
  chunk_count: number;
  is_system: boolean;
  owner_scope: 'public' | 'private';
  created_at: string;
  updated_at: string;
};

type CurrentUserProfile = {
  username: string;
  email: string;
  created_at?: string;
};

type PersistedProjectRecord = {
  id: number;
  title: string;
  slides_json?: string | null;
  word_json?: string | null;
  interactive?: string | null;
  messages_json?: string | null;
  instruction_set_json?: string | null;
  created_at: string;
};

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  view?: StudioView;
  muted?: boolean;
};

const dashboardNavItems: NavItem[] = [
  { key: 'knowledge', label: '知识库', icon: BookOpen, view: 'knowledge' },
  { key: 'assets', label: '教学资源', icon: FolderKanban, view: 'assets' },
];

const dashboardActivities = [
  {
    title: '资料分析已完成',
    desc: '量子纠缠文档已同步最新教学切入点',
    time: '2 分钟前',
    tone: 'green'
  },
  {
    title: '演示文稿已导出',
    desc: '已生成“生物技术伦理”研讨会的幻灯片',
    time: '45 分钟前',
    tone: 'blue'
  }
] as const;

const PROJECT_STORAGE_KEY = 'teaching-studio-projects';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function NightGlowField({
  isLight = false,
  className,
  innerClassName,
  children
}: {
  isLight?: boolean;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  if (isLight) {
    return (
      <div className={cn('relative z-0', className)}>
        <div
          className={cn(
            'relative rounded-[inherit] border border-black/10 bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.12)]',
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('group relative z-0', className)}>
      <div className="pointer-events-none absolute -inset-[2px] -z-40 rounded-[inherit] bg-[radial-gradient(circle_at_14%_50%,rgba(207,48,170,0.34),transparent_32%),radial-gradient(circle_at_86%_50%,rgba(64,47,181,0.34),transparent_32%)] opacity-95 blur-md" />
      <div className="pointer-events-none absolute inset-0 -z-30 overflow-hidden rounded-[inherit] blur-[4px]">
        <div
          style={{ animation: 'studioBorderSpin 12s linear infinite' }}
          className="absolute left-1/2 top-1/2 h-[185%] w-[185%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(#000000_0%,#5b44ff_8%,#000000_24%,#000000_46%,#ff4fcf_58%,#000000_78%,#5b44ff_100%)] brightness-150 transition-transform duration-[2000ms]"
        />
      </div>
      <div className="pointer-events-none absolute inset-[1px] -z-20 overflow-hidden rounded-[inherit] blur-[2px]">
        <div
          style={{ animation: 'studioBorderSpinReverse 9s linear infinite' }}
          className="absolute left-1/2 top-1/2 h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2 rotate-[82deg] bg-[conic-gradient(rgba(0,0,0,0)_0%,#3023a8,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_46%,#9c237f,rgba(0,0,0,0)_58%,#3023a8_100%)] brightness-150 transition-transform duration-[2000ms]"
        />
      </div>
      <div className="pointer-events-none absolute inset-[2px] -z-10 overflow-hidden rounded-[inherit] blur-[0.5px]">
        <div
          style={{ animation: 'studioBorderSpin 7s linear infinite' }}
          className="absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 rotate-[68deg] bg-[conic-gradient(#161419_0%,#6d5dff_10%,#161419_22%,#161419_48%,#ff62d2_62%,#161419_72%,#6d5dff_100%)] brightness-150 transition-transform duration-[2000ms]"
        />
      </div>
      <div
        className={cn(
          'relative rounded-[inherit] border border-white/12 bg-[#050507]/92 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0_26px_rgba(97,74,255,0.16),0_0_18px_rgba(255,79,207,0.12),0_20px_25px_-5px_rgba(0,0,0,0.28)] backdrop-blur-2xl',
          innerClassName
        )}
      >
        {children}
      </div>
      <style>{`
        @keyframes studioBorderSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes studioBorderSpinReverse {
          from { transform: translate(-50%, -50%) rotate(82deg); }
          to { transform: translate(-50%, -50%) rotate(-278deg); }
        }
      `}</style>
    </div>
  );
}

function FilterMenu({
  valueLabel,
  options,
  value,
  onChange,
}: {
  valueLabel: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/16 px-4 py-3 text-left transition-colors',
          open ? 'bg-white/8 border-white/16' : 'hover:bg-white/6'
        )}
      >
        <p className="min-w-0 truncate text-sm text-white">{valueLabel}</p>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-white/46 transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-full overflow-hidden rounded-[18px] border border-white/10 bg-[#121214]/96 p-1 text-white shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'relative flex w-full items-center rounded-[12px] px-3 py-2.5 text-sm transition-colors',
                  selected ? 'bg-white/10 text-white' : 'text-white/72 hover:bg-white/6 hover:text-white'
                )}
              >
                <span className="pr-8">{option.label}</span>
                {selected ? <Check className="absolute right-3 h-4 w-4 text-white/78" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PageLogo() {
  return (
    <div className="pointer-events-none absolute left-4 top-0 z-30 flex items-center gap-3 lg:left-6">
      <img
        src={logo1}
        alt="TDesign.ai"
        className="studio-logo h-16 w-auto object-contain invert brightness-0"
      />
    </div>
  );
}

function createStarterProject(id: string): Project {
  return {
    id,
    title: '未命名课程',
    slides: [],
    word: { title: '', objectives: [], process: [], methods: [], homework: [] },
    messages: [],
    createdAt: Date.now()
  };
}

function serializeProjects(projects: Project[]) {
  return projects.map((project) => ({
    ...project,
    messages: project.messages ?? [],
  }));
}

function parseStoredProjects(raw: string): Project[] {
  const parsed = JSON.parse(raw) as Project[];
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((project) => ({
    ...createStarterProject(project.id || Date.now().toString()),
    ...project,
    messages: project.messages ?? [],
    slides: project.slides ?? [],
    word: project.word ?? { title: '', objectives: [], process: [], methods: [], homework: [] },
  }));
}

function projectFromPersistedRecord(record: PersistedProjectRecord): Project {
  return {
    ...createStarterProject(`db-${record.id}`),
    id: `db-${record.id}`,
    persistedId: record.id,
    title: record.title || '未命名课程',
    slides: record.slides_json ? JSON.parse(record.slides_json) : [],
    word: record.word_json
      ? JSON.parse(record.word_json)
      : { title: '', objectives: [], process: [], methods: [], homework: [] },
    interactive: record.interactive || undefined,
    messages: record.messages_json ? JSON.parse(record.messages_json) : [],
    instructionSet: record.instruction_set_json ? JSON.parse(record.instruction_set_json) : undefined,
    createdAt: new Date(record.created_at).getTime(),
  };
}

function StudioDock({
  currentView,
  onNavigate,
  onNewProject,
  isLight,
  onToggleTheme,
  projects,
  currentProjectId,
  onSelectHistory,
  onDeleteHistory,
}: {
  currentView: StudioView;
  onNavigate: (view: StudioView) => void;
  onNewProject: () => void;
  isLight: boolean;
  onToggleTheme: () => void;
  projects: Project[];
  currentProjectId: string | null;
  onSelectHistory: (projectId: string) => void;
  onDeleteHistory: (project: Project) => void | Promise<void>;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!historyOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) {
        setHistoryOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [historyOpen]);

  const dockItems = [
    {
      key: 'new-project',
      label: '新会话',
      icon: MessageSquarePlus,
      active: false,
      onClick: onNewProject
    },
    {
      key: 'history',
      label: projects.length > 0 ? `历史对话 · ${projects.length}` : '历史对话',
      icon: Clock3,
      active: historyOpen,
      onClick: () => setHistoryOpen((prev) => !prev)
    },
    ...dashboardNavItems.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      active: item.view === currentView,
      onClick: () => item.view && onNavigate(item.view)
    })),
    {
      key: 'profile',
      label: '个人信息',
      icon: Settings,
      active: currentView === 'profile',
      onClick: () => onNavigate('profile')
    },
    {
      key: 'theme-toggle',
      label: isLight ? '切换为黑夜' : '切换为白天',
      icon: isLight ? Moon : Sun,
      active: false,
      onClick: onToggleTheme
    }
  ] as const;

  return (
    <div className="pointer-events-none fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <motion.div
        ref={dockRef}
        initial={{ y: 0 }}
        animate={{
          y: [-2, 2, -2],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        }}
        className="pointer-events-auto pl-6"
      >
        <div className="flex flex-col items-center gap-1 rounded-[24px] border border-white/10 bg-black/42 p-2 backdrop-blur-2xl shadow-[0_18px_48px_rgba(0,0,0,0.34)]">
          {dockItems.map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
                key={item.key}
                type="button"
                whileHover={{ scale: 1.08, x: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={item.onClick}
                className={cn(
                  'group relative rounded-xl p-3 transition-colors',
                  item.active ? 'bg-white text-black' : 'text-white/72 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/88 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {historyOpen ? (
          <div className="absolute left-[calc(100%+16px)] top-[72px] z-50 min-w-[320px] max-w-[360px] overflow-hidden rounded-[18px] border border-white/10 bg-[#121214]/96 p-1 text-white shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="px-3 py-2 text-xs font-medium text-white/42">历史对话</div>
            <div className="max-h-[360px] overflow-y-auto">
              {projects.length === 0 ? (
                <div className="rounded-[12px] px-3 py-2.5 text-sm text-white/42">暂无对话记录</div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      onSelectHistory(project.id);
                      setHistoryOpen(false);
                    }}
                    className={cn(
                      'group relative flex w-full items-start rounded-[12px] px-3 py-2.5 pr-11 text-left text-sm transition-colors',
                      currentProjectId === project.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/72 hover:bg-white/6 hover:text-white'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate">{project.title || '未命名课程'}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/42">
                        {project.messages.at(-1)?.text || '还没有对话内容'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void onDeleteHistory(project);
                      }}
                      className={cn(
                        'absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-white/54 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100',
                        currentProjectId === project.id && 'opacity-100'
                      )}
                      aria-label={`删除${project.title || '未命名课程'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {currentProjectId === project.id ? <Check className="absolute right-11 top-3 h-4 w-4 text-white/78" /> : null}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

export default function TeachingStudio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [view, setView] = useState<StudioView>('workshop');
  const [previewPayload, setPreviewPayload] = useState<DeliverablePreviewPayload | null>(null);
  const [isLight, setIsLight] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generationTarget, setGenerationTarget] = useState<'ppt' | 'docx' | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocumentRecord[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeInitLoading, setKnowledgeInitLoading] = useState(false);
  const [knowledgeSubmitting, setKnowledgeSubmitting] = useState(false);
  const [knowledgeUploadLoading, setKnowledgeUploadLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);
  const [tokenUsageSnapshot, setTokenUsageSnapshot] = useState<TokenUsageSnapshot>(() =>
    readTokenUsageSnapshot(resolveTokenUsageUserKey())
  );
  const [knowledgeForm, setKnowledgeForm] = useState({ title: '', content: '', source_name: '' });
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeSourceFilter, setKnowledgeSourceFilter] = useState('all');
  const [knowledgeSort, setKnowledgeSort] = useState<'updated_desc' | 'updated_asc'>('updated_desc');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const currentProject = projects.find((project) => project.id === currentProjectId) ?? null;
  const isSpeechSupported =
    typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('token'));

  useEffect(() => {
    const loadProjects = async () => {
      if (hasToken) {
        try {
          const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PROJECTS), {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('读取数据库项目失败');
          }

          const records = (await response.json()) as PersistedProjectRecord[];
          const hydratedProjects = records.map(projectFromPersistedRecord);
          setProjects(hydratedProjects);
          setCurrentProjectId(hydratedProjects[0]?.id ?? null);
          return;
        } catch (error) {
          console.warn('读取数据库项目失败，回退到本地缓存:', error);
        }
      }

      try {
        const savedProjects = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (!savedProjects) {
          return;
        }

        const parsedProjects = parseStoredProjects(savedProjects);
        if (parsedProjects.length === 0) {
          return;
        }

        setProjects(parsedProjects);
        setCurrentProjectId(parsedProjects[0].id);
      } catch (error) {
        console.warn('读取本地项目缓存失败:', error);
      }
    };

    void loadProjects();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(serializeProjects(projects)));
    } catch (error) {
      console.warn('保存本地项目缓存失败:', error);
    }
  }, [projects]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentProject?.messages, isLoading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    void fetchCurrentUserProfile();
  }, []);

  useEffect(() => {
    setTokenUsageSnapshot(readTokenUsageSnapshot(resolveTokenUsageUserKey(currentUserProfile?.username)));
  }, [currentUserProfile?.username]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    const keyword = searchQuery.trim().toLowerCase();
    return projects.filter((project) => project.title.toLowerCase().includes(keyword));
  }, [projects, searchQuery]);

  const weeklyOutputs = projects.filter((project) => Date.now() - project.createdAt < 7 * 24 * 60 * 60 * 1000).length;
  const readyResources = files.length;
  const resourceProjects = useMemo(
    () =>
      [...projects]
        .filter((project) => project.slides.length > 0)
        .sort((left, right) => right.createdAt - left.createdAt),
    [projects]
  );

  const knowledgeSourceOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        knowledgeDocuments
          .map((document) => document.source_name?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );
    return ['all', ...values];
  }, [knowledgeDocuments]);

  const filteredKnowledgeDocuments = useMemo(() => {
    const keyword = knowledgeSearch.trim().toLowerCase();

    return [...knowledgeDocuments]
      .filter((document) => {
        const matchesSearch =
          !keyword ||
          document.title.toLowerCase().includes(keyword) ||
          (document.source_name || '').toLowerCase().includes(keyword);
        const matchesSource =
          knowledgeSourceFilter === 'all' || (document.source_name || '') === knowledgeSourceFilter;
        return matchesSearch && matchesSource;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.updated_at || left.created_at).getTime();
        const rightTime = new Date(right.updated_at || right.created_at).getTime();
        return knowledgeSort === 'updated_desc' ? rightTime - leftTime : leftTime - rightTime;
      });
  }, [knowledgeDocuments, knowledgeSearch, knowledgeSourceFilter, knowledgeSort]);

  const getAuthHeaders = (withJson = false) => {
    const token = localStorage.getItem('token');
    return {
      ...(withJson ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const persistProjectToDatabase = async (project: Project): Promise<Project> => {
    if (!localStorage.getItem('token')) {
      return project;
    }

    const payload = {
      title: project.word?.title || project.title || '未命名课程',
      slides_json: project.slides.length ? JSON.stringify(project.slides) : null,
      word_json: project.word?.title ? JSON.stringify(project.word) : null,
      interactive: project.interactive || null,
      messages_json: project.messages.length ? JSON.stringify(project.messages) : JSON.stringify([]),
      instruction_set_json: project.instructionSet ? JSON.stringify(project.instructionSet) : null,
    };

    const endpoint = project.persistedId
      ? `${API_CONFIG.ENDPOINTS.PROJECTS}/${project.persistedId}`
      : API_CONFIG.ENDPOINTS.PROJECTS;

    const response = await fetch(getApiUrl(endpoint), {
      method: project.persistedId ? 'PUT' : 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || '项目保存失败');
    }

    const record = (await response.json()) as PersistedProjectRecord;
    return {
      ...project,
      persistedId: record.id,
      id: `db-${record.id}`,
      title: record.title || project.title,
      createdAt: new Date(record.created_at).getTime(),
    };
  };

  const deleteProjectRecord = async (project: Project) => {
    if (project.persistedId && localStorage.getItem('token')) {
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.PROJECTS}/${project.persistedId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '删除项目失败');
      }
    }

    setProjects((prev) => prev.filter((item) => item.id !== project.id));
    setPreviewPayload((prev) => (currentProjectId === project.id ? null : prev));
    setCurrentProjectId((prev) => (prev === project.id ? null : prev));
  };

  const fetchCurrentUserProfile = async () => {
    if (!localStorage.getItem('token')) {
      const username = localStorage.getItem('username');
      if (username) {
        setCurrentUserProfile({
          username,
          email: '未同步邮箱',
        });
      }
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH_ME), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('获取用户信息失败');
      }

      const profile = (await response.json()) as CurrentUserProfile;
      setCurrentUserProfile(profile);
    } catch (error) {
      console.warn('获取用户信息失败:', error);
      const username = localStorage.getItem('username');
      if (username) {
        setCurrentUserProfile({
          username,
          email: '未同步邮箱',
        });
      }
    }
  };

  const fetchKnowledgeData = async () => {
    setKnowledgeLoading(true);
    setKnowledgeError('');

    try {
      const [statsResponse, documentsResponse] = await Promise.all([
        fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_STATS), {
          headers: getAuthHeaders(),
        }),
        fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_DOCUMENTS), {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!statsResponse.ok) {
        throw new Error('获取知识库统计失败');
      }
      if (!documentsResponse.ok) {
        throw new Error('获取知识条目失败');
      }

      const [statsData, documentsData] = await Promise.all([statsResponse.json(), documentsResponse.json()]);
      setKnowledgeStats(statsData);
      setKnowledgeDocuments(documentsData);
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : '知识库加载失败');
    } finally {
      setKnowledgeLoading(false);
    }
  };

  const initializeKnowledgeBase = async () => {
    setKnowledgeInitLoading(true);
    setKnowledgeError('');

    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_INIT), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || '默认知识库初始化失败');
      }
      await fetchKnowledgeData();
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : '默认知识库初始化失败');
    } finally {
      setKnowledgeInitLoading(false);
    }
  };

  const createKnowledgeDocument = async () => {
    if (!knowledgeForm.title.trim() || !knowledgeForm.content.trim()) {
      setKnowledgeError('请先填写标题和知识内容');
      return;
    }

    setKnowledgeSubmitting(true);
    setKnowledgeError('');

    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_DOCUMENTS), {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          title: knowledgeForm.title.trim(),
          content: knowledgeForm.content.trim(),
          source_name: knowledgeForm.source_name.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || '新增知识条目失败');
      }

      setKnowledgeForm({ title: '', content: '', source_name: '' });
      await fetchKnowledgeData();
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : '新增知识条目失败');
    } finally {
      setKnowledgeSubmitting(false);
    }
  };

  const deleteKnowledgeDocument = async (documentId: number) => {
    try {
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.KNOWLEDGE_DOCUMENTS}/${documentId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || '删除知识条目失败');
      }

      await fetchKnowledgeData();
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : '删除知识条目失败');
    }
  };

  const uploadKnowledgeDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    setKnowledgeUploadLoading(true);
    setKnowledgeError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_UPLOAD), {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || '上传文档失败');
      }

      await fetchKnowledgeData();
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : '上传文档失败');
    } finally {
      setKnowledgeUploadLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'knowledge') {
      fetchKnowledgeData();
    }
  }, [view]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) {
      return;
    }

    let targetProjectId = currentProjectId;
    if (!targetProjectId) {
      const id = Date.now().toString();
      const project = createStarterProject(id);
      setProjects((prev) => [project, ...prev]);
      setCurrentProjectId(id);
      setView('workshop');
      targetProjectId = id;
    } else {
      setView('workshop');
    }

    Array.from(uploadedFiles).forEach((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 10MB，可能会导致生成超时，请考虑压缩后上传。`);
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        const data = base64.split(',')[1];
        setFiles((prev) => [...prev, { name: file.name, type: file.type, data }]);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  const openWorkshop = (projectId?: string) => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
    setPreviewPayload(null);
    setView('workshop');
  };

  const startNewProject = () => {
    const id = Date.now().toString();
    const project = createStarterProject(id);
    setProjects((prev) => [project, ...prev]);
    setCurrentProjectId(id);
    setFiles([]);
    setInput('');
    setPreviewPayload(null);
    setView('workshop');
  };

  const ensureProject = () => {
    if (currentProjectId) {
      return currentProjectId;
    }

    const id = Date.now().toString();
    const project = createStarterProject(id);
    setProjects((prev) => [project, ...prev]);
    setCurrentProjectId(id);
    return id;
  };

  const handleSend = async (overrideText?: string) => {
    const messageText = (overrideText ?? input).trim();
    if (!messageText && files.length === 0) {
      return;
    }

    const projectId = ensureProject();
    const userMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: Date.now()
    };

    const baseProject = projects.find((project) => project.id === projectId) ?? createStarterProject(projectId);
    const nextProjectDraft: Project = {
      ...baseProject,
      title: baseProject.title === '量子纠缠' && messageText ? messageText.slice(0, 18) : baseProject.title,
      messages: [...baseProject.messages, userMessage]
    };

    setProjects((prev) => {
      const exists = prev.some((project) => project.id === projectId);
      return exists
        ? prev.map((project) => (project.id === projectId ? nextProjectDraft : project))
        : [nextProjectDraft, ...prev];
    });

    setInput('');

    try {
      const persistedProject = await persistProjectToDatabase(nextProjectDraft);
      setProjects((prev) => {
        const exists = prev.some((project) => project.id === projectId || project.id === persistedProject.id);
        if (!exists) {
          return [persistedProject, ...prev];
        }
        return prev.map((project) => (project.id === projectId || project.id === persistedProject.id ? persistedProject : project));
      });

      if (persistedProject.id !== projectId) {
        setCurrentProjectId(persistedProject.id);
      }
    } catch (error) {
      console.warn('同步对话到数据库失败:', error);
    }
  };

  const buildGenerationPrompt = (project: Project | null) => {
    const messageSummary = (project?.messages ?? [])
      .filter((message) => message.role === 'user')
      .slice(-8)
      .map((message) => message.text)
      .join('\n');

    if (messageSummary) {
      return messageSummary;
    }

    if (files.length > 0) {
      return '请基于我上传的资料生成当前版本内容。';
    }

    return '';
  };

  const handleGenerateAsset = async (target: 'ppt' | 'docx') => {
    const projectId = ensureProject();
    const existingProject = projects.find((project) => project.id === projectId) ?? null;
    const prompt = buildGenerationPrompt(existingProject);

    if (!prompt && files.length === 0) {
      alert('请先输入课程需求，或上传参考资料。');
      return;
    }

    setGenerationTarget(target);
    setIsLoading(true);

    try {
      const history = (existingProject?.messages ?? []).map((message) => ({
        role: message.role,
        parts: [{ text: message.text }]
      }));

      const result = await Promise.race([
        generateCoursewareAsset(
          prompt,
          target,
          history,
          files.map((file) => ({ mimeType: file.type, data: file.data })),
          existingProject?.instructionSet,
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('生成时间较长（已超过300秒），请尝试简化您的需求或稍后重试。')), 300000)
        )
      ]);

      setTokenUsageSnapshot(
        recordTokenUsage(resolveTokenUsageUserKey(currentUserProfile?.username), result.usageSummary)
      );

      const modelMessage: Message = {
        id: `${Date.now() + 1}`,
        role: 'model',
        text:
          target === 'ppt'
            ? `已生成 PPT 初稿，共 ${result.slides?.length ?? 0} 页。`
            : `已生成《${result.word?.title || existingProject?.title || '当前课程'}》教案。`,
        timestamp: Date.now()
      };

      const baseProject =
        projects.find((project) => project.id === projectId) ??
        existingProject ??
        createStarterProject(projectId);

      const nextProjectDraft: Project = {
        ...baseProject,
        title: result.word?.title || result.instructionSet?.topic || baseProject.title,
        slides: target === 'ppt' ? result.slides || baseProject.slides : baseProject.slides,
        word: target === 'docx' && result.word ? result.word : baseProject.word,
        interactive: target === 'docx' ? result.interactive || baseProject.interactive : baseProject.interactive,
        instructionSet: result.instructionSet || baseProject.instructionSet,
        messages: [...baseProject.messages, modelMessage]
      };

      const nextProject = await persistProjectToDatabase(nextProjectDraft);

      setProjects((prev) => {
        const exists = prev.some((project) => project.id === projectId);
        const updated = exists
          ? prev.map((project) => (project.id === projectId ? nextProject : project))
          : [nextProject, ...prev];

        return [...updated].sort((left, right) => right.createdAt - left.createdAt);
      });

      if (nextProject.id !== projectId) {
        setCurrentProjectId(nextProject.id);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `${Date.now() + 1}`,
        role: 'model',
        text: `抱歉，${target === 'ppt' ? 'PPT' : '教案'}生成失败：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      };

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, messages: [...project.messages, errorMessage] } : project
        )
      );
    } finally {
      setGenerationTarget(null);
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert('您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器。');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) {
          finalTranscript += event.results[index][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput((prev) => prev + finalTranscript);
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        alert('麦克风权限被拒绝，请在浏览器设置中允许使用麦克风。');
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleExportDocx = async () => {
    if (!currentProject?.word?.title) {
      return;
    }
    try {
      await exportDocx(currentProject.word);
    } catch (error) {
      alert(error instanceof Error ? error.message : '导出教案失败');
    }
  };

  const handleExportSlides = async () => {
    if (!currentProject?.slides?.length) {
      return;
    }
    try {
      await exportPptx(currentProject.slides, currentProject.word?.title || currentProject.title);
    } catch (error) {
      alert(error instanceof Error ? error.message : '导出 PPT 失败');
    }
  };

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden font-sans transition-colors duration-500',
        isLight ? 'bg-white text-black' : 'bg-black text-white'
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        {!isLight ? <ThermodynamicGrid /> : null}
      </div>
      {isLight ? (
        <style>{`
          .studio-light {
            background: #ffffff;
            color: #111111;
          }

          .studio-light .studio-logo {
            filter: none !important;
          }

          .studio-light [class*="text-white"] {
            color: #111111 !important;
          }

          .studio-light [class*="text-black"] {
            color: #111111 !important;
          }

          .studio-light [class*="text-white/82"],
          .studio-light [class*="text-white/78"],
          .studio-light [class*="text-white/75"],
          .studio-light [class*="text-white/72"],
          .studio-light [class*="text-white/70"],
          .studio-light [class*="text-white/66"],
          .studio-light [class*="text-white/58"],
          .studio-light [class*="text-white/56"],
          .studio-light [class*="text-white/52"],
          .studio-light [class*="text-white/50"],
          .studio-light [class*="text-white/48"],
          .studio-light [class*="text-white/46"],
          .studio-light [class*="text-white/42"],
          .studio-light [class*="text-white/38"],
          .studio-light [class*="text-white/34"],
          .studio-light [class*="text-white/28"] {
            color: rgba(17, 17, 17, 0.68) !important;
          }

          .studio-light [class*="bg-black/"] {
            background: rgba(17, 17, 17, 0.04) !important;
          }

          .studio-light [class*="bg-white/"] {
            background: rgba(17, 17, 17, 0.03) !important;
          }

          .studio-light [class*="border-white/"],
          .studio-light [class*="border-black/"] {
            border-color: rgba(17, 17, 17, 0.1) !important;
          }

          .studio-light [class*="shadow-"] {
            box-shadow: none !important;
          }

          .studio-light input,
          .studio-light textarea {
            background: transparent;
            color: #111111 !important;
          }

          .studio-light input::placeholder,
          .studio-light textarea::placeholder {
            color: rgba(17, 17, 17, 0.4) !important;
          }
        `}</style>
      ) : null}
      <div className="relative z-10 h-screen overflow-hidden">
        <StudioDock
          currentView={view}
          onNavigate={(nextView) => {
            if (nextView === 'workshop' && !currentProjectId && projects.length > 0) {
              setCurrentProjectId(projects[0].id);
            }
            setPreviewPayload(null);
            setView(nextView);
          }}
          onNewProject={startNewProject}
          isLight={isLight}
          onToggleTheme={() => setIsLight((prev) => !prev)}
          projects={filteredProjects}
          currentProjectId={currentProjectId}
          onSelectHistory={(projectId) => {
            setCurrentProjectId(projectId);
            setPreviewPayload(null);
            setView('workshop');
          }}
          onDeleteHistory={async (project) => {
            try {
              await deleteProjectRecord(project);
            } catch (error) {
              alert(error instanceof Error ? error.message : '删除项目失败');
            }
          }}
        />

        <div className={cn('h-full transition-[filter] duration-500', isLight && 'studio-light')}>
          {view === 'workshop' ? (
            <WorkshopPage
              currentProject={currentProject}
              previewPayload={previewPayload}
              files={files}
              input={input}
              isLoading={isLoading}
              isListening={isListening}
              isSpeechSupported={Boolean(isSpeechSupported)}
              isLight={isLight}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              textareaRef={textareaRef}
              chatEndRef={chatEndRef}
              filteredProjects={filteredProjects}
              onSelectProject={(projectId) => {
                setCurrentProjectId(projectId);
                setPreviewPayload(null);
                setView('workshop');
              }}
              onInputChange={setInput}
              onFileUpload={handleFileUpload}
              onRemoveFile={(index) => setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
              onSend={() => handleSend()}
              onPromptSelect={(prompt) => handleSend(prompt)}
              onPreviewOpen={(payload) => setPreviewPayload(payload)}
              onClosePreview={() => setPreviewPayload(null)}
              onGenerateAsset={handleGenerateAsset}
              onToggleListening={toggleListening}
              onNewProject={startNewProject}
              onExportDocx={handleExportDocx}
              onExportSlides={handleExportSlides}
              readyResources={readyResources}
              generationTarget={generationTarget}
            />
          ) : view === 'knowledge' ? (
            <KnowledgePage
              stats={knowledgeStats}
              documents={filteredKnowledgeDocuments}
              totalDocuments={knowledgeDocuments.length}
              form={knowledgeForm}
              loading={knowledgeLoading}
              initLoading={knowledgeInitLoading}
              submitting={knowledgeSubmitting}
              uploadLoading={knowledgeUploadLoading}
              error={knowledgeError}
              searchValue={knowledgeSearch}
              sourceFilter={knowledgeSourceFilter}
              sortValue={knowledgeSort}
              sourceOptions={knowledgeSourceOptions}
              onRefresh={fetchKnowledgeData}
              onInitialize={initializeKnowledgeBase}
              onUpload={uploadKnowledgeDocument}
              onSearchChange={setKnowledgeSearch}
              onSourceFilterChange={setKnowledgeSourceFilter}
              onSortChange={setKnowledgeSort}
              onFormChange={setKnowledgeForm}
              onCreate={createKnowledgeDocument}
              onDelete={deleteKnowledgeDocument}
            />
          ) : view === 'assets' ? (
            <AssetsPage
              projects={resourceProjects}
              onOpenProject={(project) => {
                setCurrentProjectId(project.id);
                setPreviewPayload({
                  kind: 'ppt',
                  title: project.word?.title || project.title || '课程演示文稿',
                  slides: project.slides,
                  createdAt: Date.now(),
                });
                setView('workshop');
              }}
              onDeleteProject={async (project) => {
                try {
                  await deleteProjectRecord(project);
                } catch (error) {
                  alert(error instanceof Error ? error.message : '删除项目失败');
                }
              }}
            />
          ) : (
            <ProfilePage
              profile={currentUserProfile}
              projects={projects}
              weeklyOutputs={weeklyOutputs}
              tokenUsageSnapshot={tokenUsageSnapshot}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StudioSidebar({
  currentView,
  onNavigate,
  onNewProject
}: {
  currentView: StudioView;
  onNavigate: (view: StudioView) => void;
  onNewProject: () => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col justify-between border-r border-white/8 bg-black/28 px-4 py-6 backdrop-blur-2xl">
      <div>
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-8 items-center justify-center rounded-[10px] border border-white/10 bg-white/8 shadow-[0_0_18px_rgba(255,255,255,0.08)]">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[28px] font-medium tracking-[-0.06em] text-white">TDesign</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-white/42">Teaching Studio</p>
          </div>
        </div>

        <nav className="mt-10 space-y-1">
          {dashboardNavItems.map((item) => {
            const isActive = item.view === currentView;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => item.view && onNavigate(item.view)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/38 hover:bg-white/6 hover:text-white/78',
                  item.muted && !isActive && 'cursor-default'
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={onNewProject}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-black transition-colors hover:bg-white/90"
        >
          <MessageSquarePlus size={16} />
          新建课程体系
        </button>

        <div className="border-t border-white/5 pt-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/38 transition-colors hover:bg-white/6 hover:text-white/78">
            <Settings size={18} />
            设置
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/38 transition-colors hover:bg-white/6 hover:text-white/78">
            <HelpCircle size={18} />
            帮助中心
          </button>
        </div>
      </div>
    </aside>
  );
}

function KnowledgePage({
  stats,
  documents,
  totalDocuments,
  form,
  loading,
  initLoading,
  submitting,
  uploadLoading,
  error,
  searchValue,
  sourceFilter,
  sortValue,
  sourceOptions,
  onRefresh,
  onInitialize,
  onUpload,
  onSearchChange,
  onSourceFilterChange,
  onSortChange,
  onFormChange,
  onCreate,
  onDelete,
}: {
  stats: KnowledgeStats | null;
  documents: KnowledgeDocumentRecord[];
  totalDocuments: number;
  form: { title: string; content: string; source_name: string };
  loading: boolean;
  initLoading: boolean;
  submitting: boolean;
  uploadLoading: boolean;
  error: string;
  searchValue: string;
  sourceFilter: string;
  sortValue: 'updated_desc' | 'updated_asc';
  sourceOptions: string[];
  onRefresh: () => void;
  onInitialize: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchChange: (value: string) => void;
  onSourceFilterChange: (value: string) => void;
  onSortChange: (value: 'updated_desc' | 'updated_asc') => void;
  onFormChange: React.Dispatch<React.SetStateAction<{ title: string; content: string; source_name: string }>>;
  onCreate: () => void;
  onDelete: (documentId: number) => void;
}) {
  return (
    <div className="relative h-screen overflow-y-auto">
      <PageLogo />
      <main className="min-h-screen bg-transparent px-8 pb-12 pt-20">
        <div className="mx-auto max-w-[1040px] space-y-6">
          <section className="rounded-[28px] border border-white/8 bg-white/6 p-8 backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">知识管理</p>
                <h2 className="mt-3 text-[32px] font-medium tracking-[-0.05em] text-white">统一管理默认知识库与个人知识条目</h2>
                <p className="mt-4 text-sm leading-7 text-white/56">
                  系统默认提供公共教学知识库，你也可以把自己的讲义、提纲和课堂经验补充进来，后续生成时会一起参与检索。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white transition-colors hover:bg-white/10"
                >
                  刷新数据
                </button>
                <button
                  type="button"
                  onClick={onInitialize}
                  disabled={initLoading}
                  className="rounded-2xl bg-white px-4 py-3 text-sm text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {initLoading ? '初始化中...' : '初始化默认知识库'}
                </button>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <KnowledgeMetricCard
              icon={<Database size={18} />}
              title="总条目"
              value={`${stats?.total_documents ?? documents.length}`}
              meta="当前可参与检索的知识文档"
            />
            <KnowledgeMetricCard
              icon={<Globe2 size={18} />}
              title="系统知识"
              value={`${stats?.public_documents ?? 0}`}
              meta={`${stats?.public_chunks ?? 0} 个知识分块`}
            />
            <KnowledgeMetricCard
              icon={<BookCopy size={18} />}
              title="新增条目"
              value={`${stats?.user_documents ?? 0}`}
              meta={`${stats?.user_chunks ?? 0} 个知识分块`}
            />
          </div>

          {error ? (
            <div className="rounded-[24px] border border-red-500/18 bg-red-500/8 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <section className="rounded-[28px] border border-white/8 bg-white/6 p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white">新增知识内容</p>
                  <p className="mt-2 text-xs leading-6 text-white/48">可以直接录入文字，也可以上传文档入库。</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-white/72">
                  <Plus size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="flex cursor-pointer items-center justify-between rounded-[22px] border border-dashed border-white/12 bg-black/16 px-4 py-4 text-sm text-white/72 transition-colors hover:border-white/20 hover:bg-white/6">
                  <div>
                    <p>上传文档入库</p>
                    <p className="mt-2 text-xs text-white/42">支持 txt、md、csv、docx、pptx，上传后会自动抽取文字并进入知识库。</p>
                  </div>
                  <span className="rounded-xl bg-white px-3 py-2 text-xs text-black">
                    {uploadLoading ? '上传中...' : '选择文件'}
                  </span>
                  <input type="file" className="hidden" onChange={onUpload} />
                </label>

                <input
                  value={form.title}
                  onChange={(event) => onFormChange((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="条目标题，例如：初二英语阅读课节奏设计"
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
                />
                <input
                  value={form.source_name}
                  onChange={(event) => onFormChange((prev) => ({ ...prev, source_name: event.target.value }))}
                  placeholder="来源名称，可选"
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
                />
                <textarea
                  value={form.content}
                  onChange={(event) => onFormChange((prev) => ({ ...prev, content: event.target.value }))}
                  placeholder="输入知识内容，例如教学目标、重难点、互动设计、案例讲解要点等。"
                  rows={10}
                  className="w-full resize-none rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-white/28"
                />
                <button
                  type="button"
                  onClick={onCreate}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  添加到我的知识库
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-white/6 p-6 backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white">知识库条目</p>
                  <p className="mt-2 text-xs leading-6 text-white/48">这里展示当前可参与检索的全部知识内容。</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-white/66">
                  <BookCopy size={18} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
                <div className="rounded-2xl border border-white/10 bg-black/16 px-4 py-3">
                  <div className="flex items-center gap-2 text-white/42">
                    <Search size={14} />
                    <input
                      value={searchValue}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder="搜索标题或来源"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/28"
                    />
                  </div>
                </div>
                <FilterMenu
                  value={sourceFilter}
                  valueLabel={sourceFilter === 'all' ? '全部来源' : sourceFilter}
                  options={sourceOptions.map((option) => ({
                    value: option,
                    label: option === 'all' ? '全部来源' : option,
                  }))}
                  onChange={onSourceFilterChange}
                />
                <FilterMenu
                  value={sortValue}
                  valueLabel={sortValue === 'updated_desc' ? '最近更新优先' : '较早更新优先'}
                  options={[
                    { value: 'updated_desc', label: '最近更新优先' },
                    { value: 'updated_asc', label: '较早更新优先' },
                  ]}
                  onChange={(value) => onSortChange(value as 'updated_desc' | 'updated_asc')}
                />
              </div>

              <div className="mt-6 space-y-3">
                {documents.length === 0 ? (
                  <div className="rounded-[20px] border border-white/8 bg-black/16 px-4 py-4 text-sm text-white/42">
                    {totalDocuments === 0 ? '还没有知识条目，先初始化默认知识库，或者直接新增内容。' : '当前筛选条件下没有匹配的知识条目。'}
                  </div>
                ) : (
                  documents.map((document) => (
                    <div key={document.id} className="rounded-[22px] border border-white/8 bg-black/16 px-4 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{document.title}</p>
                          <p className="mt-2 text-xs leading-6 text-white/44">
                            {document.owner_scope === 'public' ? '公有' : (document.source_name || '未标注来源')} · {document.chunk_count} 个知识分块
                          </p>
                          <p className="mt-1 text-[11px] text-white/34">
                            更新于 {new Date(document.updated_at || document.created_at).toLocaleString('zh-CN', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {document.owner_scope === 'private' ? (
                          <button
                            type="button"
                            onClick={() => onDelete(document.id)}
                            className="rounded-xl border border-white/10 bg-white/6 p-2 text-white/54 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-white/8 bg-white/6 px-5 py-4 text-sm text-white/58 backdrop-blur-2xl">
              正在同步知识库内容...
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function KnowledgeMetricCard({
  icon,
  title,
  value,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/6 p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/72">{title}</span>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-2 text-white/60">{icon}</div>
      </div>
      <p className="mt-6 text-[28px] font-medium tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-2 text-xs leading-6 text-white/46">{meta}</p>
    </div>
  );
}

function KnowledgeGroupCard({
  title,
  subtitle,
  icon,
  documents,
  onDelete,
  emptyText = '暂无内容',
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  documents: KnowledgeDocumentRecord[];
  onDelete?: (documentId: number) => void;
  emptyText?: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-white/6 p-6 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white">{title}</p>
          <p className="mt-2 text-xs leading-6 text-white/48">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-white/66">{icon}</div>
      </div>

      <div className="mt-6 space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-[20px] border border-white/8 bg-black/16 px-4 py-4 text-sm text-white/42">
            {emptyText}
          </div>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              className="rounded-[22px] border border-white/8 bg-black/16 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{document.title}</p>
                  <p className="mt-2 text-xs leading-6 text-white/44">
                    {document.source_name || '未标注来源'} · {document.chunk_count} 个知识分块
                  </p>
                </div>
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(document.id)}
                    className="rounded-xl border border-white/10 bg-white/6 p-2 text-white/54 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] text-white/48">
                    默认
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function formatResourceDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function PptCardThumbnail({ slide }: { slide: Project['slides'][number] }) {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-[20px]">
      <div className="absolute inset-0">
        <PptSlideCanvas slide={slide} index={0} />
      </div>
    </div>
  );
}

function AssetsPage({
  projects,
  onOpenProject,
  onDeleteProject,
}: {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void | Promise<void>;
}) {
  return (
    <div className="relative h-screen overflow-y-auto">
      <PageLogo />
      <main className="min-h-screen bg-transparent px-8 pb-12 pt-20 lg:pl-[112px]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center sm:mb-12">
            <p className="mb-4 font-medium text-[11px] uppercase tracking-[0.28em] text-white/42">
              PPT RESOURCE LIBRARY
            </p>
            <h2 className="text-[30px] font-normal tracking-[-0.05em] text-white sm:text-[42px]">
              教学资源
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-[28px] border border-white/8 bg-white/6 px-8 py-16 text-center backdrop-blur-2xl">
              <p className="text-lg text-white">还没有已生成的 PPT</p>
              <p className="mt-3 text-sm leading-7 text-white/46">先在对话工作台生成课件，这里会自动把它们存下来并展示成资源卡片。</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const coverSlide = project.slides[0];
                const subject = project.instructionSet?.subject || 'PPT';
                const title = project.word?.title || project.title || '未命名课件';
                const description =
                  coverSlide?.subtitle ||
                  project.slides.find((slide) => slide.body?.length)?.body?.[0] ||
                  project.messages.at(-1)?.text ||
                  '点击查看这份已生成的课程演示文稿。';

                return (
                  <article
                    className="cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-white/6 text-left shadow-none backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                    key={project.id}
                  >
                    <button type="button" onClick={() => onOpenProject(project)} className="block w-full text-left">
                      <div className="relative mb-1 sm:mb-1.5">
                        {coverSlide ? (
                          <PptCardThumbnail slide={coverSlide} />
                        ) : (
                          <div className="aspect-[16/9] rounded-[20px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_45%,#5b6cf8_100%)]" />
                        )}
                        <p className="absolute left-0 top-0 rounded-br-[14px] bg-white px-3 py-1 font-medium text-[10px] uppercase text-black backdrop-blur-sm dark:bg-gray-950/90 dark:text-gray-200">
                          #{subject}
                        </p>
                      </div>
                      <div className="px-3 pb-3 pt-0.5 sm:px-4 sm:pb-4 sm:pt-1">
                        <h3 className="mb-1.5 text-base tracking-tight text-white sm:text-lg md:text-[1.55rem]">
                          {title}
                        </h3>
                        <p className="mb-3 min-h-[38px] text-xs leading-relaxed text-white/54 sm:mb-4 sm:text-sm">
                          {description}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="group relative flex items-center overflow-hidden font-medium text-xs text-white transition-colors hover:text-white/80 sm:text-sm">
                            <span className="mr-2 overflow-hidden border border-white/14 p-2 transition-colors duration-300 ease-in group-hover:bg-white group-hover:text-black sm:p-3">
                              <ArrowRight className="h-3 w-3 translate-x-0 opacity-100 transition-all duration-500 ease-in group-hover:translate-x-8 group-hover:opacity-0 sm:h-4 sm:w-4" />
                              <ArrowRight className="absolute left-2 top-1/2 h-4 w-4 -translate-x-6 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-0 sm:left-3" />
                            </span>
                            预览 PPT
                          </span>
                          <span className="flex items-center gap-3 text-[10px] text-white/42 sm:text-xs">
                            {formatResourceDate(project.createdAt)}
                            <span className="w-8 border-t border-white/18 sm:w-16" />
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                      <button
                        type="button"
                        onClick={() => void onDeleteProject(project)}
                        className="inline-flex items-center gap-2 rounded-[14px] border border-white/12 bg-black/24 px-3 py-2 text-xs text-white/78 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Trash2 size={12} />
                        删除
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfilePage({
  profile,
  projects,
  weeklyOutputs,
  tokenUsageSnapshot,
}: {
  profile: CurrentUserProfile | null;
  projects: Project[];
  weeklyOutputs: number;
  tokenUsageSnapshot: TokenUsageSnapshot;
}) {
  const totalProjects = projects.length;
  const pptProjects = projects.filter((project) => project.slides.length > 0).length;
  const lessonPlans = projects.filter((project) => project.word?.title).length;
  const lastProject = [...projects].sort((left, right) => right.createdAt - left.createdAt)[0];
  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '暂无记录';
  const lastActiveAt = lastProject
    ? new Date(lastProject.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '暂无记录';
  const latestTokenUpdate = tokenUsageSnapshot.lastUpdatedAt
    ? new Date(tokenUsageSnapshot.lastUpdatedAt).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '暂无记录';
  const recentTokenDays = buildRecentTokenDays(tokenUsageSnapshot.daily, 14);
  const recent14DayTotal = recentTokenDays.reduce((sum, item) => sum + item.totalTokens, 0);

  return (
    <div className="relative h-screen overflow-y-auto">
      <PageLogo />
      <main className="min-h-screen bg-transparent px-8 pb-12 pt-20">
        <div className="mx-auto max-w-[1040px] space-y-6">
          <section className="rounded-[28px] border border-white/8 bg-white/6 p-8 backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">个人信息</p>
                <h2 className="mt-3 text-[32px] font-medium tracking-[-0.05em] text-white">
                  {profile?.username || localStorage.getItem('username') || '未登录用户'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/56">
                  {profile?.email || '当前没有可展示的邮箱信息'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/34">注册时间</p>
                  <p className="mt-3 text-sm text-white">{joinedAt}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/34">最近活跃</p>
                  <p className="mt-3 text-sm text-white">{lastActiveAt}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="项目总数"
              value={`${totalProjects} 个`}
              meta="当前账号下保存的全部项目"
              tone="green"
              icon={<FolderKanban size={22} />}
            />
            <StatCard
              title="PPT 课件"
              value={`${pptProjects} 份`}
              meta="已生成并保存到资源库的演示文稿"
              tone="blue"
              icon={<Presentation size={22} />}
            />
            <StatCard
              title="教案数量"
              value={`${lessonPlans} 份`}
              meta="已沉淀到项目里的教案内容"
              tone="green"
              icon={<FileText size={22} />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="累计 Token"
              value={formatTokenCount(tokenUsageSnapshot.totalTokens)}
              meta="当前账号在本地累计记录的模型消耗"
              tone="blue"
              icon={<Database size={22} />}
            />
            <StatCard
              title="累计请求"
              value={`${tokenUsageSnapshot.requestCount} 次`}
              meta="按每次成功生成的模型调用链路累计"
              tone="green"
              icon={<Globe2 size={22} />}
            />
            <StatCard
              title="最近更新"
              value={latestTokenUpdate}
              meta="统计会在每次生成成功后自动刷新"
              tone="blue"
              icon={<Clock3 size={22} />}
            />
          </div>

          <StatCard
            title="本周产出"
            value={`${weeklyOutputs || 4} 份课件`}
            meta="按最近 7 天创建时间统计"
            tone="blue"
            icon={<BookOpen size={22} />}
          />

          <section className="rounded-[28px] border border-white/8 bg-white/6 p-8 backdrop-blur-2xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">Token 趋势</p>
                <h3 className="mt-3 text-[28px] font-medium tracking-[-0.05em] text-white">最近 14 天消耗走势</h3>
                <p className="mt-3 text-sm leading-7 text-white/56">
                  近 14 天共累计 {formatTokenCount(recent14DayTotal)}，帮助你快速观察近期模型使用强度。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/34">输入 Token</p>
                  <p className="mt-3 text-sm text-white">{formatTokenCount(tokenUsageSnapshot.promptTokens)}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/34">输出 Token</p>
                  <p className="mt-3 text-sm text-white">{formatTokenCount(tokenUsageSnapshot.completionTokens)}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <TokenUsageChart points={recentTokenDays} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function TokenUsageChart({
  points,
}: {
  points: Array<{ date: string; totalTokens: number; requestCount: number }>;
}) {
  const width = 860;
  const height = 260;
  const padding = 18;
  const maxValue = Math.max(...points.map((item) => item.totalTokens), 1);
  const nonZeroDays = points.filter((item) => item.totalTokens > 0).length;
  const averageValue = Math.round(points.reduce((sum, item) => sum + item.totalTokens, 0) / Math.max(points.length, 1));

  const path = points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - (point.totalTokens / maxValue) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-black/20 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white">日维度 Token 统计</p>
          <p className="mt-1 text-xs text-white/42">统计范围包含没有消耗的日期，方便对比波峰与空档期。</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/66">
            峰值 {formatTokenCount(maxValue)}
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/66">
            活跃日 {nonZeroDays}
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
        <defs>
          <linearGradient id="tokenUsageStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8ad4ff" />
            <stop offset="100%" stopColor="#7cffc4" />
          </linearGradient>
          <linearGradient id="tokenUsageFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(138, 212, 255, 0.34)" />
            <stop offset="100%" stopColor="rgba(124, 255, 196, 0.02)" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - padding * 2);
          return (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 6"
            />
          );
        })}

        <path
          d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#tokenUsageFill)"
        />
        <path
          d={path}
          fill="none"
          stroke="url(#tokenUsageStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - (point.totalTokens / maxValue) * (height - padding * 2);
          return (
            <g key={point.date}>
              <circle cx={x} cy={y} r="4.5" fill="#b7fff0" />
              <circle cx={x} cy={y} r="10" fill="transparent">
                <title>{`${point.date}：${formatTokenCount(point.totalTokens)} / ${point.requestCount} 次`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-xs text-white/52">
        <span>近 14 天平均 {formatTokenCount(averageValue)} token / 天</span>
        <span>悬停节点可查看单日明细</span>
      </div>
    </div>
  );
}

function buildRecentTokenDays(
  daily: TokenUsageSnapshot['daily'],
  days: number,
): Array<{ date: string; totalTokens: number; requestCount: number }> {
  const dayMap = new Map(daily.map((item) => [item.date, item]));
  const points: Array<{ date: string; totalTokens: number; requestCount: number }> = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    const value = dayMap.get(key);
    points.push({
      date: key,
      totalTokens: value?.totalTokens ?? 0,
      requestCount: value?.requestCount ?? 0,
    });
  }

  return points;
}

function formatTokenCount(value: number) {
  return new Intl.NumberFormat('zh-CN').format(Math.max(0, Math.round(value)));
}


function DashboardHeader({
  searchQuery,
  setSearchQuery
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-white/8 bg-black/24 px-8 pl-24 pr-24 backdrop-blur-2xl lg:pl-32 lg:pr-28">
      <nav className="flex items-center gap-6 text-sm">
        <button className="border-b-2 border-white pb-1 text-white">课程概览</button>
        <button className="text-white/58 transition-colors hover:text-white">资源记录</button>
      </nav>

      <div className="flex items-center gap-4">
        <label className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/28" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索已策展的课件..."
            className="h-11 w-64 rounded-full border border-white/8 bg-white/6 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/28"
          />
        </label>
        <button className="rounded-lg p-2 text-white/42 transition-colors hover:bg-white/5 hover:text-white">
          <Bell size={18} />
        </button>
        <button className="rounded-lg p-2 text-white/42 transition-colors hover:bg-white/5 hover:text-white">
          <Presentation size={18} />
        </button>
        <button className="rounded-lg bg-white px-4 py-2 text-sm text-black transition-colors hover:bg-white/90">
          升级方案
        </button>
        <div className="size-8 rounded-full border border-white/14 bg-[linear-gradient(135deg,#f5f5f5,#6b7280)]" />
      </div>
    </header>
  );
}

function WorkshopPage({
  currentProject,
  previewPayload,
  files,
  input,
  isLoading,
  isListening,
  isSpeechSupported,
  isLight,
  searchQuery,
  setSearchQuery,
  textareaRef,
  chatEndRef,
  filteredProjects,
  onSelectProject,
  onInputChange,
  onFileUpload,
  onRemoveFile,
  onSend,
  onPromptSelect,
  onPreviewOpen,
  onClosePreview,
  onGenerateAsset,
  onToggleListening,
  onNewProject,
  onExportDocx,
  onExportSlides,
  readyResources,
  generationTarget
}: {
  currentProject: Project | null;
  previewPayload: DeliverablePreviewPayload | null;
  files: UploadedFile[];
  input: string;
  isLoading: boolean;
  isListening: boolean;
  isSpeechSupported: boolean;
  isLight: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  filteredProjects: Project[];
  onSelectProject: (projectId: string) => void;
  onInputChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSend: () => void;
  onPromptSelect: (prompt: string) => void;
  onPreviewOpen: (payload: DeliverablePreviewPayload) => void;
  onClosePreview: () => void;
  onGenerateAsset: (target: 'ppt' | 'docx') => void;
  onToggleListening: () => void;
  onNewProject: () => void;
  onExportDocx: () => void;
  onExportSlides: () => void;
  readyResources: number;
  generationTarget: 'ppt' | 'docx' | null;
}) {
  const messages = currentProject?.messages ?? [];
  const hasConversation = messages.length > 0 || files.length > 0;
  const summaryItems = getConversationSummary(currentProject, files);
  const hasPpt = Boolean(currentProject?.slides?.length);
  const hasDocx = Boolean(currentProject?.word?.title);
  const showingPreview = Boolean(previewPayload);

  return (
    <div className="relative h-screen overflow-hidden">
      <PageLogo />
      <main className="flex h-full pt-0 lg:pl-[88px]">
        <section className={cn('flex min-w-0 flex-1 flex-col bg-transparent', hasConversation && 'border-r border-white/8')}>
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className={cn('mx-auto space-y-8', showingPreview ? 'max-w-[1180px]' : 'max-w-[760px]')}>
              {showingPreview && previewPayload ? (
                <StudioDeliverablePreviewPanel
                  payload={previewPayload}
                  onBack={onClosePreview}
                  onExportDocx={onExportDocx}
                  onExportSlides={onExportSlides}
                />
              ) : !hasConversation ? (
                <EmptyWorkshopState
                  input={input}
                  isListening={isListening}
                  isSpeechSupported={isSpeechSupported}
                  isLight={isLight}
                  textareaRef={textareaRef}
                  onInputChange={onInputChange}
                  onSend={onSend}
                  onToggleListening={onToggleListening}
                  onFileUpload={onFileUpload}
                />
              ) : (
                messages.map((message, index) => (
                  <div key={message.id}>
                    <ChatBubble message={message} index={index} onPromptSelect={onPromptSelect} isLight={isLight} />
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#739eff]">
                    <Loader2 size={14} className="animate-spin text-[#002b6a]" />
                  </div>
                  <div className="max-w-[446px] rounded-bl-2xl rounded-br-2xl rounded-tr-2xl border border-white/8 bg-black/36 px-5 py-5 text-sm text-white/82 backdrop-blur-md">
                    正在生成{generationTarget === 'ppt' ? ' PPT ' : generationTarget === 'docx' ? '教案' : '内容'}，请稍候…
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {hasConversation && !showingPreview && (
          <div className="px-6 py-3.5">
            <div className="mx-auto max-w-[760px]">
              {files.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white"
                    >
                      <FileText size={12} className="text-[#89acff]" />
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="text-white/35 transition-colors hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-[18px] border border-white/8 bg-white/6 px-2.5 py-2 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
                <div className="flex items-center gap-2 px-1">
                  <label className="flex cursor-pointer items-center justify-center rounded-xl p-2 text-white/42 transition-colors hover:bg-white/5 hover:text-white">
                    <Upload size={18} />
                    <input type="file" multiple className="hidden" onChange={onFileUpload} />
                  </label>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        onSend();
                      }
                    }}
                    rows={1}
                    placeholder="请输入指令或反馈意见..."
                    className="min-h-[38px] max-h-24 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/28"
                  />

                  <div className="flex items-center gap-1">
                    {isSpeechSupported && (
                      <button
                        type="button"
                        onClick={onToggleListening}
                        className={cn(
                          'rounded-xl p-2 transition-colors',
                          isListening
                            ? 'bg-white/12 text-white'
                            : 'text-white/42 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onSend}
                      className="rounded-xl bg-white p-2 text-black transition-colors hover:bg-white/90"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </section>

        {hasConversation && (
        <aside
          className={cn(
            'relative w-[420px] shrink-0 backdrop-blur-2xl',
            isLight ? 'border-l border-black/8 bg-white' : 'bg-black/22'
          )}
        >
          <div className="flex h-full flex-col gap-4 p-6">
            <section
              className={cn(
                'min-h-0 flex-[1.1] overflow-hidden rounded-[28px] p-5',
                isLight ? 'border border-black/8 bg-[#fafafa]' : 'border border-white/8 bg-white/4'
              )}
            >
              <div className="h-full overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
                <div className="space-y-3">
                {summaryItems.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: index * 0.04 }}
                    className={cn(
                      'rounded-[18px] px-4 py-3 text-sm leading-7',
                      isLight
                        ? 'border border-black/8 bg-white text-black/72'
                        : 'border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] text-white/74'
                    )}
                  >
                    {item}
                  </motion.div>
                ))}
                </div>
              </div>
            </section>

            <section
              className={cn(
                'relative min-h-0 flex-1 overflow-hidden rounded-[28px] p-5',
                isLight ? 'border border-black/8 bg-[#fafafa]' : 'border border-white/8 bg-white/4'
              )}
            >
              <div className="space-y-0">
                <DeliverableRow
                  label="PPT"
                  subtitle={hasPpt ? `${currentProject?.slides?.length ?? 0} 页演示内容已就绪` : '根据当前对话单独生成演示文稿'}
                  ready={hasPpt}
                  loading={generationTarget === 'ppt'}
                  isLight={isLight}
                  previewTitle={currentProject?.word?.title || currentProject?.title || '课程演示文稿'}
                  previewSlides={currentProject?.slides}
                  onPreview={onPreviewOpen}
                  onClick={() => {
                    onGenerateAsset('ppt');
                  }}
                />
                <DeliverableRow
                  label="教案"
                  subtitle={hasDocx ? `${currentProject?.word?.process?.length ?? 0} 个教学环节已整理` : '根据当前对话单独生成课程教案'}
                  ready={hasDocx}
                  loading={generationTarget === 'docx'}
                  isLight={isLight}
                  previewTitle={currentProject?.word?.title || currentProject?.title || '课程教案'}
                  previewWord={currentProject?.word}
                  onPreview={onPreviewOpen}
                  onClick={() => {
                    onGenerateAsset('docx');
                  }}
                />
              </div>
            </section>
          </div>
        </aside>
        )}
      </main>
    </div>
  );
}

function DeliverableRow({
  label,
  subtitle,
  ready,
  loading,
  isLight,
  previewTitle,
  previewSlides,
  previewWord,
  onPreview,
  onClick,
}: {
  label: string;
  subtitle: string;
  ready: boolean;
  loading: boolean;
  isLight: boolean;
  previewTitle?: string;
  previewSlides?: Project['slides'];
  previewWord?: Project['word'];
  onPreview: (payload: DeliverablePreviewPayload) => void;
  onClick: () => void;
}) {
  return (
    <div className={cn('py-4 last:border-b-0', isLight ? 'border-b border-black/8' : 'border-b border-white/8')}>
      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-[20px] px-4 py-4',
          isLight ? 'border border-black/8 bg-white' : 'border border-white/8 bg-black/12'
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className={cn('text-[17px] tracking-[-0.03em]', isLight ? 'text-black' : 'text-white')}>{label}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px]',
                ready
                  ? isLight
                    ? 'border border-black/10 bg-[#f3f3f3] text-black'
                    : 'bg-white text-black'
                  : isLight
                    ? 'bg-black/6 text-black/56'
                    : 'bg-white/10 text-white/66'
              )}
            >
              {ready ? '已生成' : '待生成'}
            </span>
          </div>
          <p className={cn('mt-2 text-xs leading-6', isLight ? 'text-black/52' : 'text-white/44')}>{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {ready ? (
            <button
              type="button"
              onClick={() => {
                if (label === 'PPT' && previewSlides?.length && previewTitle) {
                  onPreview({
                    kind: 'ppt',
                    title: previewTitle,
                    slides: previewSlides,
                    createdAt: Date.now(),
                  });
                  return;
                }

                if (label === '教案' && previewWord && previewTitle) {
                  onPreview({
                    kind: 'docx',
                    title: previewTitle,
                    word: previewWord,
                    createdAt: Date.now(),
                  });
                }
              }}
              className={cn(
                'rounded-full px-4 py-2 text-sm transition-colors',
                isLight
                  ? 'border border-black/10 bg-white text-black hover:bg-black/[0.03]'
                  : 'border border-white/12 bg-white text-black hover:bg-white/92'
              )}
            >
              预览
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'flex h-11 min-w-[78px] items-center justify-center rounded-full border px-4 text-sm transition-colors',
              loading
                ? isLight
                  ? 'border-black/8 bg-black/5 text-black/56'
                  : 'border-white/10 bg-white/6 text-white/78'
                : ready
                  ? isLight
                    ? 'border-black/10 bg-black text-white hover:bg-black/90'
                    : 'border-white/10 bg-black/18 text-white hover:bg-white/8'
                  : isLight
                    ? 'border-black/10 bg-black text-white hover:bg-black/90'
                    : 'border-white/12 bg-white text-black hover:bg-white/92'
            )}
          >
            {loading ? <OrbitLoader /> : ready ? '重新生成' : '生成'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrbitLoader() {
  return (
    <div className="teaching-loader">
      <span className="teaching-loader-ring" />
      <span className="teaching-loader-ring teaching-loader-ring-delay" />
    </div>
  );
}

function getConversationSummary(project: Project | null, files: UploadedFile[]): string[] {
  const userMessages = (project?.messages ?? []).filter((message) => message.role === 'user');
  const latestUserMessage = userMessages.at(-1)?.text?.trim();
  const previousUserMessage = userMessages.at(-2)?.text?.trim();
  const inferredTopic = project?.instructionSet?.topic || project?.word?.title || latestUserMessage || '等待你补充课程需求';
  const fileSummary = files.length > 0 ? `已补充 ${files.length} 份参考资料，会一起参与后续生成。` : '当前还没有附加参考资料。';

  return [
    `当前需求焦点：${inferredTopic}`,
    previousUserMessage ? `补充要求：${previousUserMessage}` : '你继续输入约束、风格、课时或重点，我会实时更新这里。',
    fileSummary,
  ];
}

function getSlideLayoutLabel(layout: Project['slides'][number]['layout']) {
  switch (layout) {
    case 'cover':
      return '首页';
    case 'content':
      return '内容页';
    case 'two-col':
      return '双栏页';
    case 'image-text':
      return '图文页';
    case 'quote':
      return '引用页';
    case 'end':
      return '结束页';
    default:
      return '页面';
  }
}

function PptSlideCanvas({ slide, index }: { slide: Project['slides'][number]; index: number }) {
  const accent = slide.accent || '7c9cff';
  const body = slide.body || [];
  const canvasClassName = 'relative aspect-[16/9] w-full overflow-hidden rounded-[30px] bg-white text-[#1a1a1a] shadow-[0_24px_64px_rgba(0,0,0,0.16)]';
  const titleClassName = 'text-[2.45vw] font-semibold leading-[1.08] tracking-[-0.05em]';
  const subtitleClassName = 'text-[1.32vw] leading-[1.45] text-black/62';
  const bulletClassName = 'flex items-start gap-[0.75vw] text-[1.26vw] leading-[1.5] text-[#333333]';

  if (slide.layout === 'cover') {
    return (
      <div className={`${canvasClassName} flex flex-col justify-between px-[7.5%] py-[9%] text-white`} style={{ backgroundColor: `#${accent}` }}>
        <div />
        <div className="text-center">
          <h2 className="mx-auto max-w-[82%] text-[3.15vw] font-semibold leading-[1.08] tracking-[-0.06em]">{slide.title || '未命名首页'}</h2>
          {slide.subtitle ? <p className="mx-auto mt-[4.2%] max-w-[74%] text-[1.72vw] leading-[1.4] text-white/86">{slide.subtitle}</p> : null}
        </div>
        <div />
      </div>
    );
  }

  if (slide.layout === 'quote') {
    return (
      <div className={canvasClassName} style={{ backgroundColor: `#${accent}` }}>
        <div className="absolute left-[3.8%] top-[2.6%] text-[8vw] leading-none text-white/28">“</div>
        <div className="absolute left-[9%] top-[24%] w-[82%] text-center text-white">
          <p className="text-[2.15vw] font-semibold leading-[1.35] tracking-[-0.04em]">{slide.title || '引用页标题'}</p>
          {slide.subtitle ? <p className="mt-[7%] text-right text-[1.3vw] text-white/88">—— {slide.subtitle}</p> : null}
        </div>
      </div>
    );
  }

  if (slide.layout === 'end') {
    return (
      <div className={`${canvasClassName} bg-[#1a1a1a] text-white`}>
        <div className="absolute left-1/2 top-[46%] h-[0.9%] w-[22.5%] -translate-x-1/2 rounded-full" style={{ backgroundColor: `#${accent}` }} />
        <div className="absolute inset-x-[8%] top-[48%] -translate-y-1/2 text-center">
          <h2 className="text-[3.35vw] font-semibold tracking-[-0.05em]">{slide.title || '谢谢'}</h2>
          {slide.subtitle ? <p className="mt-[5.5%] text-[1.45vw] text-white/70">{slide.subtitle}</p> : null}
        </div>
      </div>
    );
  }

  if (slide.layout === 'two-col') {
    const midpoint = Math.ceil(body.length / 2);
    const columns = [body.slice(0, midpoint), body.slice(midpoint)];

    return (
      <div className={canvasClassName}>
        <div className="absolute inset-x-0 top-0 h-[2%]" style={{ backgroundColor: `#${accent}` }} />
        <div className="absolute left-[5.2%] top-[6.2%] right-[5.2%]">
          <h2 className={`${titleClassName} max-w-[90%]`}>{slide.title || '未命名页面'}</h2>
          {slide.subtitle ? <p className={`mt-[1.8%] max-w-[88%] ${subtitleClassName}`}>{slide.subtitle}</p> : null}
        </div>
        <div className="absolute inset-x-[4.2%] bottom-[6.5%] top-[25.5%] grid grid-cols-2 gap-[2.6%]">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="rounded-[24px] bg-[#f5f5f5] px-[5.2%] py-[5.8%]">
              <div className="space-y-[3.2%]">
                {(column.length ? column : ['暂无内容']).map((item) => (
                  <div key={`${columnIndex}-${item}`} className={bulletClassName}>
                    <span className="mt-[0.28vw] text-[1.2vw] leading-none text-[#333333]">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.layout === 'image-text') {
    return (
      <div className={canvasClassName}>
        <div className="absolute inset-x-0 top-0 h-[2%]" style={{ backgroundColor: `#${accent}` }} />
        <div className="absolute left-[5.2%] top-[6.2%] right-[5.2%]">
          <h2 className={`${titleClassName} max-w-[92%]`}>{slide.title || '未命名页面'}</h2>
          {slide.subtitle ? <p className={`mt-[1.8%] max-w-[88%] ${subtitleClassName}`}>{slide.subtitle}</p> : null}
        </div>
        <div className="absolute inset-x-[4.8%] bottom-[6.5%] top-[24.5%] grid grid-cols-[0.98fr_1.02fr] gap-[3.4%]">
          <div className="overflow-hidden rounded-[24px]">
            <div className="flex h-full w-full items-end p-[6.5%] text-white" style={{ background: `linear-gradient(135deg, #1a1a1a 0%, #${accent} 100%)` }}>
              <div>
                <p className="text-[1.55vw] font-medium leading-[1.3]">{slide.imageKeyword || slide.title || 'education'}</p>
              </div>
            </div>
          </div>
          <div className="min-h-0 overflow-hidden rounded-[24px] bg-[#f8f8f6] px-[5.4%] py-[5.6%]">
            <div className="space-y-[3.1%]">
              {(body.length ? body : ['暂无内容']).map((item) => (
                <div key={item} className={bulletClassName}>
                  <span className="mt-[0.28vw] text-[1.2vw] leading-none text-[#333333]">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={canvasClassName}>
      <div className="absolute inset-x-0 top-0 h-[2%]" style={{ backgroundColor: `#${accent}` }} />
      <div className="absolute left-[5.2%] top-[6.2%] right-[5.2%] bottom-[6.2%]">
        <h2 className={`${titleClassName} max-w-[90%]`}>{slide.title || '未命名页面'}</h2>
        {slide.subtitle ? <p className={`mt-[1.8%] max-w-[88%] ${subtitleClassName}`}>{slide.subtitle}</p> : null}
        <div className="mt-[4.4%] grid h-[70%] grid-cols-[0.012fr_0.988fr] gap-[2.8%]">
          <div className="rounded-full" style={{ backgroundColor: `#${accent}` }} />
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-[2.9%]">
              {(body.length ? body : ['暂无内容']).map((item) => (
                <div key={item} className={bulletClassName}>
                  <span className="mt-[0.28vw] text-[1.2vw] leading-none text-[#333333]">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudioDeliverablePreviewPanel({
  payload,
  onBack,
  onExportSlides,
  onExportDocx,
}: {
  payload: DeliverablePreviewPayload;
  onBack: () => void;
  onExportSlides: () => void;
  onExportDocx: () => void;
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = payload.slides || [];
  const currentSlide = slides[currentSlideIndex];
  const canGoPrev = currentSlideIndex > 0;
  const canGoNext = currentSlideIndex < slides.length - 1;

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [payload.kind, payload.title]);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/8 bg-white/6 px-6 py-5 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/8"
          >
            <ArrowLeft size={16} />
            返回对话
          </button>

          <button
            type="button"
            onClick={payload.kind === 'ppt' ? onExportSlides : onExportDocx}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm text-black transition-colors hover:bg-white/92"
          >
            <Download size={16} />
            {payload.kind === 'ppt' ? '导出 PPTX' : '导出教案'}
          </button>
        </div>
      </section>

      {payload.kind === 'ppt' ? (
        <section className="rounded-[32px] border border-white/8 bg-white/6 p-4 backdrop-blur-2xl md:p-6">
          {currentSlide ? (
            <div className="relative px-12 md:px-16">
              <button
                type="button"
                onClick={() => canGoPrev && setCurrentSlideIndex((index) => index - 1)}
                disabled={!canGoPrev}
                className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/28 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-30 md:size-12"
                aria-label="上一页"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="min-w-0">
                <PptSlideCanvas slide={currentSlide} index={currentSlideIndex} />
                {slides.length > 1 ? (
                  <div className="mt-5 flex items-center justify-center gap-2">
                    {slides.map((slide, index) => (
                      <button
                        key={`${slide.title || 'dot'}-${index}`}
                        type="button"
                        onClick={() => setCurrentSlideIndex(index)}
                        aria-label={`跳转到第 ${index + 1} 页`}
                        className={cn(
                          'h-2.5 rounded-full transition-all',
                          currentSlideIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/26 hover:bg-white/48'
                        )}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => canGoNext && setCurrentSlideIndex((index) => index + 1)}
                disabled={!canGoNext}
                className="absolute right-0 top-1/2 z-10 flex size-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/28 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-30 md:size-12"
                aria-label="下一页"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          ) : (
            <div className="flex min-h-[620px] items-center justify-center rounded-[34px] border border-dashed border-white/10 text-sm text-white/48">
              当前没有可预览的 PPT 内容。
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-[28px] border border-white/8 bg-white/6 p-6 backdrop-blur-2xl">
          <div className="rounded-[30px] bg-[#f3efe4] px-8 py-8 text-[#171717] shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-black/36">教案内容</p>
            <h2 className="mt-3 text-[34px] font-medium tracking-[-0.05em]">
              {payload.word?.title || payload.title}
            </h2>

            <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">教学目标</h3>
                  <div className="mt-4 space-y-3">
                    {(payload.word?.objectives?.length ? payload.word.objectives : ['暂无教学目标']).map((item) => (
                      <div key={item} className="rounded-[18px] bg-white px-4 py-3 text-sm leading-7 text-black/72">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {payload.word?.methods?.length ? (
                  <div>
                    <h3 className="text-lg font-medium">教学方法</h3>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {payload.word.methods.map((item) => (
                        <span key={item} className="rounded-full border border-black/8 px-4 py-2 text-sm text-black/64">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <h3 className="text-lg font-medium">教学流程</h3>
                <div className="mt-4 space-y-4">
                  {(payload.word?.process?.length ? payload.word.process : [{ stage: '暂无流程', duration: '', activities: [] }]).map((item) => (
                    <div key={`${item.stage}-${item.duration}`} className="rounded-[22px] bg-white px-5 py-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-medium">{item.stage}</p>
                        {item.duration ? <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs text-black/52">{item.duration}</span> : null}
                      </div>
                      <div className="mt-4 space-y-2">
                        {(item.activities?.length ? item.activities : ['暂无活动内容']).map((activity) => (
                          <div key={activity} className="rounded-[16px] bg-[#f7f2e8] px-4 py-3 text-sm leading-7 text-black/70">
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function WorkshopHeader({
  searchQuery,
  setSearchQuery,
  onExportDocx,
  onExportSlides,
  hasWord,
  hasSlides
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onExportDocx: () => void;
  onExportSlides: () => void;
  hasWord: boolean;
  hasSlides: boolean;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-white/8 bg-black/24 px-8 pl-24 pr-24 backdrop-blur-2xl lg:pl-32 lg:pr-28">
      <nav className="flex items-center gap-6 text-sm">
        <button className="text-white/58 transition-colors hover:text-white">我的课件库</button>
        <button className="text-white/58 transition-colors hover:text-white">全局统计</button>
      </nav>

      <div className="flex items-center gap-3">
        <label className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/28" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索会话..."
            className="h-11 w-52 rounded-full border border-white/8 bg-white/6 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/28"
          />
        </label>
        <button className="rounded-lg p-2 text-white/42 transition-colors hover:bg-white/5 hover:text-white">
          <Bell size={18} />
        </button>
        <button className="rounded-lg p-2 text-white/42 transition-colors hover:bg-white/5 hover:text-white">
          <Presentation size={18} />
        </button>
        <div className="h-8 w-px bg-white/10" />
        <button
          type="button"
          onClick={onExportSlides}
          disabled={!hasSlides}
          className="rounded-lg border border-white/10 bg-white/6 px-4 py-2 text-xs text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          导出 PPT
        </button>
        <button
          type="button"
          onClick={onExportDocx}
          disabled={!hasWord}
          className="rounded-lg border border-white/10 bg-white px-4 py-2 text-xs text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          导出教案
        </button>
        <div className="size-8 rounded-full border border-white/14 bg-[linear-gradient(135deg,#f5f5f5,#6b7280)]" />
      </div>
    </header>
  );
}

function ChatBubble({
  message,
  index,
  onPromptSelect,
  isLight,
}: {
  message: Message;
  index: number;
  onPromptSelect: (prompt: string) => void;
  isLight: boolean;
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[431px] rounded-bl-2xl rounded-br-2xl rounded-tl-2xl border border-white/8 bg-white/8 px-4 py-4 text-sm leading-[1.65] text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          {message.text}
        </div>
      </div>
    );
  }

  const showPromptChoices = index === 2;

  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-full',
          isLight ? 'bg-black/8 text-black' : 'bg-white text-black'
        )}
      >
        <Sparkles size={14} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[452px] rounded-bl-2xl rounded-br-2xl rounded-tr-2xl border border-white/8 bg-black/34 px-5 py-5 backdrop-blur-xl"
      >
        <div className="text-sm leading-[1.65] text-white">
          <Markdown>{message.text}</Markdown>
        </div>

        {showPromptChoices && (
          <>
            <div className="mt-4 rounded-r-lg border-l-4 border-white bg-white/8 px-4 py-3 text-sm leading-6 text-white">
              为了更精准地呈现内容，这节45分钟的课程应该侧重于理论深度，还是更倾向于实验案例展示？
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['侧重理论解析', '侧重实验与应用', '两者均衡'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onPromptSelect(option)}
                  className="rounded-full border border-white/12 px-4 py-2 text-xs text-white transition-colors hover:border-white/32 hover:bg-white/6"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  title,
  value,
  meta,
  tone,
  icon
}: {
  title: string;
  value: string;
  meta: string;
  tone: 'blue' | 'green';
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-[24px] border border-white/8 bg-white/6 px-6 py-6 backdrop-blur-xl">
      <div>
        <p className="text-xs text-white/42">{title}</p>
        <p className="mt-1 text-[30px] tracking-[-0.04em] text-white">{value}</p>
        <p className={cn('mt-2 text-[10px]', tone === 'blue' ? 'text-white/82' : 'text-white/42')}>{meta}</p>
      </div>
      <div
        className={cn(
          'flex size-14 items-center justify-center rounded-2xl',
          tone === 'blue' ? 'bg-white/10 text-white' : 'bg-white/8 text-white/75'
        )}
      >
        {icon}
      </div>
    </div>
  );
}

function ActivityCard({
  activities
}: {
  activities: ReadonlyArray<{ title: string; desc: string; time: string; tone: string }>;
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-[#ebffe6] shadow-[0_0_8px_rgba(235,255,230,0.5)]',
    blue: 'bg-[#0f6df3] shadow-[0_0_8px_rgba(15,109,243,0.5)]',
    slate: 'bg-[#40485d]'
  };

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/6 px-6 py-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-2 text-sm text-white">
        <Sparkles size={14} className="text-white" />
        学术动态日志
      </div>
      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div key={activity.title} className="relative flex gap-4">
            <div className="relative mt-1 flex w-4 justify-center">
              <div className={cn('size-4 rounded-full', colorMap[activity.tone])} />
              {index < activities.length - 1 && <div className="absolute top-6 h-14 w-px bg-white/10" />}
            </div>
            <div>
              <p className="text-xs text-white">{activity.title}</p>
              <p className="mt-1 text-[10px] leading-[15px] text-white/50">{activity.desc}</p>
              <p className="mt-1 text-[9px] text-white/28">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceCard({
  icon,
  title,
  meta,
  tag,
  tone
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  tag?: string;
  tone: 'red' | 'blue' | 'orange';
}) {
  const toneStyles: Record<string, string> = {
    red: 'bg-[rgba(167,1,56,0.2)] text-[#ff789d]',
    blue: 'bg-[rgba(115,158,255,0.2)] text-[#89acff]',
    orange: 'bg-[rgba(249,115,22,0.12)] text-[#f9a24d]'
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/6 p-4 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className={cn('flex size-10 items-center justify-center rounded-lg', toneStyles[tone])}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{title}</p>
          <p className="mt-1 text-[10px] text-white/45">{meta}</p>
          {tag ? (
            <span className="mt-3 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/78">
              {tag}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyWorkshopState({
  input,
  isLight,
  isListening,
  isSpeechSupported,
  textareaRef,
  onInputChange,
  onSend,
  onToggleListening,
  onFileUpload
}: {
  input: string;
  isLight: boolean;
  isListening: boolean;
  isSpeechSupported: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onToggleListening: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="w-full max-w-[760px] text-center">
        <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-medium tracking-[-0.05em] text-white">
          说清你的课程需求，我来继续整理
        </h2>

        <NightGlowField isLight={isLight} className="mt-10 rounded-[22px]" innerClassName="rounded-[22px] px-2.5 py-2">
          <div className="flex items-center gap-2 px-1">
            <label className={cn(
              'flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl transition-colors',
              isLight ? 'text-black/42 hover:text-black' : 'text-white/42 hover:bg-white/5 hover:text-white'
            )}>
              <Upload size={20} />
              <input type="file" multiple className="hidden" onChange={onFileUpload} />
            </label>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
              rows={1}
              placeholder="准备高一物理《牛顿第一定律》45分钟课程，侧重实验导入和课堂互动。"
              className="min-h-[38px] max-h-24 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/28 md:text-base"
            />

            <div className="flex items-center gap-1">
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={onToggleListening}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                    isLight
                      ? (isListening ? 'text-black' : 'text-black/42 hover:text-black')
                      : (isListening ? 'bg-white/12 text-white' : 'text-white/42 hover:bg-white/5 hover:text-white')
                  )}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
              <button
                type="button"
                onClick={onSend}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-black/90"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </NightGlowField>
      </div>
    </div>
  );
}
