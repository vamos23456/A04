#!/bin/bash

# AI 教学助手后端启动脚本

echo "🚀 启动 AI 教学助手后端服务..."

cd backend/python_export

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 检查依赖
echo "📦 检查依赖..."
pip install -r requirements.txt -q

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，请复制 .env.example 并配置："
    echo "   cp .env.example .env"
    echo "   然后编辑 .env 文件，填入你的 GEMINI_API_KEY"
    exit 1
fi

# 启动服务
echo "✅ 启动服务在 http://localhost:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo ""
uvicorn app:app --reload --port 8000
