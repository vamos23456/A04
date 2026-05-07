import { LessonPlan } from './services/kimiService';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type SlideLayout = 'cover' | 'content' | 'two-col' | 'image-text' | 'quote' | 'end';

export interface PptSlide {
  layout: SlideLayout;
  title?: string;
  subtitle?: string;
  body?: string[];
  imageKeyword?: string;
  accent?: string;
  note?: string;
}

// 指令集：融合教师意图 + 参考资料 + 知识库，驱动PPT和教案生成
export interface InstructionSet {
  subject: string;           // 学科
  topic: string;             // 课题
  gradeLevel: string;        // 年级
  duration: string;          // 课时时长
  teachingGoals: string[];   // 教学目标
  keyPoints: string[];       // 重点知识点（来自知识库）
  difficulties: string[];    // 教学难点
  referenceContext: string;  // 参考资料摘要
  knowledgeContext: string;  // 知识库检索内容
  pptInstructions: {         // PPT生成指令
    totalSlides: number;
    colorTheme: string;
    modules: {
      type: 'cover' | 'toc' | 'content' | 'summary';
      title: string;
      keyContent: string[];
      suggestedLayout: string;
    }[];
  };
  lessonPlanInstructions: {  // 教案生成指令
    objectives: string[];
    processStages: {
      stage: string;
      duration: string;
      activities: string[];
      knowledgePoints: string[];  // 该阶段需讲解的具体知识点
    }[];
    classActivities: string[];    // 课堂活动设计
    homework: string[];
  };
}

export interface Project {
  id: string;
  persistedId?: number;
  title: string;
  slides: PptSlide[];
  word: LessonPlan;
  interactive?: string;
  instructionSet?: InstructionSet;  // 生成过程中产生的指令集
  messages: Message[];
  createdAt: number;
}
