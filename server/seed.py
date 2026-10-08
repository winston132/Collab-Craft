import os
import json
from datetime import datetime
from database import SessionLocal, engine, Base
from models import User, Project, JoinRequest, TeamMember, Task, Resource, DiscussionMessage, CompletedProject
from auth import hash_password

def seed_database(force=False):
    Base.metadata.create_all(bind=engine)
    
    # Only seed if explicitly requested via force=True or SEED_MOCK_DATA=true
    should_seed = force or os.getenv("SEED_MOCK_DATA", "").lower() in ("true", "1", "yes")
    
    if not should_seed:
        print("Production Mode Active: Skipping fake seed data generation.")
        return

    db = SessionLocal()
    if db.query(User).count() > 0:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding sample data for testing environment...")

    default_pwd = hash_password("student123")

    u1 = User(
        name="Arun Sharma",
        email="arun.sharma@iitb.ac.in",
        password_hash=default_pwd,
        college="IIT Bombay",
        year_branch="3rd Year, Computer Science",
        skills="Python, PyTorch, FastApi, Machine Learning, Data Structures",
        tech_stack="Python, Scikit-Learn, FastAPI, SQLite, Git",
        interests="Natural Language Processing, LLM Agents, EdTech",
        bio="Passionate AI enthusiast fascinated by building impactful NLP tools for students. Looking for enthusiastic frontend and design collaborators!",
        previous_projects="Smart Notes Summarizer (Hackathon 1st Place), Automated PDF Parser",
        github_url="https://github.com/arun-sharma-ai",
        portfolio_url="https://arun-sharma.dev",
        desired_projects="AI-driven developer tools, EdTech platforms, Intelligent Search",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )

    u2 = User(
        name="Rahul Verma",
        email="rverma@stanford.edu",
        password_hash=default_pwd,
        college="Stanford University",
        year_branch="4th Year, Computer Science",
        skills="Node.js, Express, PostgreSQL, Docker, Microservices",
        tech_stack="JavaScript, TypeScript, Node.js, PostgreSQL, Redis",
        interests="Scalable Web Systems, Backend Architecture, Cloud Computing",
        bio="Full-stack engineer focusing on clean API design, scalable databases, and performance tuning.",
        previous_projects="High-throughput Chat Engine, Campus Ride Share Backend",
        github_url="https://github.com/rahulv-dev",
        portfolio_url="https://rahulverma.io",
        desired_projects="Distributed web systems, Realtime collaboration platforms",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    )

    u3 = User(
        name="Priya Patel",
        email="ppatel@mit.edu",
        password_hash=default_pwd,
        college="MIT (Massachusetts Institute of Technology)",
        year_branch="3rd Year, EECS",
        skills="React, Next.js, Tailwind CSS, TypeScript, UI Components",
        tech_stack="React, Tailwind CSS, Redux Toolkit, Vite, Jest",
        interests="Frontend Architecture, Interactive UI, Accessibility, Web Performance",
        bio="Loves designing pixel-perfect, lightning-fast interfaces. Big fan of Tailwind CSS and Framer Motion.",
        previous_projects="Interactive Data Viz Dashboard, Student Task Manager UI",
        github_url="https://github.com/priyapatel-ui",
        portfolio_url="https://priyapatel.design",
        desired_projects="Modern React web apps, Collaborative whiteboards, Generative UI",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    )

    db.add_all([u1, u2, u3])
    db.commit()

    roles_p1 = [
        {"role": "Python/ML Lead", "count": 1, "filled": 1},
        {"role": "Backend Engineer", "count": 1, "filled": 1},
        {"role": "React Frontend Dev", "count": 1, "filled": 1}
    ]

    p1 = Project(
        title="AI Resume Analyzer & Career Guidance Engine",
        problem="Students struggle to get targeted feedback on their resumes and match their skills with real-world job role requirements.",
        solution="An AI-powered web app that parses resumes, extracts key skills using NLP, calculates match scores for target roles, and generates personalized improvement suggestions.",
        description="We are building an intuitive platform where students upload PDF resumes, select target roles (e.g. Frontend Engineer, ML Specialist), and receive granular feedback on missing keywords, formatting, and project positioning.",
        domain="AI/ML",
        tech_stack="Python, FastAPI, PyTorch, React, Tailwind CSS, SQLite",
        required_roles=json.dumps(roles_p1),
        team_size=3,
        duration="4 Weeks",
        difficulty="Intermediate",
        motivation="Help fellow students worldwide improve their hiring odds for tech internships and graduate roles.",
        looking_for="Motivated developers interested in NLP, modern React UI, and clean REST APIs.",
        author_id=u1.id,
        status="in_progress",
        discord_link="https://discord.gg/example-resume-ai"
    )

    db.add(p1)
    db.commit()

    m1 = TeamMember(project_id=p1.id, user_id=u1.id, role_title="Python/ML Lead", responsibilities="Train resume parsing model & build FastAPI endpoints")
    m2 = TeamMember(project_id=p1.id, user_id=u2.id, role_title="Backend Engineer", responsibilities="Architect database schemas & authentication APIs")
    m3 = TeamMember(project_id=p1.id, user_id=u3.id, role_title="React Frontend Dev", responsibilities="Build interactive score dashboard & feedback UI")

    db.add_all([m1, m2, m3])
    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_database(force=True)
