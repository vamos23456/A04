import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./app.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    knowledge_documents = relationship("KnowledgeDocument", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    slides_json = Column(Text)  # JSON 存储 slides
    word_json = Column(Text)    # JSON 存储 word
    interactive = Column(Text)  # 互动设计
    messages_json = Column(Text)  # JSON 存储对话消息
    instruction_set_json = Column(Text)  # JSON 存储生成指令集
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String, nullable=False)
    source_name = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    chunk_count = Column(Integer, default=0)
    is_system = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="knowledge_documents")


def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(bind=engine)
    _migrate_project_columns()


def _migrate_project_columns():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("projects")} if inspector.has_table("projects") else set()

    statements = []
    if "messages_json" not in columns:
        statements.append("ALTER TABLE projects ADD COLUMN messages_json TEXT")
    if "instruction_set_json" not in columns:
        statements.append("ALTER TABLE projects ADD COLUMN instruction_set_json TEXT")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
