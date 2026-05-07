# AI 教学助手后端 - RAG 知识库

## 功能特性

- ✅ 用户注册/登录（JWT 认证）
- ✅ 本地知识库 RAG 检索（基于 ChromaDB + Gemini Embedding）
- ✅ 项目管理（CRUD）
- ✅ DOCX/PPTX 导出

## 技术栈

- **FastAPI** - Web 框架
- **SQLAlchemy** - ORM
- **SQLite** - 数据库
- **ChromaDB** - 向量数据库
- **Gemini Embedding API** - 文本向量化
- **JWT** - 用户认证

## 安装依赖

```bash
cd backend/python_export

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

## 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
GEMINI_API_KEY=your_actual_gemini_api_key
SECRET_KEY=your_random_secret_key_for_jwt
```

## 启动服务

```bash
uvicorn app:app --reload --port 8000
```

服务将运行在 `http://localhost:8000`

## API 文档

启动后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 初始化知识库

首次运行时需要初始化知识库（向量化 txt 文件）：

```bash
curl -X POST http://localhost:8000/api/knowledge/init
```

这会读取项目根目录的：
- `初中物理知识点总结大全.txt`
- `初中数学知识点总结大全.txt`

并将它们分块、向量化、存储到 ChromaDB。

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 知识库
- `POST /api/knowledge/init` - 初始化知识库
- `POST /api/knowledge/search` - RAG 检索
- `GET /api/knowledge/stats` - 知识库统计

### 项目管理（需要认证）
- `GET /api/projects` - 获取用户项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/{id}` - 获取单个项目
- `PUT /api/projects/{id}` - 更新项目
- `DELETE /api/projects/{id}` - 删除项目

### 导出
- `POST /export/docx` - 导出 Word 教案
- `POST /export/pptx` - 导出 PPT 课件

## 使用示例

### 1. 注册用户

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "email": "teacher1@example.com",
    "password": "password123"
  }'
```

### 2. RAG 检索

```bash
curl -X POST http://localhost:8000/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "牛顿第一定律",
    "top_k": 3
  }'
```

### 3. 创建项目（需要 token）

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "初中物理-力学",
    "slides_json": "...",
    "word_json": "..."
  }'
```

## 数据存储

- `app.db` - SQLite 数据库（用户、项目）
- `chroma_db/` - ChromaDB 向量数据库（知识库）

## 开发说明

### 文件结构

```
backend/python_export/
├── app.py                 # 主应用入口
├── database.py            # 数据库模型
├── auth.py                # JWT 认证
├── rag_service.py         # RAG 核心逻辑
├── auth_routes.py         # 认证路由
├── knowledge_routes.py    # 知识库路由
├── project_routes.py      # 项目管理路由
├── requirements.txt       # 依赖
├── .env                   # 环境变量
├── app.db                 # SQLite 数据库
└── chroma_db/             # 向量数据库
```

### 添加新的知识库文件

1. 将 txt 文件放到项目根目录
2. 修改 `knowledge_routes.py` 中的 `knowledge_files` 列表
3. 重新调用 `/api/knowledge/init`

## 故障排查

### 问题：ChromaDB 初始化失败
- 确保 `chroma_db/` 目录有写权限
- 删除 `chroma_db/` 目录后重新初始化

### 问题：Gemini API 调用失败
- 检查 `.env` 中的 `GEMINI_API_KEY` 是否正确
- 确认 API key 有 Embedding API 权限

### 问题：JWT token 无效
- 检查 `SECRET_KEY` 是否一致
- Token 有效期为 7 天，过期需重新登录
