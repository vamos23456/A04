from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db, User, Project
from auth import get_current_user
import json

router = APIRouter(prefix="/api/projects", tags=["项目管理"])


class ProjectCreate(BaseModel):
    title: str
    slides_json: Optional[str] = None
    word_json: Optional[str] = None
    interactive: Optional[str] = None
    messages_json: Optional[str] = None
    instruction_set_json: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slides_json: Optional[str] = None
    word_json: Optional[str] = None
    interactive: Optional[str] = None
    messages_json: Optional[str] = None
    instruction_set_json: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    slides_json: Optional[str]
    word_json: Optional[str]
    interactive: Optional[str]
    messages_json: Optional[str]
    instruction_set_json: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[ProjectResponse])
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的所有项目"""
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "slides_json": p.slides_json,
            "word_json": p.word_json,
            "interactive": p.interactive,
            "messages_json": p.messages_json,
            "instruction_set_json": p.instruction_set_json,
            "created_at": p.created_at.isoformat()
        }
        for p in projects
    ]


@router.post("", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新项目"""
    new_project = Project(
        user_id=current_user.id,
        title=project.title,
        slides_json=project.slides_json,
        word_json=project.word_json,
        interactive=project.interactive,
        messages_json=project.messages_json,
        instruction_set_json=project.instruction_set_json,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "id": new_project.id,
        "title": new_project.title,
        "slides_json": new_project.slides_json,
        "word_json": new_project.word_json,
        "interactive": new_project.interactive,
        "messages_json": new_project.messages_json,
        "instruction_set_json": new_project.instruction_set_json,
        "created_at": new_project.created_at.isoformat()
    }


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    return {
        "id": project.id,
        "title": project.title,
        "slides_json": project.slides_json,
        "word_json": project.word_json,
        "interactive": project.interactive,
        "messages_json": project.messages_json,
        "instruction_set_json": project.instruction_set_json,
        "created_at": project.created_at.isoformat()
    }


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    # 更新字段
    if project_update.title is not None:
        project.title = project_update.title
    if project_update.slides_json is not None:
        project.slides_json = project_update.slides_json
    if project_update.word_json is not None:
        project.word_json = project_update.word_json
    if project_update.interactive is not None:
        project.interactive = project_update.interactive
    if project_update.messages_json is not None:
        project.messages_json = project_update.messages_json
    if project_update.instruction_set_json is not None:
        project.instruction_set_json = project_update.instruction_set_json

    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "title": project.title,
        "slides_json": project.slides_json,
        "word_json": project.word_json,
        "interactive": project.interactive,
        "messages_json": project.messages_json,
        "instruction_set_json": project.instruction_set_json,
        "created_at": project.created_at.isoformat()
    }


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    db.delete(project)
    db.commit()

    return {"message": "项目已删除"}
