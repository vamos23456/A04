import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiUrl, API_CONFIG } from '../config/api';

interface KnowledgeStats {
  total_documents: number;
  collection_name: string;
}

export default function KnowledgeBaseStatus() {
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_STATS));
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('无法获取知识库状态');
      }
    } catch (err) {
      setError('后端服务未启动');
    } finally {
      setLoading(false);
    }
  };

  const initKnowledge = async () => {
    setInitializing(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.KNOWLEDGE_INIT), {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        alert(`知识库初始化完成！\n文件数：${data.total_files}\n分块数：${data.total_chunks}`);
        fetchStats();
      } else {
        const err = await response.json();
        setError(err.detail || '初始化失败');
      }
    } catch (err) {
      setError('初始化失败，请确保后端服务已启动');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-[#E5E5E5] rounded-xl shadow-lg p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-[#666]" />
          <span className="font-medium text-sm">知识库状态</span>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-1 hover:bg-[#F5F5F0] rounded transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 text-xs text-red-600 mb-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : stats ? (
        <div className="flex items-start gap-2 text-xs text-green-600 mb-3">
          <CheckCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <div>已加载 {stats.total_documents} 个知识块</div>
            <div className="text-[#999] mt-1">RAG 检索已启用</div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#999] mb-3">加载中...</div>
      )}

      {(!stats || stats.total_documents === 0) && !error && (
        <button
          onClick={initKnowledge}
          disabled={initializing}
          className="w-full py-2 px-3 bg-[#1A1A1A] text-white text-xs rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {initializing ? '初始化中...' : '初始化知识库'}
        </button>
      )}
    </div>
  );
}
