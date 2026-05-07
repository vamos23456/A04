// API 配置
export const API_CONFIG = {
  // 后端 API 地址
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',

  // API 端点
  ENDPOINTS: {
    // 认证
    AUTH_REGISTER: '/api/auth/register',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_ME: '/api/auth/me',

    // 知识库
    KNOWLEDGE_INIT: '/api/knowledge/init',
    KNOWLEDGE_SEARCH: '/api/knowledge/search',
    KNOWLEDGE_STATS: '/api/knowledge/stats',
    KNOWLEDGE_DOCUMENTS: '/api/knowledge/documents',
    KNOWLEDGE_UPLOAD: '/api/knowledge/documents/upload',

    // 项目
    PROJECTS: '/api/projects',

    // 导出
    EXPORT_DOCX: '/export/docx',
    EXPORT_PPTX: '/export/pptx',
  }
};

// 构建完整 URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
}
