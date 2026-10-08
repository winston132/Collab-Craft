// Production API Adapter with JWT Bearer Auth & Headers

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
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    localStorage.setItem("collabcraft_token", data.access_token);
    return data;
  }

  async login(credentials) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    localStorage.setItem("collabcraft_token", data.access_token);
    return data;
  }

  async getMe() {
    const token = localStorage.getItem("collabcraft_token");
    if (!token) return null;
    try {
      const res = await fetch(`${this.baseUrl}/auth/me`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  logout() {
    localStorage.removeItem("collabcraft_token");
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
    const res = await fetch(`${this.baseUrl}/users/me`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to update profile");
    return data;
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
    const res = await fetch(`${this.baseUrl}/projects`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(projectData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to publish project");
    return data;
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
      return {
        id: m.id, user_id: u.id, name: u.name || "Student", college: u.college || "University", avatar_url: u.avatar_url || "", role_title: m.role_title, responsibilities: m.responsibilities, joined_at: m.joined_at
      };
    });

    const requestsRaw = JSON.parse(localStorage.getItem("collabcraft_join_requests") || "[]").filter(r => r.project_id === pId);
    const join_requests = requestsRaw.map(r => {
      const u = users.find(usr => usr.id === r.applicant_id) || {};
      return {
        id: r.id, applicant_id: u.id, applicant_name: u.name || "Student", applicant_college: u.college || "University", applicant_skills: u.skills || "", applicant_avatar: u.avatar_url || "", role_applied: r.role_applied, pitch_message: r.pitch_message, status: r.status, created_at: r.created_at
      };
    });

    let reqRoles = p.required_roles;
    if (typeof reqRoles === "string") {
      try { reqRoles = JSON.parse(reqRoles); } catch { reqRoles = []; }
    }

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
    const res = await fetch(`${this.baseUrl}/join-requests`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(reqData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to submit request");
    return data;
  }

  async processJoinRequest(requestId, action) {
    const res = await fetch(`${this.baseUrl}/join-requests/${requestId}/action?action=${action}`, {
      method: "POST",
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Action failed");
    return data;
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

    return {
      project: { id: p.id, title: p.title, domain: p.domain, status: p.status, discord_link: p.discord_link, whatsapp_link: p.whatsapp_link },
      progress_percentage,
      members,
      tasks,
      resources,
      discussions
    };
  }

  async addTask(taskData) {
    const res = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(taskData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to create task");
    return data;
  }

  async updateTaskStatus(taskId, status) {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}?status=${status}`, {
      method: "PUT",
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to update task");
    return data;
  }

  async addResource(resData) {
    const res = await fetch(`${this.baseUrl}/resources`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(resData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to add resource");
    return data;
  }

  async addDiscussion(discData) {
    const res = await fetch(`${this.baseUrl}/discussions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(discData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to post message");
    return data;
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
    const res = await fetch(`${this.baseUrl}/completed-projects`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(cpData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to publish showcase");
    return data;
  }
}

const api = new ApiService();
