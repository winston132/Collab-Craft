// Production API Adapter with JWT Bearer Auth & Resilient Fallback

class ApiService {
  constructor() {
    this.baseUrl = "/api";
  }

  getHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = localStorage.getItem("collabcraft_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Auth Methods
  async register(userData) {
    try {
      const res = await fetch(`${this.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("collabcraft_token", data.access_token);
        localStorage.setItem("collabcraft_current_user", JSON.stringify(data.user));
        return data;
      }
      throw new Error(data.detail || "Registration failed");
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("NetworkError") && !e.message.includes("Failed to fetch")) {
        throw e;
      }
      console.warn("API unreachable. Using LocalStorage client register fallback.");
      let users = JSON.parse(localStorage.getItem("collabcraft_users") || "[]");
      const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existing) throw new Error("An account with this email address already exists.");

      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        ...userData,
        avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem("collabcraft_users", JSON.stringify(users));
      localStorage.setItem("collabcraft_token", `mock_jwt_token_${newId}`);
      localStorage.setItem("collabcraft_current_user", JSON.stringify(newUser));
      return { access_token: `mock_jwt_token_${newId}`, user: newUser };
    }
  }

  async login(credentials) {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("collabcraft_token", data.access_token);
        localStorage.setItem("collabcraft_current_user", JSON.stringify(data.user));
        return data;
      }
      throw new Error(data.detail || "Login failed");
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("NetworkError") && !e.message.includes("Failed to fetch")) {
        throw e;
      }
      console.warn("API unreachable. Using LocalStorage client login fallback.");
      const users = JSON.parse(localStorage.getItem("collabcraft_users") || "[]");
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      if (!user) throw new Error("Invalid email or password.");
      
      localStorage.setItem("collabcraft_token", `mock_jwt_token_${user.id}`);
      localStorage.setItem("collabcraft_current_user", JSON.stringify(user));
      return { access_token: `mock_jwt_token_${user.id}`, user };
    }
  }

  async getMe() {
    const token = localStorage.getItem("collabcraft_token");
    if (!token) return null;
    try {
      const res = await fetch(`${this.baseUrl}/auth/me`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}

    const saved = localStorage.getItem("collabcraft_current_user");
    if (saved) return JSON.parse(saved);
    return null;
  }

  logout() {
    localStorage.removeItem("collabcraft_token");
    localStorage.removeItem("collabcraft_current_user");
  }

  // 1. User Profiles
  async getUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/users`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return JSON.parse(localStorage.getItem("collabcraft_users") || "[]");
  }

  async getUserById(id) {
    try {
      const res = await fetch(`${this.baseUrl}/users/${id}`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    const users = JSON.parse(localStorage.getItem("collabcraft_users") || "[]");
    return users.find(u => u.id === parseInt(id));
  }

  async updateMyProfile(userData) {
    try {
      const res = await fetch(`${this.baseUrl}/users/me`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (e) {}

    let me = await this.getMe();
    if (me) {
      me = { ...me, ...userData };
      localStorage.setItem("collabcraft_current_user", JSON.stringify(me));
      return me;
    }
    return userData;
  }

  // 2 & 3. Projects & Discovery
  async getProjects(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`${this.baseUrl}/projects?${params.toString()}`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}

    let projects = JSON.parse(localStorage.getItem("collabcraft_projects") || "[]");
    const users = JSON.parse(localStorage.getItem("collabcraft_users") || "[]");
    const members = JSON.parse(localStorage.getItem("collabcraft_team_members") || "[]");
    const requests = JSON.parse(localStorage.getItem("collabcraft_join_requests") || "[]");

    if (filters.domain && filters.domain !== "All") {
      projects = projects.filter(p => p.domain === filters.domain);
    }
    if (filters.difficulty && filters.difficulty !== "All") {
      projects = projects.filter(p => p.difficulty === filters.difficulty);
    }
    if (filters.status && filters.status !== "All") {
      projects = projects.filter(p => p.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.problem.toLowerCase().includes(q) ||
        (p.tech_stack && p.tech_stack.toLowerCase().includes(q))
      );
    }

    return projects.map(p => {
      const author = users.find(u => u.id === p.author_id);
      const memberCount = members.filter(m => m.project_id === p.id).length;
      const reqCount = requests.filter(r => r.project_id === p.id).length;
      return {
        ...p,
        author: author ? { id: author.id, name: author.name, college: author.college, avatar_url: author.avatar_url } : null,
        current_member_count: memberCount,
        join_request_count: reqCount
      };
    });
  }

  async publishProject(projectData) {
    try {
      const res = await fetch(`${this.baseUrl}/projects`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(projectData)
      });
      const data = await res.json();
      if (res.ok) return data;
      throw new Error(data.detail || "Failed to publish project");
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("NetworkError") && !e.message.includes("Failed to fetch")) throw e;
    }

    const me = await this.getMe();
    let projects = JSON.parse(localStorage.getItem("collabcraft_projects") || "[]");
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    let reqRoles = projectData.required_roles;
    if (typeof reqRoles === "string") { try { reqRoles = JSON.parse(reqRoles); } catch { reqRoles = []; } }

    const newProj = {
      id: newId,
      ...projectData,
      required_roles: reqRoles,
      author_id: me ? me.id : 1,
      status: "recruiting",
      created_at: new Date().toISOString()
    };
    projects.unshift(newProj);
    localStorage.setItem("collabcraft_projects", JSON.stringify(projects));
    return { message: "Project published!", project_id: newId };
  }

  // 4. Project Details
  async getProjectDetails(id) {
    try {
      const res = await fetch(`${this.baseUrl}/projects/${id}`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}

    const pId = parseInt(id);
    const projects = JSON.parse(localStorage.getItem("collabcraft_projects") || "[]");
    const p = projects.find(proj => proj.id === pId);
    if (!p) return null;

    const users = JSON.parse(localStorage.getItem("collabcraft_users") || "[]");
    const author = users.find(u => u.id === p.author_id);
    const membersRaw = JSON.parse(localStorage.getItem("collabcraft_team_members") || "[]").filter(m => m.project_id === pId);
    const members = membersRaw.map(m => {
      const u = users.find(usr => usr.id === m.user_id) || {};
      return { id: m.id, user_id: u.id, name: u.name || "Student", college: u.college || "University", avatar_url: u.avatar_url || "", role_title: m.role_title, responsibilities: m.responsibilities, joined_at: m.joined_at };
    });

    const requestsRaw = JSON.parse(localStorage.getItem("collabcraft_join_requests") || "[]").filter(r => r.project_id === pId);
    const join_requests = requestsRaw.map(r => {
      const u = users.find(usr => usr.id === r.applicant_id) || {};
      return { id: r.id, applicant_id: u.id, applicant_name: u.name || "Student", applicant_college: u.college || "University", applicant_skills: u.skills || "", applicant_avatar: u.avatar_url || "", role_applied: r.role_applied, pitch_message: r.pitch_message, status: r.status, created_at: r.created_at };
    });

    let reqRoles = p.required_roles;
    if (typeof reqRoles === "string") { try { reqRoles = JSON.parse(reqRoles); } catch { reqRoles = []; } }

    return {
      ...p,
      required_roles: reqRoles,
      author: author ? { id: author.id, name: author.name, email: author.email, college: author.college, year_branch: author.year_branch, skills: author.skills, github_url: author.github_url, avatar_url: author.avatar_url, bio: author.bio } : null,
      members,
      join_requests
    };
  }

  // 5. Join Requests
  async createJoinRequest(reqData) {
    try {
      const res = await fetch(`${this.baseUrl}/join-requests`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(reqData)
      });
      const data = await res.json();
      if (res.ok) return data;
      throw new Error(data.detail || "Failed to submit request");
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("NetworkError") && !e.message.includes("Failed to fetch")) throw e;
    }

    const me = await this.getMe();
    let requests = JSON.parse(localStorage.getItem("collabcraft_join_requests") || "[]");
    const newReq = { id: requests.length + 1, ...reqData, applicant_id: me ? me.id : 1, status: "pending", created_at: new Date().toISOString() };
    requests.push(newReq);
    localStorage.setItem("collabcraft_join_requests", JSON.stringify(requests));
    return { message: "Join request submitted!", request_id: newReq.id };
  }

  async processJoinRequest(requestId, action) {
    try {
      const res = await fetch(`${this.baseUrl}/join-requests/${requestId}/action?action=${action}`, {
        method: "POST",
        headers: this.getHeaders()
      });
      const data = await res.json();
      if (res.ok) return data;
      throw new Error(data.detail || "Action failed");
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("NetworkError") && !e.message.includes("Failed to fetch")) throw e;
    }

    let requests = JSON.parse(localStorage.getItem("collabcraft_join_requests") || "[]");
    const reqIdx = requests.findIndex(r => r.id === parseInt(requestId));
    if (reqIdx !== -1) {
      requests[reqIdx].status = action === "accept" ? "accepted" : "rejected";
      localStorage.setItem("collabcraft_join_requests", JSON.stringify(requests));
    }
    return { message: `Request ${action}ed successfully!` };
  }

  // 6 - 11. Workspace, Tasks, Resources, Discussions
  async getWorkspaceData(projectId) {
    try {
      const res = await fetch(`${this.baseUrl}/projects/${projectId}/workspace`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}

    const pId = parseInt(projectId);
    const projects = JSON.parse(localStorage.getItem("collabcraft_projects") || "[]");
    const p = projects.find(proj => proj.id === pId) || {};
    const users = JSON.parse(localStorage.getItem("collabcraft_users") || "[]");
    const membersRaw = JSON.parse(localStorage.getItem("collabcraft_team_members") || "[]").filter(m => m.project_id === pId);
    const members = membersRaw.map(m => {
      const u = users.find(usr => usr.id === m.user_id) || {};
      return { id: m.id, user_id: u.id, name: u.name || "Student", college: u.college || "University", avatar_url: u.avatar_url || "", role_title: m.role_title, responsibilities: m.responsibilities };
    });

    const tasksRaw = JSON.parse(localStorage.getItem("collabcraft_tasks") || "[]").filter(t => t.project_id === pId);
    let doneCount = 0;
    const tasks = tasksRaw.map(t => {
      if (t.status === "done") doneCount++;
      const u = users.find(usr => usr.id === t.assigned_to_id);
      return { ...t, assigned_to: u ? { id: u.id, name: u.name, avatar_url: u.avatar_url } : null };
    });

    const totalTasks = tasks.length;
    const progress_percentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
    const resources = JSON.parse(localStorage.getItem("collabcraft_resources") || "[]").filter(r => r.project_id === pId);
    const discussionsRaw = JSON.parse(localStorage.getItem("collabcraft_discussions") || "[]").filter(d => d.project_id === pId);
    const discussions = discussionsRaw.map(d => {
      const sender = users.find(usr => usr.id === d.sender_id);
      return { ...d, sender_name: sender ? sender.name : "Student", sender_avatar: sender ? sender.avatar_url : "" };
    });

    return { project: { id: p.id, title: p.title, domain: p.domain, status: p.status, discord_link: p.discord_link, whatsapp_link: p.whatsapp_link }, progress_percentage, members, tasks, resources, discussions };
  }

  async addTask(taskData) {
    try {
      const res = await fetch(`${this.baseUrl}/tasks`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (e) {}

    let tasks = JSON.parse(localStorage.getItem("collabcraft_tasks") || "[]");
    const newTask = { id: tasks.length + 1, ...taskData, status: taskData.status || "pending", priority: taskData.priority || "medium" };
    tasks.push(newTask);
    localStorage.setItem("collabcraft_tasks", JSON.stringify(tasks));
    return { message: "Task created!", task_id: newTask.id };
  }

  async updateTaskStatus(taskId, status) {
    try {
      const res = await fetch(`${this.baseUrl}/tasks/${taskId}?status=${status}`, {
        method: "PUT",
        headers: this.getHeaders()
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (e) {}

    let tasks = JSON.parse(localStorage.getItem("collabcraft_tasks") || "[]");
    const idx = tasks.findIndex(t => t.id === parseInt(taskId));
    if (idx !== -1) {
      tasks[idx].status = status;
      localStorage.setItem("collabcraft_tasks", JSON.stringify(tasks));
    }
    return { message: "Task updated" };
  }

  async addResource(resData) {
    try {
      const res = await fetch(`${this.baseUrl}/resources`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(resData)
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (e) {}

    let resources = JSON.parse(localStorage.getItem("collabcraft_resources") || "[]");
    resources.push({ id: resources.length + 1, ...resData });
    localStorage.setItem("collabcraft_resources", JSON.stringify(resources));
    return { message: "Resource added" };
  }

  async addDiscussion(discData) {
    try {
      const res = await fetch(`${this.baseUrl}/discussions`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(discData)
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (e) {}

    const me = await this.getMe();
    let discussions = JSON.parse(localStorage.getItem("collabcraft_discussions") || "[]");
    discussions.push({ id: discussions.length + 1, ...discData, sender_id: me ? me.id : 1, created_at: new Date().toISOString() });
    localStorage.setItem("collabcraft_discussions", JSON.stringify(discussions));
    return { message: "Message posted" };
  }

  // 12. Completed Projects Showcase
  async getCompletedProjects() {
    try {
      const res = await fetch(`${this.baseUrl}/completed-projects`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return JSON.parse(localStorage.getItem("collabcraft_completed") || "[]");
  }

  async publishCompletedProject(cpData) {
    try {
      const res = await fetch(`${this.baseUrl}/completed-projects`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(cpData)
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (e) {}

    let completed = JSON.parse(localStorage.getItem("collabcraft_completed") || "[]");
    completed.unshift({ id: completed.length + 1, ...cpData, finished_at: new Date().toISOString() });
    localStorage.setItem("collabcraft_completed", JSON.stringify(completed));
    return { message: "Published to Showcase!" };
  }
}

const api = new ApiService();
