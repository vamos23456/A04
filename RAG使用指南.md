# AI 教学助手 - RAG 知识库使用指南

## 🎉 已完成功能

### 后端
- ✅ 用户认证系统（注册/登录）
- ✅ RAG 知识库（ChromaDB + Gemini Embedding）
- ✅ 项目管理 API
- ✅ DOCX/PPTX 导出

### 前端
- ✅ RAG 自动检索集成
- ✅ 知识库状态显示
- ✅ 语音输入功能

---

## 🚀 快速开始

### 1. 启动后端

```bash
# 进入后端目录
cd backend/python_export

# 安装依赖
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 GEMINI_API_KEY

# 启动服务
uvicorn app:app --reload --port 8000
```

或使用启动脚本：
```bash
./start-backend.sh
```

### 2. 初始化知识库

后端启动后，初始化知识库（首次运行）：

```bash
curl -X POST http://localhost:8000/api/knowledge/init
```

这会读取项目根目录的：
- `初中物理知识点总结大全.txt`
- `初中数学知识点总结大全.txt`

并将它们向量化存储到 ChromaDB。

### 3. 启动前端

```bash
# 在项目根目录
npm install
npm run dev
```

前端将运行在 `http://localhost:3000`

---

## 💡 RAG 工作流程

### 用户输入教学意图
```
"生成一节关于牛顿第一定律的物理课"
```

### 自动 RAG 检索
前端自动调用后端 API：
```
POST /api/knowledge/search
{
  "query": "生成一节关于牛顿第一定律的物理课",
  "top_k": 3
}
```

### 返回相关知识点
```json
{
  "documents": [
    "牛顿第一定律：一切物体在没有受到外力作用时...",
    "惯性：物体保持原来运动状态的性质...",
    "力与运动的关系：力是改变物体运动状态的原因..."
  ]
}
```

### 增强 Prompt
将检索到的知识点注入到 system prompt：
```
## 参考知识库
以下是从专业知识库中检索到的相关知识点：

### 知识点 1
牛顿第一定律：一切物体在没有受到外力作用时...

### 知识点 2
惯性：物体保持原来运动状态的性质...

---

请基于以上知识点生成课件...
```

### 生成课件
Gemini 基于增强后的 prompt 生成专业课件。

---

## 🎨 界面功能

### 知识库状态组件（右下角）
- 显示已加载的知识块数量
- 一键初始化知识库
- 实时状态刷新

### 语音输入（输入框）
- 点击麦克风按钮开始录音
- 支持中文语音识别
- 识别结果自动追加到输入框

---

## 📊 API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 知识库
- `POST /api/knowledge/init` - 初始化知识库
- `POST /api/knowledge/search` - RAG 检索
- `GET /api/knowledge/stats` - 知识库统计

### 项目
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `PUT /api/projects/{id}` - 更新项目
- `DELETE /api/projects/{id}` - 删除项目

### 导出
- `POST /export/docx` - 导出教案
- `POST /export/pptx` - 导出 PPT

---

## 🔧 配置文件

### 后端 `.env`
```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_jwt_secret_key
```

### 前端 `.env.local`
```env
VITE_BACKEND_URL=http://localhost:8000
```

---

## 📁 项目结构

```
ai-教学助手-(ai-teaching-assistant)/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── KnowledgeBaseStatus.tsx  # 知识库状态组件
│   │   ├── config/
│   │   │   └── api.ts                   # API 配置
│   │   ├── services/
│   │   │   ├── geminiService.ts         # RAG 集成
│   │   │   └── exportService.ts
│   │   └── App.tsx                      # 主应用
│   └── .env.local                       # 前端配置
├── backend/python_export/
│   ├── app.py                           # FastAPI 入口
│   ├── database.py                      # 数据库模型
│   ├── auth.py                          # JWT 认证
│   ├── rag_service.py                   # RAG 核心
│   ├── auth_routes.py                   # 认证路由
│   ├── knowledge_routes.py              # 知识库路由
│   ├── project_routes.py                # 项目路由
│   ├── requirements.txt                 # Python 依赖
│   ├── .env                             # 后端配置
│   ├── app.db                           # SQLite 数据库
│   └── chroma_db/                       # 向量数据库
├── 初中物理知识点总结大全.txt
├── 初中数学知识点总结大全.txt
└── start-backend.sh                     # 后端启动脚本
```

---

## 🐛 故障排查

### 问题：RAG 检索失败
**现象**：控制台显示 "RAG 检索失败，继续使用原始 prompt"

**解决**：
1. 确认后端服务已启动（`http://localhost:8000`）
2. 检查知识库是否已初始化（调用 `/api/knowledge/init`）
3. 查看后端日志是否有错误

### 问题：知识库初始化失败
**现象**：点击"初始化知识库"按钮后报错

**解决**：
1. 确认 `.env` 中的 `GEMINI_API_KEY` 正确
2. 确认 txt 文件存在于项目根目录
3. 检查 `chroma_db/` 目录权限

### 问题：语音输入不工作
**现象**：点击麦克风按钮无反应

**解决**：
1. 使用 Chrome 或 Edge 浏览器
2. 允许浏览器访问麦克风权限
3. 检查系统麦克风是否正常

---

## 🎯 使用示例

### 1. 生成物理课件
输入：
```
生成一节关于牛顿第一定律的初中物理课，包含实验演示
```

RAG 自动检索相关知识点，生成专业课件。

### 2. 生成数学课件
输入：
```
制作一节关于二次函数的数学课，适合初三学生
```

系统会从数学知识库中检索相关内容。

### 3. 语音输入
1. 点击麦克风按钮
2. 说："生成一节关于光的反射的物理课"
3. 文字自动出现在输入框
4. 点击发送

---

## 📚 技术栈

### 前端
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

### 后端
- FastAPI
- SQLAlchemy
- ChromaDB
- Gemini Embedding API
- JWT 认证

---

## 🔮 后续计划

- [ ] 用户登录界面
- [ ] 项目云端同步
- [ ] 更多学科知识库
- [ ] 知识库管理界面
- [ ] 导出历史记录

---

## 📞 获取帮助

- 后端 API 文档：http://localhost:8000/docs
- GitHub Issues：提交问题和建议
