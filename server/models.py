from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True) # Hashed password for real auth
    college = Column(String(150))
    year_branch = Column(String(100)) # e.g. "3rd Year, Computer Science"
    skills = Column(Text) # Comma-separated or JSON list
    tech_stack = Column(Text) # Comma-separated or JSON list
    interests = Column(Text)
    bio = Column(Text)
    previous_projects = Column(Text)
    github_url = Column(String(255))
    portfolio_url = Column(String(255))
    desired_projects = Column(Text)
    avatar_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    projects_authored = relationship("Project", back_populates="author", cascade="all, delete-orphan")
    join_requests = relationship("JoinRequest", back_populates="applicant", cascade="all, delete-orphan")
    team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")
    assigned_tasks = relationship("Task", back_populates="assigned_to")
    discussions = relationship("DiscussionMessage", back_populates="sender")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    problem = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    description = Column(Text)
    domain = Column(String(50), nullable=False) # AI/ML, Web Dev, Mobile, etc.
    tech_stack = Column(Text) # Comma separated
    required_roles = Column(Text) # JSON string: [{"role": "ML Engineer", "count": 1, "filled": 0}]
    team_size = Column(Integer, default=4)
    duration = Column(String(50)) # e.g. "4 Weeks"
    difficulty = Column(String(30)) # Beginner, Intermediate, Advanced
    motivation = Column(Text)
    looking_for = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(30), default="recruiting") # recruiting, in_progress, completed
    discord_link = Column(String(255))
    whatsapp_link = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="projects_authored")
    join_requests = relationship("JoinRequest", back_populates="project", cascade="all, delete-orphan")
    members = relationship("TeamMember", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project", cascade="all, delete-orphan")
    discussions = relationship("DiscussionMessage", back_populates="project", cascade="all, delete-orphan")
    completed_showcase = relationship("CompletedProject", back_populates="project", uselist=False)

class JoinRequest(Base):
    __tablename__ = "join_requests"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    applicant_id = Column(Integer, ForeignKey("users.id"))
    role_applied = Column(String(100))
    pitch_message = Column(Text)
    status = Column(String(30), default="pending") # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="join_requests")
    applicant = relationship("User", back_populates="join_requests")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role_title = Column(String(100))
    responsibilities = Column(Text)
    joined_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="team_memberships")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(30), default="pending") # pending, in_progress, done
    priority = Column(String(20), default="medium") # low, medium, high
    due_date = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assigned_to = relationship("User", back_populates="assigned_tasks")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String(150), nullable=False)
    category = Column(String(50)) # github, figma, drive, docs, dataset, deployment
    url = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="resources")

class DiscussionMessage(Base):
    __tablename__ = "discussion_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text, nullable=False)
    is_announcement = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="discussions")
    sender = relationship("User", back_populates="discussions")

class CompletedProject(Base):
    __tablename__ = "completed_projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String(200))
    summary = Column(Text)
    demo_url = Column(String(255))
    github_url = Column(String(255))
    screenshots = Column(Text) # Comma-separated or JSON list of URLs
    key_learnings = Column(Text)
    finished_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="completed_showcase")
