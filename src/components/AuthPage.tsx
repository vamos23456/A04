import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

import { Header } from '@/components/ui/header';
import { WebGLShader } from '@/components/ui/web-gl-shader';

interface AuthPageProps {
  isLight?: boolean;
  onToggleTheme?: () => void;
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthPage({ isLight = false, onToggleTheme, onSuccess, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { username: formData.username, password: formData.password } : formData;

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '操作失败');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const pageClass = isLight ? 'bg-[#ffffff] text-black' : 'bg-black text-white';
  const copyMuted = isLight ? 'text-black/58' : 'text-white/58';
  const copySoft = isLight ? 'text-black/42' : 'text-white/40';
  const surfaceClass = isLight
    ? 'border-black/10 bg-white/72 shadow-[0_24px_80px_rgba(0,0,0,0.08)]'
    : 'border-white/10 bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]';
  const inputClass = isLight
    ? 'border-black/10 bg-white/70 text-black placeholder:text-black/28 focus:border-black/25 focus:bg-white'
    : 'border-white/10 bg-white/6 text-white placeholder:text-white/28 focus:border-white/24 focus:bg-white/8';
  const iconClass = isLight ? 'text-black/34' : 'text-white/34';
  const primaryButtonClass = isLight
    ? 'bg-black text-white hover:bg-black/92 shadow-[0_18px_40px_rgba(0,0,0,0.14)]'
    : 'bg-white text-black hover:bg-white/92 shadow-[0_18px_40px_rgba(255,255,255,0.1)]';

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${pageClass}`}>
      <WebGLShader className={isLight ? 'pointer-events-none opacity-45' : 'opacity-100'} isLight={isLight} />

      {isLight && <div className="pointer-events-none absolute inset-0 bg-white/30" />}

      <div
        className={
          isLight
            ? 'pointer-events-none absolute inset-0 bg-transparent'
            : 'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.6))]'
        }
      />

      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-3">
        <Header
          isLight={isLight}
          onToggleTheme={onToggleTheme}
          onLogin={onBack}
          onStart={onBack}
          onNavigateHome={onBack}
        />
      </div>

      <button
        type="button"
        onClick={onBack}
        className={`absolute left-6 top-24 z-30 text-sm transition-colors md:left-8 md:top-28 ${isLight ? 'text-black/48 hover:text-black' : 'text-white/48 hover:text-white'}`}
      >
        ← 返回首页
      </button>

      <section className="relative z-10 flex min-h-screen items-center px-4 pb-20 pt-34 md:px-6 md:pb-24 md:pt-38">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center"
          >
            <p className={copySoft + ' mb-4 text-xs font-semibold uppercase tracking-[0.34em]'}>Account Access</p>
            <h1 className="text-[clamp(2.6rem,5.4vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
              进入你的教学工作台
            </h1>
            <p className={`mt-6 max-w-xl text-base leading-8 md:text-lg ${copyMuted}`}>
              登录后继续生成课件、整理教案、保存项目记录，让备课过程保持连续。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`overflow-hidden rounded-[32px] border p-7 backdrop-blur-2xl md:p-8 ${surfaceClass}`}
          >
            <div className="mb-8">
              <p className={copySoft + ' text-xs font-semibold uppercase tracking-[0.3em]'}>{isLogin ? 'Sign In' : 'Create Account'}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{isLogin ? '欢迎回来' : '创建账户'}</h2>
              <p className={`mt-3 text-sm leading-7 ${copyMuted}`}>
                {isLogin ? '登录后继续管理教学内容与生成记录。' : '注册后即可开始使用你的智能备课工作台。'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`mb-2 block text-sm ${copySoft}`}>用户名</label>
                <div className="relative">
                  <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClass}`} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm transition-all outline-none focus:ring-0 ${inputClass}`}
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <label className={`mb-2 block text-sm ${copySoft}`}>邮箱</label>
                    <div className="relative">
                      <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClass}`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm transition-all outline-none focus:ring-0 ${inputClass}`}
                        placeholder="请输入邮箱"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className={`mb-2 block text-sm ${copySoft}`}>密码</label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClass}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full rounded-2xl border py-3.5 pl-11 pr-12 text-sm transition-all outline-none focus:ring-0 ${inputClass}`}
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${iconClass}`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className={`group flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${primaryButtonClass}`}
              >
                {loading ? '处理中...' : isLogin ? '登录' : '注册'}
                {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>

            <div className="mt-6 border-t pt-6" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className={`text-sm transition-colors ${isLight ? 'text-black/55 hover:text-black' : 'text-white/55 hover:text-white'}`}
              >
                {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
