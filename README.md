# CollabCraft - Global Student Collaboration Platform

**CollabCraft** is a web platform designed to facilitate global student collaboration on group software projects. It guides students through the entire project lifecycle:
`Idea ➔ Discover ➔ Understand ➔ Express Interest ➔ Form Team ➔ Collaborate ➔ Build ➔ Portfolio Showcase`

---

## 🚀 Key Modules Built & Included

1. 👤 **User Profile Module**
   - Profiles with Name, University, Year/Branch, Skills, Known Tech Stack, Areas of Interest, Bio, Previous Projects, GitHub/Portfolio links, and desired project types.
   - Public view to assist students in evaluating potential team members.

2. 💡 **Project Idea Publishing Module**
   - Project creators can publish ideas with Title, Problem statement, Detailed solution, Required roles & headcount, Proposed tech stack, Estimated duration, Difficulty level (Beginner / Intermediate / Advanced), Motivation, and Target collaborator profile.

3. 🔎 **Project Discovery Module**
   - Real-time searching and filtering by Domain (AI/ML, Web Dev, Mobile Apps, Blockchain, IoT, Cybersecurity, Game Dev), Difficulty level, Open positions count, and Tech stack keywords.

4. 📖 **Project Details Module**
   - In-depth project view detailing problem, solution, tech stack, goals, author profile highlight, current team members, filled vs. vacant roles, and prominent **[ I WANT TO JOIN ]** action button.

5. 🤝 **Join Request Module**
   - Candidates send customized pitch messages expressing interest and role preferences.
   - Authors manage incoming join requests with **Accept & Add to Team** or **Decline** options.

6. 👥 **Team Formation Module**
   - Automatic team roster generation upon accepting join requests. Roles assigned with member responsibilities and social contact links (Discord / WhatsApp).

7. 💬 **Team Communication Module**
   - Integrated project workspace chat with general discussion channels and pinned announcements.

8. 📋 **Project Workspace Module**
   - Dedicated dashboard for active teams with tabbed navigation:
     - 📌 **Overview** (Milestone roadmap & external links)
     - 📋 **Task Board** (Interactive Kanban)
     - 👥 **Team Roster** (Roles & responsibilities)
     - 💬 **Team Chat** (Discussion & announcements)
     - 🔗 **Resource Hub** (GitHub, Figma, Docs, Datasets)

9. ✅ **Task Management Module**
   - Full Kanban task board (Pending ⏳, In Progress 🔄, Done ✅). Create tasks, set priorities, and update status dynamically.

10. 🔗 **Project Resources Module**
    - Repository for GitHub links, Figma UI designs, Google Drive docs, datasets, and deployment URLs.

11. 📈 **Project Progress Module**
    - Visual percentage calculations based on completed task items and stage checklists.

12. 🏆 **Completed Projects & Showcase Module**
    - Publish finished projects to the global **Portfolio Showcase** gallery featuring demo links, GitHub repos, screenshots, and key learnings linked directly to team members' portfolios.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Python (FastAPI), SQLAlchemy, SQLite, Uvicorn
- **Frontend**: Single Page Application (SPA) with HTML5, JavaScript (ES6 Modules), Tailwind CSS, Lucide visual icons, and glassmorphism UI components.
- **Persistence**: Dual-mode engine — live FastAPI REST backend with client-side LocalStorage fallback for seamless offline or static hosting!

---

## 🏃 Running the Application

### 1. Launch FastAPI Server
```bash
python server/main.py
```
Open your browser at [http://localhost:8000](http://localhost:8000)

### 2. Live API Documentation
Swagger UI documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs)
