// Main Application Controller & Event Routing (Production Auth Version)

const App = {
  currentView: 'discover',
  currentUser: null,
  currentProjectId: null,
  currentWorkspaceTab: 'overview',
  activeFilters: { domain: 'All', difficulty: 'All', search: '' },

  async init() {
    console.log("Initializing Production CollabCraft...");
    
    // Check if real user is logged in
    this.currentUser = await api.getMe();
    this.renderAuthUI();

    // Populate Domain Filter Buttons
    this.setupFilters();

    // Render Initial View
    this.showView('discover');
  },

  renderAuthUI() {
    const authBtnContainer = document.getElementById('navAuthActions');
    if (!authBtnContainer) return;

    if (this.currentUser) {
      authBtnContainer.innerHTML = `
        <div class="flex items-center gap-3">
          <div onclick="App.showView('profile')" class="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl px-3 py-1.5 cursor-pointer">
            <img src="${this.currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-6 h-6 rounded-full object-cover border border-indigo-500">
            <span class="text-xs font-bold text-white max-w-[120px] truncate">${this.currentUser.name}</span>
          </div>
          <button onclick="App.logout()" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-all">
            Log Out
          </button>
        </div>
      `;
    } else {
      authBtnContainer.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="App.openLoginModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700">
            Log In
          </button>
          <button onclick="App.openRegisterModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md glow-primary">
            Sign Up
          </button>
        </div>
      `;
    }
  },

  async logout() {
    api.logout();
    this.currentUser = null;
    this.renderAuthUI();
    this.showToast("Logged out successfully", "info");
    this.showView('discover');
  },

  showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-2xl z-50 transition-all duration-300 transform translate-y-4 opacity-0 flex items-center gap-2 ${
      type === 'success' ? 'bg-emerald-600' : type === 'info' ? 'bg-indigo-600' : 'bg-amber-600'
    }`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'info' ? 'ℹ️' : '⚠️'}</span> ${msg}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    }, 50);

    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  setupFilters() {
    const domains = ["All", "AI/ML", "Web Development", "Mobile Apps", "Blockchain", "IoT", "Cybersecurity", "Game Development"];
    const container = document.getElementById('domainFiltersContainer');
    if (!container) return;

    container.innerHTML = domains.map(d => `
      <button onclick="App.setDomainFilter('${d}')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
        this.activeFilters.domain === d ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
      }">
        ${d}
      </button>
    `).join('');
  },

  setDomainFilter(domain) {
    this.activeFilters.domain = domain;
    this.setupFilters();
    this.renderDiscoverView();
  },

  setSearchFilter(query) {
    this.activeFilters.search = query;
    this.renderDiscoverView();
  },

  showView(viewName) {
    this.currentView = viewName;

    // Check auth for protected views
    if ((viewName === 'profile' || viewName === 'my_projects') && !this.currentUser) {
      this.showToast("Please log in or sign up to access your profile & projects.", "info");
      this.openLoginModal();
      return;
    }

    document.querySelectorAll('.view-container').forEach(el => el.classList.add('hidden'));

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('text-indigo-400', 'border-b-2', 'border-indigo-500');
    });

    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) activeNav.classList.add('text-indigo-400', 'border-b-2', 'border-indigo-500');

    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.remove('hidden');

    if (viewName === 'discover') this.renderDiscoverView();
    else if (viewName === 'profile') this.renderProfileView();
    else if (viewName === 'my_projects') this.renderMyProjectsView();
    else if (viewName === 'showcase') this.renderShowcaseView();
  },

  async renderDiscoverView() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">Loading live projects...</div>';

    const projects = await api.getProjects(this.activeFilters);

    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <div class="text-3xl">💡</div>
          <h3 class="text-lg font-bold text-white">No projects published yet</h3>
          <p class="text-xs">Be the first student to publish your project idea!</p>
          <button onclick="App.openPublishModal()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white inline-block mt-2">
            Publish Idea Now
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = projects.map(p => Components.renderProjectCard(p)).join('');
  },

  async viewProjectDetails(projectId) {
    this.currentProjectId = projectId;
    this.currentView = 'details';

    document.querySelectorAll('.view-container').forEach(el => el.classList.add('hidden'));
    const container = document.getElementById('view-details');
    container.classList.remove('hidden');

    container.innerHTML = '<div class="text-center py-16 text-slate-400">Loading project details...</div>';

    const project = await api.getProjectDetails(projectId);
    if (!project) {
      container.innerHTML = '<div class="text-center py-16 text-red-400">Project not found</div>';
      return;
    }

    container.innerHTML = Components.renderProjectDetails(project, this.currentUser);
  },

  async showWorkspace(projectId) {
    if (!this.currentUser) {
      this.showToast("Please log in to view project workspace.", "info");
      this.openLoginModal();
      return;
    }

    this.currentProjectId = projectId;
    this.currentView = 'workspace';

    document.querySelectorAll('.view-container').forEach(el => el.classList.add('hidden'));
    const container = document.getElementById('view-workspace');
    container.classList.remove('hidden');

    container.innerHTML = '<div class="text-center py-16 text-slate-400">Opening team workspace...</div>';

    const workspaceData = await api.getWorkspaceData(projectId);
    container.innerHTML = Components.renderWorkspace(workspaceData, this.currentWorkspaceTab, this.currentUser);
  },

  async setWorkspaceTab(tabName) {
    this.currentWorkspaceTab = tabName;
    await this.showWorkspace(this.currentProjectId);
  },

  async renderProfileView() {
    const container = document.getElementById('view-profile');
    if (!container) return;
    if (!this.currentUser) return;
    container.innerHTML = Components.renderUserProfile(this.currentUser, true);
  },

  async renderMyProjectsView() {
    const container = document.getElementById('view-my_projects');
    if (!container) return;
    if (!this.currentUser) return;

    container.innerHTML = '<div class="text-center py-12 text-slate-400">Loading your project workspace & requests...</div>';

    const allProjects = await api.getProjects();
    const myAuthored = allProjects.filter(p => p.author && p.author.id === this.currentUser.id);

    const userWorkspacePromises = allProjects.map(p => api.getProjectDetails(p.id));
    const fullProjects = await Promise.all(userWorkspacePromises);
    
    const myJoined = fullProjects.filter(p => p && p.members && p.members.some(m => m.user_id === this.currentUser.id) && p.author.id !== this.currentUser.id);

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-white mb-1">My Projects & Incoming Requests</h1>
            <p class="text-xs text-slate-400">Manage your published project ideas and active team memberships.</p>
          </div>
          <button onclick="App.openPublishModal()" class="px-5 py-3 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg glow-primary">
            + Publish New Project Idea
          </button>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            💡 Projects You Authored (${myAuthored.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${myAuthored.map(p => Components.renderProjectCard(p)).join('')}
            ${myAuthored.length === 0 ? '<div class="glass-card rounded-2xl p-6 text-center text-slate-400 text-xs">You haven\'t published any projects yet.</div>' : ''}
          </div>
        </div>

        <div class="glass-card rounded-3xl p-6 space-y-4 border border-indigo-500/30">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            🤝 Incoming Join Requests for Your Projects
          </h2>
          <div id="incomingRequestsContainer" class="space-y-3">
            ${await this.renderIncomingRequestsList(myAuthored)}
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            👥 Projects You Are Collaborating On (${myJoined.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${myJoined.map(p => Components.renderProjectCard(p)).join('')}
            ${myJoined.length === 0 ? '<div class="glass-card rounded-2xl p-6 text-center text-slate-400 text-xs">You are not a member of any other project teams yet. Discover projects and click "I Want to Join"!</div>' : ''}
          </div>
        </div>
      </div>
    `;
  },

  async renderIncomingRequestsList(authoredProjects) {
    let html = '';
    let totalReqs = 0;

    for (let proj of authoredProjects) {
      const details = await api.getProjectDetails(proj.id);
      if (details && details.join_requests && details.join_requests.length > 0) {
        for (let req of details.join_requests) {
          totalReqs++;
          html += `
            <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-start gap-4">
                <img src="${req.applicant_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-12 h-12 rounded-full object-cover border border-indigo-500/40" alt="${req.applicant_name}">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${req.applicant_name}</span>
                    <span class="text-xs text-indigo-400 font-semibold bg-indigo-950 px-2 py-0.5 rounded">Role: ${req.role_applied}</span>
                  </div>
                  <div class="text-xs text-slate-400">${req.applicant_college} • Pitching for: <strong>${proj.title}</strong></div>
                  <p class="text-xs text-slate-300 italic pt-1">"${req.pitch_message}"</p>
                </div>
              </div>

              <div class="flex items-center gap-2 self-end md:self-center">
                ${req.status === 'pending' ? `
                  <button onclick="App.handleRequestAction(${req.id}, 'accept')" class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
                    Accept & Add to Team
                  </button>
                  <button onclick="App.handleRequestAction(${req.id}, 'reject')" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400">
                    Decline
                  </button>
                ` : `
                  <span class="px-3 py-1 rounded-xl text-xs font-bold ${req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}">
                    ${req.status.toUpperCase()}
                  </span>
                `}
              </div>
            </div>
          `;
        }
      }
    }

    if (totalReqs === 0) {
      return '<div class="text-xs text-slate-500 py-4 text-center">No incoming join requests right now.</div>';
    }
    return html;
  },

  async handleRequestAction(requestId, action) {
    try {
      const res = await api.processJoinRequest(requestId, action);
      this.showToast(res.message, action === 'accept' ? 'success' : 'info');
      this.renderMyProjectsView();
    } catch (e) {
      this.showToast(e.message, 'warning');
    }
  },

  async renderShowcaseView() {
    const grid = document.getElementById('showcaseGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">Loading portfolio showcase...</div>';

    const completed = await api.getCompletedProjects();
    if (completed.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">No completed projects in the showcase yet.</div>';
      return;
    }
    grid.innerHTML = completed.map(cp => Components.renderCompletedProjectCard(cp)).join('');
  },

  // Auth Modals
  openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
  },
  closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await api.login({ email, password });
      this.currentUser = res.user;
      this.renderAuthUI();
      this.closeLoginModal();
      this.showToast(`Welcome back, ${res.user.name}!`);
      this.showView('discover');
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  openRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
  },
  closeRegisterModal() {
    document.getElementById('registerModal').classList.add('hidden');
  },

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value,
      college: document.getElementById('regCollege').value,
      year_branch: document.getElementById('regYearBranch').value,
      skills: document.getElementById('regSkills').value,
      tech_stack: document.getElementById('regTechStack').value,
      interests: document.getElementById('regInterests').value,
      bio: document.getElementById('regBio').value,
      github_url: document.getElementById('regGithub').value,
      portfolio_url: document.getElementById('regPortfolio').value,
      desired_projects: document.getElementById('regDesiredProjects').value
    };

    try {
      const res = await api.register(data);
      this.currentUser = res.user;
      this.renderAuthUI();
      this.closeRegisterModal();
      this.showToast("Account created successfully! Welcome to CollabCraft.");
      this.showView('discover');
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  // Publish Modal
  openPublishModal() {
    if (!this.currentUser) {
      this.showToast("Please log in or sign up to publish a project idea.", "info");
      this.openLoginModal();
      return;
    }
    document.getElementById('publishModal').classList.remove('hidden');
  },
  closePublishModal() {
    document.getElementById('publishModal').classList.add('hidden');
  },

  async handlePublishSubmit(e) {
    e.preventDefault();
    const rolesStr = document.getElementById('pubRolesInput').value;
    const rolesList = rolesStr.split(',').map(r => ({ role: r.trim(), count: 1, filled: 0 }));

    const data = {
      title: document.getElementById('pubTitle').value,
      problem: document.getElementById('pubProblem').value,
      solution: document.getElementById('pubSolution').value,
      description: document.getElementById('pubDescription').value,
      domain: document.getElementById('pubDomain').value,
      tech_stack: document.getElementById('pubTechStack').value,
      required_roles: JSON.stringify(rolesList),
      team_size: parseInt(document.getElementById('pubTeamSize').value),
      duration: document.getElementById('pubDuration').value,
      difficulty: document.getElementById('pubDifficulty').value,
      motivation: document.getElementById('pubMotivation').value,
      looking_for: document.getElementById('pubLookingFor').value
    };

    try {
      const res = await api.publishProject(data);
      this.showToast("Project idea published successfully!");
      this.closePublishModal();
      this.showView('discover');
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  openJoinModal(projectId) {
    if (!this.currentUser) {
      this.showToast("Please log in or sign up to express interest in joining a project.", "info");
      this.openLoginModal();
      return;
    }
    this.currentProjectId = projectId;
    document.getElementById('joinModal').classList.remove('hidden');
  },
  closeJoinModal() {
    document.getElementById('joinModal').classList.add('hidden');
  },

  async handleJoinSubmit(e) {
    e.preventDefault();
    const data = {
      project_id: this.currentProjectId,
      role_applied: document.getElementById('joinRoleApplied').value,
      pitch_message: document.getElementById('joinPitchMessage').value
    };

    try {
      const res = await api.createJoinRequest(data);
      this.showToast(res.message);
      this.closeJoinModal();
      this.viewProjectDetails(this.currentProjectId);
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  openAddTaskModal(projectId) {
    this.currentProjectId = projectId;
    document.getElementById('addTaskModal').classList.remove('hidden');
  },
  closeAddTaskModal() {
    document.getElementById('addTaskModal').classList.add('hidden');
  },

  async handleAddTaskSubmit(e) {
    e.preventDefault();
    const data = {
      project_id: this.currentProjectId,
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      priority: document.getElementById('taskPriority').value
    };

    try {
      await api.addTask(data);
      this.showToast("Task created successfully!");
      this.closeAddTaskModal();
      this.showWorkspace(this.currentProjectId);
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  async moveTaskStatus(taskId, status, projectId) {
    try {
      await api.updateTaskStatus(taskId, status);
      this.showToast("Task status updated!");
      this.showWorkspace(projectId);
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  openAddResourceModal(projectId) {
    this.currentProjectId = projectId;
    document.getElementById('addResourceModal').classList.remove('hidden');
  },
  closeAddResourceModal() {
    document.getElementById('addResourceModal').classList.add('hidden');
  },

  async handleAddResourceSubmit(e) {
    e.preventDefault();
    const data = {
      project_id: this.currentProjectId,
      title: document.getElementById('resTitle').value,
      category: document.getElementById('resCategory').value,
      url: document.getElementById('resUrl').value,
      description: document.getElementById('resDesc').value
    };

    try {
      await api.addResource(data);
      this.showToast("Resource added!");
      this.closeAddResourceModal();
      this.showWorkspace(this.currentProjectId);
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  async sendChatMessage(e, projectId) {
    e.preventDefault();
    const textInput = document.getElementById('chatInputText');
    const isAnnounceCheckbox = document.getElementById('chatIsAnnouncement');

    if (!textInput.value.trim()) return;

    const data = {
      project_id: projectId,
      text: textInput.value,
      is_announcement: isAnnounceCheckbox.checked
    };

    try {
      await api.addDiscussion(data);
      textInput.value = '';
      isAnnounceCheckbox.checked = false;
      this.showWorkspace(projectId);
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  },

  openPublishShowcaseModal(projectId) {
    this.currentProjectId = projectId;
    document.getElementById('publishShowcaseModal').classList.remove('hidden');
  },
  closePublishShowcaseModal() {
    document.getElementById('publishShowcaseModal').classList.add('hidden');
  },

  async handlePublishShowcaseSubmit(e) {
    e.preventDefault();
    const data = {
      project_id: this.currentProjectId,
      title: document.getElementById('showcaseTitle').value,
      summary: document.getElementById('showcaseSummary').value,
      demo_url: document.getElementById('showcaseDemoUrl').value,
      github_url: document.getElementById('showcaseGithubUrl').value,
      key_learnings: document.getElementById('showcaseLearnings').value,
      screenshots: document.getElementById('showcaseScreenshots').value
    };

    try {
      await api.publishCompletedProject(data);
      this.showToast("Published to Portfolio Showcase!");
      this.closePublishShowcaseModal();
      this.showView('showcase');
    } catch (err) {
      this.showToast(err.message, 'warning');
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
