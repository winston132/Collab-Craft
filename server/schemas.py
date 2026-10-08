from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    college: Optional[str] = None
    year_branch: Optional[str] = None
    skills: Optional[str] = None
    tech_stack: Optional[str] = None
    interests: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    desired_projects: Optional[str] = None
    avatar_url: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

# --- User Base Schemas ---

class UserBase(BaseModel):
    name: str
    email: str
    college: Optional[str] = None
    year_branch: Optional[str] = None
    skills: Optional[str] = None
    tech_stack: Optional[str] = None
    interests: Optional[str] = None
    bio: Optional[str] = None
    previous_projects: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    desired_projects: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

TokenOut.model_rebuild()

class ProjectBase(BaseModel):
    title: str
    problem: str
    solution: str
    description: Optional[str] = None
    domain: str
    tech_stack: Optional[str] = None
    required_roles: Optional[str] = None # JSON string
    team_size: int = 4
    duration: Optional[str] = "4 Weeks"
    difficulty: Optional[str] = "Intermediate"
    motivation: Optional[str] = None
    looking_for: Optional[str] = None
    discord_link: Optional[str] = None
    whatsapp_link: Optional[str] = None

class ProjectCreate(ProjectBase):
    author_id: Optional[int] = None

class ProjectOut(ProjectBase):
    id: int
    author_id: int
    status: str
    created_at: datetime
    author: UserOut
    class Config:
        from_attributes = True

class JoinRequestCreate(BaseModel):
    project_id: int
    role_applied: str
    pitch_message: str
    applicant_id: Optional[int] = None

class JoinRequestOut(BaseModel):
    id: int
    project_id: int
    applicant_id: int
    role_applied: str
    pitch_message: str
    status: str
    created_at: datetime
    applicant: UserOut
    class Config:
        from_attributes = True

class TeamMemberCreate(BaseModel):
    project_id: int
    user_id: int
    role_title: str
    responsibilities: Optional[str] = None

class TeamMemberOut(BaseModel):
    id: int
    project_id: int
    user_id: int
    role_title: str
    responsibilities: Optional[str] = None
    user: UserOut
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None

class TaskOut(TaskCreate):
    id: int
    created_at: datetime
    assigned_to: Optional[UserOut] = None
    class Config:
        from_attributes = True

class ResourceCreate(BaseModel):
    project_id: int
    title: str
    category: str
    url: str
    description: Optional[str] = None

class ResourceOut(ResourceCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class DiscussionCreate(BaseModel):
    project_id: int
    text: str
    is_announcement: Optional[bool] = False
    sender_id: Optional[int] = None

class DiscussionOut(DiscussionCreate):
    id: int
    created_at: datetime
    sender: UserOut
    class Config:
        from_attributes = True

class CompletedProjectCreate(BaseModel):
    project_id: int
    title: str
    summary: str
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    screenshots: Optional[str] = None
    key_learnings: Optional[str] = None

class CompletedProjectOut(CompletedProjectCreate):
    id: int
    finished_at: datetime
    class Config:
        from_attributes = True
