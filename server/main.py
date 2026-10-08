import os
import sys
import json

# Ensure server folder is in Python module search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import engine, Base, get_db
from models import User, Project, JoinRequest, TeamMember, Task, Resource, DiscussionMessage, CompletedProject
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user, get_current_user_optional
from seed import seed_database

# Create DB tables & seed conditionally
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="CollabCraft - Live Production Global Student Collaboration Platform API",
    description="Production REST API for real student accounts, authentication, project publishing, discovery, team workspace, and showcase.",
    version="2.0.0"
)

# Enable CORS for production domain & localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.TokenOut)
def register_student(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

    hashed_pwd = hash_password(user_in.password)
    user_data = user_in.model_dump()
    del user_data["password"]
    user_data["password_hash"] = hashed_pwd

    if not user_data.get("avatar_url"):
        user_data["avatar_url"] = f"https://api.dicebear.com/7.x/bottts/svg?seed={user_in.name}"

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@app.post("/api/auth/login", response_model=schemas.TokenOut)
def login_student(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/api/auth/me", response_model=schemas.UserOut)
def get_current_student_profile(current_user: User = Depends(get_current_user)):
    return current_user


# --- USER PROFILES ---

@app.get("/api/users", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/api/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return user

@app.put("/api/users/me", response_model=schemas.UserOut)
def update_my_profile(
    user_in: schemas.UserBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for key, value in user_in.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


# --- PROJECT PUBLISHING & DISCOVERY ---

@app.get("/api/projects")
def discover_projects(
    domain: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    
    if domain and domain != "All":
        query = query.filter(Project.domain == domain)
    if difficulty and difficulty != "All":
        query = query.filter(Project.difficulty == difficulty)
    if status and status != "All":
        query = query.filter(Project.status == status)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Project.title.ilike(search_fmt)) |
            (Project.problem.ilike(search_fmt)) |
            (Project.tech_stack.ilike(search_fmt))
        )

    projects = query.order_by(Project.created_at.desc()).all()
    
    result = []
    for p in projects:
        author = db.query(User).filter(User.id == p.author_id).first()
        member_count = db.query(TeamMember).filter(TeamMember.project_id == p.id).count()
        join_req_count = db.query(JoinRequest).filter(JoinRequest.project_id == p.id).count()
        
        result.append({
            "id": p.id,
            "title": p.title,
            "problem": p.problem,
            "solution": p.solution,
            "description": p.description,
            "domain": p.domain,
            "tech_stack": p.tech_stack,
            "required_roles": json.loads(p.required_roles) if p.required_roles else [],
            "team_size": p.team_size,
            "duration": p.duration,
            "difficulty": p.difficulty,
            "motivation": p.motivation,
            "looking_for": p.looking_for,
            "status": p.status,
            "created_at": p.created_at.isoformat(),
            "discord_link": p.discord_link,
            "whatsapp_link": p.whatsapp_link,
            "author": {
                "id": author.id,
                "name": author.name,
                "college": author.college,
                "avatar_url": author.avatar_url
            } if author else None,
            "current_member_count": member_count,
            "join_request_count": join_req_count
        })
    return result

@app.post("/api/projects")
def publish_project(
    project_in: schemas.ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_dict = project_in.model_dump()
    project_dict["author_id"] = current_user.id

    new_project = Project(**project_dict)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Automatically add author as team lead
    lead_member = TeamMember(
        project_id=new_project.id,
        user_id=current_user.id,
        role_title="Project Lead & Author",
        responsibilities="Project vision, coordination, and team management"
    )
    db.add(lead_member)
    db.commit()

    return {"message": "Project published successfully!", "project_id": new_project.id}


# --- PROJECT DETAILS ---

@app.get("/api/projects/{project_id}")
def get_project_details(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    author = db.query(User).filter(User.id == p.author_id).first()
    
    # Team members
    members_raw = db.query(TeamMember).filter(TeamMember.project_id == p.id).all()
    members = []
    for m in members_raw:
        u = db.query(User).filter(User.id == m.user_id).first()
        members.append({
            "id": m.id,
            "user_id": u.id if u else None,
            "name": u.name if u else "Student",
            "college": u.college if u else "University",
            "avatar_url": u.avatar_url if u else "",
            "role_title": m.role_title,
            "responsibilities": m.responsibilities,
            "joined_at": m.joined_at.isoformat()
        })

    # Join requests
    requests_raw = db.query(JoinRequest).filter(JoinRequest.project_id == p.id).all()
    join_requests = []
    for r in requests_raw:
        u = db.query(User).filter(User.id == r.applicant_id).first()
        join_requests.append({
            "id": r.id,
            "applicant_id": u.id if u else None,
            "applicant_name": u.name if u else "Student",
            "applicant_college": u.college if u else "University",
            "applicant_skills": u.skills if u else "",
            "applicant_avatar": u.avatar_url if u else "",
            "role_applied": r.role_applied,
            "pitch_message": r.pitch_message,
            "status": r.status,
            "created_at": r.created_at.isoformat()
        })

    return {
        "id": p.id,
        "title": p.title,
        "problem": p.problem,
        "solution": p.solution,
        "description": p.description,
        "domain": p.domain,
        "tech_stack": p.tech_stack,
        "required_roles": json.loads(p.required_roles) if p.required_roles else [],
        "team_size": p.team_size,
        "duration": p.duration,
        "difficulty": p.difficulty,
        "motivation": p.motivation,
        "looking_for": p.looking_for,
        "status": p.status,
        "created_at": p.created_at.isoformat(),
        "discord_link": p.discord_link,
        "whatsapp_link": p.whatsapp_link,
        "author": {
            "id": author.id,
            "name": author.name,
            "email": author.email,
            "college": author.college,
            "year_branch": author.year_branch,
            "skills": author.skills,
            "github_url": author.github_url,
            "avatar_url": author.avatar_url,
            "bio": author.bio
        } if author else None,
        "members": members,
        "join_requests": join_requests
    }


# --- JOIN REQUESTS ---

@app.post("/api/join-requests")
def create_join_request(
    req_in: schemas.JoinRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == req_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing = db.query(JoinRequest).filter(
        JoinRequest.project_id == req_in.project_id,
        JoinRequest.applicant_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a join request for this project.")

    new_req = JoinRequest(
        project_id=req_in.project_id,
        applicant_id=current_user.id,
        role_applied=req_in.role_applied,
        pitch_message=req_in.pitch_message
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return {"message": "Join request submitted successfully!", "request_id": new_req.id}

@app.post("/api/join-requests/{request_id}/action")
def process_join_request(
    request_id: int,
    action: str = Query(..., pattern="^(accept|reject)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Join request not found")

    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project or project.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project author can accept or decline join requests.")

    if action == "reject":
        req.status = "rejected"
        db.commit()
        return {"message": "Request declined"}

    req.status = "accepted"
    
    existing_mem = db.query(TeamMember).filter(
        TeamMember.project_id == req.project_id,
        TeamMember.user_id == req.applicant_id
    ).first()
    
    if not existing_mem:
        new_mem = TeamMember(
            project_id=req.project_id,
            user_id=req.applicant_id,
            role_title=req.role_applied,
            responsibilities=f"Collaborating as {req.role_applied}"
        )
        db.add(new_mem)

        if project.required_roles:
            try:
                roles = json.loads(project.required_roles)
                for r in roles:
                    if r.get("role").lower() == req.role_applied.lower() or req.role_applied.lower() in r.get("role").lower():
                        r["filled"] = min(r.get("count", 1), r.get("filled", 0) + 1)
                project.required_roles = json.dumps(roles)
            except Exception:
                pass

    db.commit()
    return {"message": "Request accepted! Student added to the team roster."}


# --- WORKSPACE, TASKS, RESOURCES & DISCUSSIONS ---

@app.get("/api/projects/{project_id}/workspace")
def get_workspace_data(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    members_raw = db.query(TeamMember).filter(TeamMember.project_id == p.id).all()
    members = []
    for m in members_raw:
        u = db.query(User).filter(User.id == m.user_id).first()
        members.append({
            "id": m.id,
            "user_id": u.id if u else None,
            "name": u.name if u else "Student",
            "college": u.college if u else "University",
            "avatar_url": u.avatar_url if u else "",
            "role_title": m.role_title,
            "responsibilities": m.responsibilities
        })

    tasks_raw = db.query(Task).filter(Task.project_id == p.id).all()
    tasks = []
    done_count = 0
    for t in tasks_raw:
        if t.status == "done":
            done_count += 1
        assignee = db.query(User).filter(User.id == t.assigned_to_id).first() if t.assigned_to_id else None
        tasks.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date,
            "assigned_to": {
                "id": assignee.id,
                "name": assignee.name,
                "avatar_url": assignee.avatar_url
            } if assignee else None
        })

    total_tasks = len(tasks)
    progress_percentage = int((done_count / total_tasks * 100)) if total_tasks > 0 else 0

    resources_raw = db.query(Resource).filter(Resource.project_id == p.id).all()
    resources = [{
        "id": r.id,
        "title": r.title,
        "category": r.category,
        "url": r.url,
        "description": r.description
    } for r in resources_raw]

    discussions_raw = db.query(DiscussionMessage).filter(DiscussionMessage.project_id == p.id).order_by(DiscussionMessage.created_at.asc()).all()
    discussions = []
    for d in discussions_raw:
        sender = db.query(User).filter(User.id == d.sender_id).first()
        discussions.append({
            "id": d.id,
            "sender_id": d.sender_id,
            "sender_name": sender.name if sender else "Student",
            "sender_avatar": sender.avatar_url if sender else "",
            "text": d.text,
            "is_announcement": d.is_announcement,
            "created_at": d.created_at.isoformat()
        })

    return {
        "project": {
            "id": p.id,
            "title": p.title,
            "domain": p.domain,
            "status": p.status,
            "discord_link": p.discord_link,
            "whatsapp_link": p.whatsapp_link
        },
        "progress_percentage": progress_percentage,
        "members": members,
        "tasks": tasks,
        "resources": resources,
        "discussions": discussions
    }

@app.post("/api/tasks")
def create_task(
    task_in: schemas.TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task_dict = task_in.model_dump()
    if not task_dict.get("assigned_to_id"):
        task_dict["assigned_to_id"] = current_user.id
    new_task = Task(**task_dict)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"message": "Task created successfully", "task_id": new_task.id}

@app.put("/api/tasks/{task_id}")
def update_task_status(
    task_id: int,
    status: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status
    db.commit()
    return {"message": "Task updated successfully"}

@app.post("/api/resources")
def create_resource(
    res_in: schemas.ResourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_res = Resource(**res_in.model_dump())
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return {"message": "Resource added successfully"}

@app.post("/api/discussions")
def create_discussion(
    disc_in: schemas.DiscussionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    disc_dict = disc_in.model_dump()
    disc_dict["sender_id"] = current_user.id
    new_disc = DiscussionMessage(**disc_dict)
    db.add(new_disc)
    db.commit()
    db.refresh(new_disc)
    return {"message": "Message posted"}


# --- COMPLETED PROJECTS SHOWCASE ---

@app.get("/api/completed-projects")
def get_completed_projects(db: Session = Depends(get_db)):
    projects = db.query(CompletedProject).order_by(CompletedProject.finished_at.desc()).all()
    result = []
    for cp in projects:
        p = db.query(Project).filter(Project.id == cp.project_id).first()
        members = db.query(TeamMember).filter(TeamMember.project_id == cp.project_id).all() if p else []
        member_list = []
        for m in members:
            u = db.query(User).filter(User.id == m.user_id).first()
            if u:
                member_list.append({"name": u.name, "avatar_url": u.avatar_url, "role": m.role_title})

        result.append({
            "id": cp.id,
            "project_id": cp.project_id,
            "title": cp.title or (p.title if p else "Completed Project"),
            "summary": cp.summary,
            "demo_url": cp.demo_url,
            "github_url": cp.github_url,
            "screenshots": cp.screenshots.split(",") if cp.screenshots else [],
            "key_learnings": cp.key_learnings,
            "finished_at": cp.finished_at.isoformat(),
            "domain": p.domain if p else "Software",
            "tech_stack": p.tech_stack if p else "React, Python",
            "team_members": member_list
        })
    return result

@app.post("/api/completed-projects")
def publish_completed_project(
    cp_in: schemas.CompletedProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_cp = CompletedProject(**cp_in.model_dump())
    db.add(new_cp)

    p = db.query(Project).filter(Project.id == cp_in.project_id).first()
    if p:
        p.status = "completed"

    db.commit()
    return {"message": "Project published to Portfolio Showcase!"}


# --- STATIC FILE SERVING & MOUNT ---

static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Production CollabCraft Server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
