// UI Component Generator for all 12 modules

const Components = {
  // Helpers
  getDomainBadgeClass(domain) {
    switch ((domain || "").toLowerCase()) {
      case "ai/ml": return "badge-ai";
      case "web development": return "badge-web";
      case "mobile apps": return "badge-mobile";
      case "blockchain": return "badge-blockchain";
      case "iot": return "badge-iot";
      case "cybersecurity": return "badge-cyber";
      default: return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
    }
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case "recruiting": return "status-recruiting";
      case "in_progress": return "status-in_progress";
      case "completed": return "status-completed";
      default: return "bg-gray-700 text-gray-300";
    }
  },

  // 1. Project Discovery Card
  renderProjectCard(project) {
    const domainClass = this.getDomainBadgeClass(project.domain);
    const statusClass = this.getStatusBadgeClass(project.status);
    const author = project.author || {};
    const techStack = (project.tech_stack || "").split(",").map(t => t.trim()).filter(Boolean);

    let rolesList = project.required_roles || [];
    if (typeof rolesList === "string") {
      try { rolesList = JSON.parse(rolesList); } catch { rolesList = []; }
    }

    const openPositionsCount = rolesList.reduce((acc, r) => acc + (r.count - (r.filled || 0)), 0);

    return `
      <div class="glass-card rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${domainClass}">
              ${project.domain}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">
              ${project.status === 'recruiting' ? '🟢 Recruiting' : project.status === 'in_progress' ? '🔵 In Progress' : '🟣 Completed'}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
            ${project.title}
          </h3>

          <!-- Problem Statement -->
          <p class="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            <span class="text-indigo-400 font-semibold">Problem:</span> ${project.problem}
          </p>

          <!-- Required Roles Badges -->
          <div class="mb-4">
            <div class="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>Looking for (${openPositionsCount} spot${openPositionsCount === 1 ? '' : 's'} open)</span>
              <span class="text-slate-500">${project.difficulty || 'Intermediate'} • ${project.duration || '4 Weeks'}</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${rolesList.map(r => `
                <span class="px-2.5 py-1 rounded-md text-xs ${r.filled >= r.count ? 'bg-slate-800 text-slate-500 border border-slate-700/50 line-through' : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/50'}">
                  ${r.role} (${r.filled}/${r.count})
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Tech Stack -->
          <div class="flex flex-wrap gap-1 mb-6">
            ${techStack.slice(0, 4).map(tech => `
              <span class="px-2 py-0.5 rounded text-[11px] bg-slate-800/80 text-slate-400 border border-slate-700/40">
                ${tech}
              </span>
            `).join('')}
            ${techStack.length > 4 ? `<span class="px-2 py-0.5 rounded text-[11px] bg-slate-800/80 text-slate-400">+${techStack.length - 4}</span>` : ''}
          </div>
        </div>

        <!-- Footer / Author & CTA -->
        <div class="pt-4 border-t border-slate-800/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${author.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-8 h-8 rounded-full object-cover border border-indigo-500/30" alt="${author.name}">
            <div>
              <div class="text-xs font-semibold text-white">${author.name || 'Student Author'}</div>
              <div class="text-[11px] text-slate-400">${author.college || 'Global Student'}</div>
            </div>
          </div>

          <button onclick="App.viewProjectDetails(${project.id})" class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-all flex items-center gap-1">
            View Pitch & Join →
          </button>
        </div>
      </div>
    `;
  },

  // 2. Full Project Details Module View
  renderProjectDetails(project, currentUser, userRequests = []) {
    const author = project.author || {};
    const rolesList = project.required_roles || [];
    const members = project.members || [];
    const requests = project.join_requests || [];

    const isAuthor = currentUser && author.id === currentUser.id;
    const isMember = currentUser && members.some(m => m.user_id === currentUser.id);
    const existingReq = currentUser && requests.find(r => r.applicant_id === currentUser.id);

    return `
      <div class="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        <!-- Navigation Back -->
        <button onclick="App.showView('discover')" class="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2">
          ← Back to Project Discovery
        </button>

        <!-- Main Banner Header -->
        <div class="glass-card rounded-3xl p-8 relative overflow-hidden border border-indigo-500/20">
          <div class="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex items-center gap-2">
              <span class="px-3.5 py-1 rounded-full text-xs font-bold ${this.getDomainBadgeClass(project.domain)}">
                ${project.domain}
              </span>
              <span class="px-3.5 py-1 rounded-full text-xs font-semibold ${this.getStatusBadgeClass(project.status)}">
                ${project.status === 'recruiting' ? '🟢 Open for Applicants' : project.status === 'in_progress' ? '🔵 Team In Workspace' : '🟣 Completed'}
              </span>
            </div>
            <div class="text-xs text-slate-400 font-medium">
              Target Duration: <span class="text-white font-semibold">${project.duration}</span> • Difficulty: <span class="text-white font-semibold">${project.difficulty}</span>
            </div>
          </div>

          <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
            ${project.title}
          </h1>

          <!-- Author Mini Header -->
          <div class="flex items-center gap-4 py-3 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit mb-6">
            <img src="${author.avatar_url}" class="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/50" alt="${author.name}">
            <div>
              <div class="text-sm font-bold text-white flex items-center gap-2">
                ${author.name}
                <span class="text-xs font-normal px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/40">Author / Lead</span>
              </div>
              <div class="text-xs text-slate-400">${author.year_branch} • ${author.college}</div>
            </div>
            ${author.github_url ? `
              <a href="${author.github_url}" target="_blank" class="ml-2 text-slate-400 hover:text-indigo-400 text-xs font-medium underline flex items-center gap-1">
                GitHub ↗
              </a>
            ` : ''}
          </div>

          <!-- Key Action Button: [I WANT TO JOIN] -->
          <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div class="text-slate-300 text-sm">
              Team Size: <span class="font-bold text-white">${members.length}/${project.team_size} Members Joined</span>
            </div>

            <div>
              ${isAuthor ? `
                <button onclick="App.showWorkspace(${project.id})" class="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg glow-primary flex items-center gap-2">
                  🚀 Manage Project Workspace
                </button>
              ` : isMember ? `
                <button onclick="App.showWorkspace(${project.id})" class="px-6 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-2">
                  👥 Open Team Workspace
                </button>
              ` : existingReq ? `
                <div class="px-6 py-3 rounded-xl font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-2">
                  ⏳ Join Request Submitted (${existingReq.status.toUpperCase()})
                </div>
              ` : `
                <button onclick="App.openJoinModal(${project.id})" class="px-8 py-3.5 rounded-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-xl glow-primary transition-all transform hover:scale-105 flex items-center gap-2">
                  🤝 I WANT TO JOIN THIS PROJECT
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- Details Grid: Pitch & Requirements -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Detailed Description -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Problem & Solution Card -->
            <div class="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <h3 class="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
                  🎯 Problem Statement
                </h3>
                <p class="text-slate-200 leading-relaxed">${project.problem}</p>
              </div>

              <div class="pt-4 border-t border-slate-800">
                <h3 class="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  💡 Proposed Solution
                </h3>
                <p class="text-slate-200 leading-relaxed">${project.solution}</p>
              </div>

              ${project.description ? `
                <div class="pt-4 border-t border-slate-800">
                  <h3 class="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">
                    📖 Detailed Overview
                  </h3>
                  <p class="text-slate-300 leading-relaxed whitespace-pre-line">${project.description}</p>
                </div>
              ` : ''}
            </div>

            <!-- Motivation & Ideal Contributor -->
            <div class="glass-card rounded-2xl p-6 space-y-4">
              <h3 class="text-lg font-bold text-white mb-2">
                🚀 Why We Are Building This & Who We Need
              </h3>
              <div>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Motivation</span>
                <p class="text-slate-300 text-sm mt-1">${project.motivation || 'Build a impactful portfolio project with global student teammates.'}</p>
              </div>
              <div class="pt-3 border-t border-slate-800">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">What We Are Looking For</span>
                <p class="text-slate-300 text-sm mt-1">${project.looking_for || 'Collaborative, curious team players eager to build real software.'}</p>
              </div>
            </div>

            <!-- Author Full Profile Highlight -->
            <div class="glass-card rounded-2xl p-6">
              <h3 class="text-lg font-bold text-white mb-4">
                👤 About the Author
              </h3>
              <div class="flex items-start gap-4">
                <img src="${author.avatar_url}" class="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40" alt="${author.name}">
                <div class="space-y-2 flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="font-bold text-white text-lg">${author.name}</h4>
                    <span class="text-xs text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-800/50">${author.college}</span>
                  </div>
                  <p class="text-slate-300 text-sm">${author.bio}</p>
                  <div class="text-xs text-slate-400">
                    <strong class="text-slate-200">Skills:</strong> ${author.skills}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Required Roles & Current Team -->
          <div class="space-y-6">
            <!-- Open Roles -->
            <div class="glass-card rounded-2xl p-6">
              <h3 class="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>Looking for Teammates</span>
                <span class="text-xs text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">${rolesList.length} Roles</span>
              </h3>

              <div class="space-y-3">
                ${rolesList.map(r => `
                  <div class="p-3.5 rounded-xl ${r.filled >= r.count ? 'bg-slate-900/50 border border-slate-800 opacity-60' : 'bg-indigo-950/40 border border-indigo-500/30'} flex items-center justify-between">
                    <div>
                      <div class="text-sm font-bold text-white">${r.role}</div>
                      <div class="text-xs text-slate-400">${r.filled >= r.count ? 'Position Filled' : 'Spot Available'}</div>
                    </div>
                    <span class="px-2.5 py-1 rounded-md text-xs font-semibold ${r.filled >= r.count ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
                      ${r.filled}/${r.count} Filled
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Current Team Members Roster -->
            <div class="glass-card rounded-2xl p-6">
              <h3 class="text-lg font-bold text-white mb-4">
                👥 Current Team (${members.length})
              </h3>

              <div class="space-y-3">
                ${members.map(m => `
                  <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <img src="${m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-10 h-10 rounded-full object-cover border border-indigo-500/30" alt="${m.name}">
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold text-white truncate">${m.name}</div>
                      <div class="text-xs text-indigo-400 truncate">${m.role_title}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tech Stack List -->
            <div class="glass-card rounded-2xl p-6">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                🛠️ Proposed Tech Stack
              </h3>
              <div class="flex flex-wrap gap-2">
                ${(project.tech_stack || '').split(',').map(t => `
                  <span class="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                    ${t.trim()}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 3. User Profile Module View
  renderUserProfile(user, isCurrent = false) {
    return `
      <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div class="glass-card rounded-3xl p-8 border border-indigo-500/20 relative">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="flex items-center gap-6">
              <img src="${user.avatar_url}" class="w-24 h-24 rounded-2xl object-cover border-4 border-indigo-500/40 shadow-xl" alt="${user.name}">
              <div>
                <h1 class="text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
                  ${user.name}
                  ${isCurrent ? '<span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Your Profile</span>' : ''}
                </h1>
                <div class="text-indigo-400 font-semibold text-sm mb-1">${user.year_branch || 'Student Developer'}</div>
                <div class="text-slate-400 text-xs">${user.college}</div>
              </div>
            </div>

            ${isCurrent ? `
              <button onclick="App.openEditProfileModal()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all flex items-center gap-2">
                ✏️ Edit Profile
              </button>
            ` : ''}
          </div>

          <!-- Bio -->
          <div class="mt-6 pt-6 border-t border-slate-800">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About Me</h3>
            <p class="text-slate-200 text-sm leading-relaxed">${user.bio || 'No bio provided yet.'}</p>
          </div>
        </div>

        <!-- Profile Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
              ⚡ Skills & Tech Stack
            </h3>
            <div>
              <div class="text-xs text-slate-400 font-medium mb-1">Core Skills</div>
              <div class="text-sm font-semibold text-indigo-300">${user.skills}</div>
            </div>
            <div class="pt-3 border-t border-slate-800">
              <div class="text-xs text-slate-400 font-medium mb-1">Technologies Known</div>
              <div class="text-sm text-slate-200">${user.tech_stack}</div>
            </div>
            <div class="pt-3 border-t border-slate-800">
              <div class="text-xs text-slate-400 font-medium mb-1">Areas of Interest</div>
              <div class="text-sm text-slate-200">${user.interests}</div>
            </div>
          </div>

          <div class="glass-card rounded-2xl p-6 space-y-4">
            <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
              🎯 Project Goals & Links
            </h3>
            <div>
              <div class="text-xs text-slate-400 font-medium mb-1">Target Project Types</div>
              <div class="text-sm text-slate-200">${user.desired_projects}</div>
            </div>
            <div class="pt-3 border-t border-slate-800">
              <div class="text-xs text-slate-400 font-medium mb-1">Previous Work / Experience</div>
              <div class="text-sm text-slate-300">${user.previous_projects}</div>
            </div>
            <div class="pt-3 border-t border-slate-800 flex items-center gap-4">
              ${user.github_url ? `<a href="${user.github_url}" target="_blank" class="px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:text-white text-xs font-semibold border border-slate-700">GitHub Profile ↗</a>` : ''}
              ${user.portfolio_url ? `<a href="${user.portfolio_url}" target="_blank" class="px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:text-white text-xs font-semibold border border-slate-700">Portfolio Website ↗</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Project Workspace Module View
  renderWorkspace(workspace, activeTab = 'overview', currentUser) {
    const p = workspace.project || {};
    const members = workspace.members || [];
    const tasks = workspace.tasks || [];
    const resources = workspace.resources || [];
    const discussions = workspace.discussions || [];
    const progress = workspace.progress_percentage || 0;

    return `
      <div class="max-w-6xl mx-auto space-y-6 animate-fadeIn">
        <!-- Top Workspace Bar -->
        <div class="glass-card rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 border border-indigo-500/30">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <span>PROJECT WORKSPACE</span> • <span>${p.domain}</span>
            </div>
            <h1 class="text-2xl font-extrabold text-white">${p.title}</h1>
          </div>

          <!-- Overall Progress Widget -->
          <div class="flex items-center gap-4 bg-slate-900/80 px-5 py-3 rounded-2xl border border-slate-800">
            <div class="relative flex items-center justify-center w-12 h-12">
              <svg class="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#334155" stroke-width="4" fill="transparent"></circle>
                <circle cx="24" cy="24" r="20" stroke="#6366f1" stroke-width="4" fill="transparent"
                        stroke-dasharray="125.6" stroke-dashoffset="${125.6 - (125.6 * progress) / 100}"></circle>
              </svg>
              <span class="absolute text-xs font-bold text-white">${progress}%</span>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-300">Project Progress</div>
              <div class="text-[11px] text-slate-400">${tasks.filter(t => t.status === 'done').length} of ${tasks.length} Tasks Finished</div>
            </div>
          </div>
        </div>

        <!-- Workspace Tabs Navigation -->
        <div class="flex items-center border-b border-slate-800 gap-6 overflow-x-auto text-sm font-bold text-slate-400">
          <button onclick="App.setWorkspaceTab('overview')" class="py-3 px-1 transition-colors ${activeTab === 'overview' ? 'tab-active' : 'hover:text-white'} flex items-center gap-2">
            📌 Overview
          </button>
          <button onclick="App.setWorkspaceTab('tasks')" class="py-3 px-1 transition-colors ${activeTab === 'tasks' ? 'tab-active' : 'hover:text-white'} flex items-center gap-2">
            📋 Task Board (${tasks.length})
          </button>
          <button onclick="App.setWorkspaceTab('team')" class="py-3 px-1 transition-colors ${activeTab === 'team' ? 'tab-active' : 'hover:text-white'} flex items-center gap-2">
            👥 Members (${members.length})
          </button>
          <button onclick="App.setWorkspaceTab('chat')" class="py-3 px-1 transition-colors ${activeTab === 'chat' ? 'tab-active' : 'hover:text-white'} flex items-center gap-2">
            💬 Team Chat (${discussions.length})
          </button>
          <button onclick="App.setWorkspaceTab('resources')" class="py-3 px-1 transition-colors ${activeTab === 'resources' ? 'tab-active' : 'hover:text-white'} flex items-center gap-2">
            🔗 Resources (${resources.length})
          </button>
        </div>

        <!-- Active Tab Sub-view Content -->
        <div class="pt-2">
          ${activeTab === 'overview' ? this.renderWorkspaceOverview(workspace) : ''}
          ${activeTab === 'tasks' ? this.renderWorkspaceTasks(workspace, currentUser) : ''}
          ${activeTab === 'team' ? this.renderWorkspaceTeam(workspace) : ''}
          ${activeTab === 'chat' ? this.renderWorkspaceChat(workspace, currentUser) : ''}
          ${activeTab === 'resources' ? this.renderWorkspaceResources(workspace) : ''}
        </div>
      </div>
    `;
  },

  // 4a. Workspace Subtab: Overview & Milestones
  renderWorkspaceOverview(workspace) {
    const p = workspace.project;
    const progress = workspace.progress_percentage || 0;

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-3">Project Status & Goal</h3>
            <p class="text-slate-300 text-sm leading-relaxed mb-4">
              Team is actively building <strong>${p.title}</strong>. Follow task assignments and upload resources to keep milestones on schedule.
            </p>
            <div class="flex items-center gap-3">
              ${p.discord_link ? `<a href="${p.discord_link}" target="_blank" class="px-4 py-2 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold hover:bg-indigo-600 hover:text-white">Join Team Discord ↗</a>` : ''}
              ${p.whatsapp_link ? `<a href="${p.whatsapp_link}" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600 hover:text-white">WhatsApp Group ↗</a>` : ''}
            </div>
          </div>

          <!-- Milestones Checklist -->
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-4">📈 Milestones & Roadmap</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-sm font-semibold text-white">1. Idea Publishing & Team Formation</span>
                <span class="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">✅ Completed</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-sm font-semibold text-white">2. Architecture & Database Specs</span>
                <span class="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">✅ Completed</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-sm font-semibold text-white">3. Core Module & API Development</span>
                <span class="text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded border border-blue-800">🔄 In Progress</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-sm font-semibold text-white">4. QA Testing & Deployment</span>
                <span class="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">⏳ Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <h3 class="text-lg font-bold text-white mb-2">🏆 Finish & Publish Project</h3>
            <p class="text-xs text-slate-400">Once your team finishes the project, publish it to the global Portfolio Showcase!</p>
            <button onclick="App.openPublishShowcaseModal(${p.id})" class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg text-xs">
              ⭐ Publish to Portfolio Showcase
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 4b. Workspace Subtab: Task Management Kanban Board
  renderWorkspaceTasks(workspace, currentUser) {
    const tasks = workspace.tasks || [];
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-white">Interactive Kanban Task Board</h3>
          <button onclick="App.openAddTaskModal(${workspace.project.id})" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-1">
            + Create New Task
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Pending Column -->
          <div class="kanban-col space-y-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-amber-400">⏳ Pending (${pendingTasks.length})</span>
            </div>
            ${pendingTasks.map(t => this.renderTaskCard(t, workspace.project.id)).join('')}
            ${pendingTasks.length === 0 ? '<div class="text-xs text-slate-500 text-center py-8">No pending tasks</div>' : ''}
          </div>

          <!-- In Progress Column -->
          <div class="kanban-col space-y-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-blue-400">🔄 In Progress (${inProgressTasks.length})</span>
            </div>
            ${inProgressTasks.map(t => this.renderTaskCard(t, workspace.project.id)).join('')}
            ${inProgressTasks.length === 0 ? '<div class="text-xs text-slate-500 text-center py-8">No tasks in progress</div>' : ''}
          </div>

          <!-- Done Column -->
          <div class="kanban-col space-y-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-emerald-400">✅ Done (${doneTasks.length})</span>
            </div>
            ${doneTasks.map(t => this.renderTaskCard(t, workspace.project.id)).join('')}
            ${doneTasks.length === 0 ? '<div class="text-xs text-slate-500 text-center py-8">No completed tasks</div>' : ''}
          </div>
        </div>
      </div>
    `;
  },

  renderTaskCard(task, projectId) {
    const assignee = task.assigned_to || {};
    return `
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-bold text-white text-sm">${task.title}</h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${task.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'}">
            ${task.priority ? task.priority.toUpperCase() : 'MED'}
          </span>
        </div>
        ${task.description ? `<p class="text-xs text-slate-400 line-clamp-2">${task.description}</p>` : ''}

        <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div class="flex items-center gap-2">
            ${assignee.avatar_url ? `
              <img src="${assignee.avatar_url}" class="w-5 h-5 rounded-full object-cover" title="${assignee.name}">
              <span class="text-slate-300 text-[11px]">${assignee.name.split(' ')[0]}</span>
            ` : '<span class="text-slate-500 text-[11px]">Unassigned</span>'}
          </div>

          <!-- Status Move Dropdown -->
          <select onchange="App.moveTaskStatus(${task.id}, this.value, ${projectId})" class="bg-slate-800 text-slate-300 text-[11px] rounded px-2 py-1 border border-slate-700 cursor-pointer">
            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>🔄 In Progress</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>✅ Done</option>
          </select>
        </div>
      </div>
    `;
  },

  // 4c. Workspace Subtab: Team Roster
  renderWorkspaceTeam(workspace) {
    const members = workspace.members || [];

    return `
      <div class="glass-card rounded-2xl p-6 space-y-4">
        <h3 class="text-xl font-bold text-white mb-4">👥 Team Members & Role Responsibilities</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${members.map(m => `
            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <img src="${m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40" alt="${m.name}">
              <div class="space-y-1">
                <h4 class="font-bold text-white text-base">${m.name}</h4>
                <div class="text-xs font-semibold text-indigo-400">${m.role_title}</div>
                <div class="text-xs text-slate-400">${m.college}</div>
                <div class="text-xs text-slate-300 pt-2 border-t border-slate-800/60">${m.responsibilities || 'Active contributor'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 4d. Workspace Subtab: Team Chat & Announcements
  renderWorkspaceChat(workspace, currentUser) {
    const discussions = workspace.discussions || [];

    return `
      <div class="glass-card rounded-2xl p-6 space-y-4 flex flex-col h-[520px]">
        <div class="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>💬 Team Discussion & Announcements</span>
          <span class="text-xs text-slate-400">${discussions.length} Messages</span>
        </div>

        <!-- Message List -->
        <div id="chatMessagesBox" class="flex-1 overflow-y-auto space-y-4 pr-2">
          ${discussions.map(d => {
            const isMe = currentUser && d.sender_id === currentUser.id;
            return `
              <div class="flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}">
                <img src="${d.sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-8 h-8 rounded-full object-cover mt-1">
                <div class="max-w-md ${d.is_announcement ? 'chat-bubble-announcement p-4 w-full' : isMe ? 'chat-bubble-me p-3 text-white' : 'chat-bubble-them p-3 text-slate-200'}">
                  <div class="text-[11px] font-bold ${d.is_announcement ? 'text-amber-300' : isMe ? 'text-indigo-200' : 'text-indigo-400'} mb-1 flex items-center justify-between gap-4">
                    <span>${d.is_announcement ? '📢 ANNOUNCEMENT BY ' + d.sender_name : d.sender_name}</span>
                    <span class="text-[10px] text-slate-400 font-normal">${new Date(d.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p class="text-xs leading-relaxed whitespace-pre-line">${d.text}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Chat Input Form -->
        <form onsubmit="App.sendChatMessage(event, ${workspace.project.id})" class="flex items-center gap-2 pt-3 border-t border-slate-800">
          <input type="text" id="chatInputText" placeholder="Type a message or announcement..." required class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
          <label class="flex items-center gap-1 text-xs text-slate-400 cursor-pointer select-none">
            <input type="checkbox" id="chatIsAnnouncement" class="rounded bg-slate-900 border-slate-700"> 📢 Announce
          </label>
          <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white">Send</button>
        </form>
      </div>
    `;
  },

  // 4e. Workspace Subtab: Resources Hub
  renderWorkspaceResources(workspace) {
    const resources = workspace.resources || [];

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-white">🔗 Project Resource Repository</h3>
          <button onclick="App.openAddResourceModal(${workspace.project.id})" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg">
            + Add Resource Link
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${resources.map(r => `
            <div class="glass-card rounded-xl p-5 space-y-2 hover:border-indigo-500/40 transition-all">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">${r.category}</span>
                <a href="${r.url}" target="_blank" class="text-xs font-bold text-indigo-400 hover:underline">Open Link ↗</a>
              </div>
              <h4 class="font-bold text-white text-base">${r.title}</h4>
              <p class="text-xs text-slate-300">${r.description || r.url}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 5. Portfolio Showcase Card
  renderCompletedProjectCard(cp) {
    return `
      <div class="glass-card rounded-2xl p-6 space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              🏆 Completed Project
            </span>
            <span class="text-xs text-slate-400">${new Date(cp.finished_at).toLocaleDateString()}</span>
          </div>

          <h3 class="text-xl font-bold text-white mb-2">${cp.title}</h3>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">${cp.summary}</p>

          ${cp.key_learnings ? `
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs mb-4">
              <strong class="text-indigo-400">Key Learnings:</strong> ${cp.key_learnings}
            </div>
          ` : ''}

          <!-- Screenshots preview if available -->
          ${cp.screenshots && cp.screenshots.length > 0 ? `
            <div class="grid grid-cols-2 gap-2 mb-4">
              ${cp.screenshots.slice(0, 2).map(img => `
                <img src="${img.trim()}" class="w-full h-24 rounded-lg object-cover border border-slate-700">
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            ${(cp.team_members || []).slice(0, 3).map(m => `
              <img src="${m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-7 h-7 rounded-full object-cover border border-purple-500/40" title="${m.name} (${m.role})">
            `).join('')}
          </div>

          <div class="flex items-center gap-2">
            ${cp.github_url ? `<a href="${cp.github_url}" target="_blank" class="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white">GitHub ↗</a>` : ''}
            ${cp.demo_url ? `<a href="${cp.demo_url}" target="_blank" class="px-3 py-1.5 rounded-lg bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500 shadow-md">Live Demo ↗</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }
};
