import { Player } from '@remotion/player';
import { motion } from 'motion/react';
import { PlayCircle, Sparkles, MessageSquare, Database, FileText } from 'lucide-react';
import { TutorialVideo } from '@/components/TutorialVideo';

export default function TutorialSection() {
  return (
    <div className="min-h-screen bg-[#060e20] py-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">使用教程</span>
          </div>
          <h1 className="text-5xl font-bold text-[#dee5ff] mb-4 font-serif italic">
            三步生成优质教学内容
          </h1>
          <p className="text-xl text-[#8b95c9] max-w-2xl mx-auto">
            通过 AI 对话理解教学意图，智能检索知识库，自动生成专业 PPT 和教案
          </p>
        </motion.div>

        {/* 视频播放器区域 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/20">
            {/* 视频容器 */}
            <div className="relative bg-gradient-to-br from-[#0a1628] to-[#060e20]">
              <Player
                component={TutorialVideo}
                durationInFrames={270}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                }}
                controls
                loop
              />
            </div>

            {/* 装饰性光晕 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl -z-10" />
          </div>
        </motion.div>

        {/* 功能特性卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* 卡片1：对话理解 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-[#0a1628]/80 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-8 hover:border-indigo-500/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#dee5ff] mb-3 font-serif italic">
                智能对话理解
              </h3>
              <p className="text-[#8b95c9] leading-relaxed">
                通过自然语言对话，AI 深度理解教师的教学意图、课程目标和学生特点，精准把握教学需求
              </p>
            </div>
          </div>

          {/* 卡片2：知识库检索 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-[#0a1628]/80 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-8 hover:border-pink-500/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Database size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#dee5ff] mb-3 font-serif italic">
                精准知识匹配
              </h3>
              <p className="text-[#8b95c9] leading-relaxed">
                从海量教学资源库中智能检索相关内容，匹配最适合的教学素材、案例和参考资料
              </p>
            </div>
          </div>

          {/* 卡片3：内容生成 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-[#0a1628]/80 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#dee5ff] mb-3 font-serif italic">
                自动内容生成
              </h3>
              <p className="text-[#8b95c9] leading-relaxed">
                一键生成结构完整的 PPT 演示文稿和详细教案，包含教学目标、过程设计和作业布置
              </p>
            </div>
          </div>
        </motion.div>

        {/* 底部 CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <button className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105">
            <span className="relative z-10 flex items-center gap-2">
              <PlayCircle size={20} />
              立即开始使用
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
