// Client-side Initial Seed Data & Fallback Storage Engine

const INITIAL_USERS = [
  {
    id: 1,
    name: "Arun Sharma",
    email: "arun.sharma@iitb.ac.in",
    college: "IIT Bombay",
    year_branch: "3rd Year, Computer Science",
    skills: "Python, PyTorch, FastApi, Machine Learning, Data Structures",
    tech_stack: "Python, Scikit-Learn, FastAPI, SQLite, Git",
    interests: "Natural Language Processing, LLM Agents, EdTech",
    bio: "Passionate AI enthusiast fascinated by building impactful NLP tools for students. Looking for enthusiastic frontend and design collaborators!",
    previous_projects: "Smart Notes Summarizer (Hackathon 1st Place), Automated PDF Parser",
    github_url: "https://github.com/arun-sharma-ai",
    portfolio_url: "https://arun-sharma.dev",
    desired_projects: "AI-driven developer tools, EdTech platforms, Intelligent Search",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Rahul Verma",
    email: "rverma@stanford.edu",
    college: "Stanford University",
    year_branch: "4th Year, Computer Science",
    skills: "Node.js, Express, PostgreSQL, Docker, Microservices",
    tech_stack: "JavaScript, TypeScript, Node.js, PostgreSQL, Redis",
    interests: "Scalable Web Systems, Backend Architecture, Cloud Computing",
    bio: "Full-stack engineer focusing on clean API design, scalable databases, and performance tuning.",
    previous_projects: "High-throughput Chat Engine, Campus Ride Share Backend",
    github_url: "https://github.com/rahulv-dev",
    portfolio_url: "https://rahulverma.io",
    desired_projects: "Distributed web systems, Realtime collaboration platforms",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Priya Patel",
    email: "ppatel@mit.edu",
    college: "MIT (Massachusetts Institute of Technology)",
    year_branch: "3rd Year, EECS",
    skills: "React, Next.js, Tailwind CSS, TypeScript, UI Components",
    tech_stack: "React, Tailwind CSS, Redux Toolkit, Vite, Jest",
    interests: "Frontend Architecture, Interactive UI, Accessibility, Web Performance",
    bio: "Loves designing pixel-perfect, lightning-fast interfaces. Big fan of Tailwind CSS and Framer Motion.",
    previous_projects: "Interactive Data Viz Dashboard, Student Task Manager UI",
    github_url: "https://github.com/priyapatel-ui",
    portfolio_url: "https://priyapatel.design",
    desired_projects: "Modern React web apps, Collaborative whiteboards, Generative UI",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Kiran Kumar",
    email: "kiran.k@ethz.ch",
    college: "ETH Zurich",
    year_branch: "MS Data Science & Interaction",
    skills: "Figma, UI/UX Design, Wireframing, Design Systems, User Research",
    tech_stack: "Figma, Adobe XD, HTML/CSS, Storybook",
    interests: "Human-Computer Interaction, Product Design, Visual Identity",
    bio: "Product designer bridging aesthetic minimalism and ergonomic user journeys. Always eager to team up on intuitive student products.",
    previous_projects: "ETH Campus Mobile App Redesign, Visual Analytics Suite",
    github_url: "https://github.com/kirankumar-ux",
    portfolio_url: "https://dribbble.com/kirankumar",
    desired_projects: "FinTech for students, Productivity tools, Gamified learning apps",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "Elena Rostova",
    email: "elena.r@tum.de",
    college: "TU Munich",
    year_branch: "2nd Year, Informatics",
    skills: "Flutter, Dart, Firebase, iOS/Android, REST APIs",
    tech_stack: "Flutter, Dart, Firebase Auth, Firestore, Git",
    interests: "Cross-platform Mobile Development, Sustainability, Green Tech",
    bio: "Mobile app builder on a mission to build software that promotes eco-friendly habits.",
    previous_projects: "Recycle Finder App, Campus Food Waste Alert",
    github_url: "https://github.com/elena-rostova",
    portfolio_url: "https://elena-apps.dev",
    desired_projects: "Mobile social platforms, Sustainability trackers, Fitness tech",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: "Marcus Vance",
    email: "marcus.vance@ox.ac.uk",
    college: "University of Oxford",
    year_branch: "3rd Year, Software Engineering",
    skills: "Solidity, Web3.js, Rust, Smart Contracts, Security",
    tech_stack: "Solidity, Hardhat, Ethers.js, Rust, React",
    interests: "Decentralized Identity, Cryptographic Systems, Peer-to-Peer Networks",
    bio: "Blockchain researcher building trustless verification engines for academic credentials and student achievements.",
    previous_projects: "Zero-Knowledge Student ID Verifier, Decentralized Grant Allocator",
    github_url: "https://github.com/marcusvance-crypto",
    portfolio_url: "https://marcusvance.eth",
    desired_projects: "Web3 academic protocols, Decentralized governance, Security tools",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  }
];

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "AI Resume Analyzer & Career Guidance Engine",
    problem: "Students struggle to get targeted feedback on their resumes and match their skills with real-world job role requirements.",
    solution: "An AI-powered web app that parses resumes, extracts key skills using NLP, calculates match scores for target roles, and generates personalized improvement suggestions.",
    description: "We are building an intuitive platform where students upload PDF resumes, select target roles (e.g. Frontend Engineer, ML Specialist), and receive granular feedback on missing keywords, formatting, and project positioning.",
    domain: "AI/ML",
    tech_stack: "Python, FastAPI, PyTorch, React, Tailwind CSS, SQLite",
    required_roles: [
      { role: "Python/ML Lead", count: 1, filled: 1 },
      { role: "Backend Engineer", count: 1, filled: 1 },
      { role: "React Frontend Dev", count: 1, filled: 1 },
      { role: "UI/UX Designer", count: 1, filled: 1 }
    ],
    team_size: 4,
    duration: "4 Weeks",
    difficulty: "Intermediate",
    motivation: "Help fellow students worldwide improve their hiring odds for tech internships and graduate roles.",
    looking_for: "Motivated developers interested in NLP, modern React UI, and clean REST APIs.",
    author_id: 1,
    status: "in_progress",
    discord_link: "https://discord.gg/example-resume-ai",
    whatsapp_link: "https://chat.whatsapp.com/example-resume-ai",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 2,
    title: "EcoTrack - Campus Carbon Footprint & Waste Tracker",
    problem: "University campuses produce significant carbon waste, but students lack real-time visibility into their daily personal and campus environmental impact.",
    solution: "A cross-platform mobile app that gamifies eco-friendly daily actions (biking, recycling, energy saving) with peer leaderboard challenges.",
    description: "EcoTrack rewards students with points for verified green choices, integrates campus dining waste data, and displays localized carbon saved metrics.",
    domain: "Mobile Apps",
    tech_stack: "Flutter, Dart, Node.js, Express, Firebase, Chart.js",
    required_roles: [
      { role: "Flutter Developer", count: 1, filled: 1 },
      { role: "Node.js Backend Dev", count: 1, filled: 0 },
      { role: "Data Analyst / ML", count: 1, filled: 0 },
      { role: "UI/UX Designer", count: 1, filled: 0 }
    ],
    team_size: 4,
    duration: "6 Weeks",
    difficulty: "Beginner",
    motivation: "Inspire eco-conscious behavior among university students globally.",
    looking_for: "Flutter enthusiasts, backend API builders, and passionate UX designers.",
    author_id: 5,
    status: "recruiting",
    discord_link: "https://discord.gg/ecotrack-app",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 3,
    title: "VeriCert - Decentralized Student Academic Credential Ledger",
    problem: "Verification of international academic diplomas, certificates, and research credits takes weeks of manual bureaucracy.",
    solution: "An immutable Web3 ledger where universities issue tamper-proof soulbound tokens representing verified course completion and project badges.",
    description: "VeriCert allows students to instantly share cryptographically verified project certificates with global employers without third-party fees.",
    domain: "Blockchain",
    tech_stack: "Solidity, Ethereum, Hardhat, Ethers.js, React, IPFS",
    required_roles: [
      { role: "Solidity Smart Contract Dev", count: 1, filled: 1 },
      { role: "React Web3 Frontend Dev", count: 1, filled: 0 },
      { role: "Security & Audit Lead", count: 1, filled: 0 }
    ],
    team_size: 3,
    duration: "5 Weeks",
    difficulty: "Advanced",
    motivation: "Streamline global academic credit transfers and eliminate degree fraud.",
    looking_for: "Students passionate about Ethereum smart contracts, Web3 frontends, and cryptographic protocols.",
    author_id: 6,
    status: "recruiting",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 4,
    title: "Quantum Summarizer - Lecture Video Keyframe & Transcript AI",
    problem: "Long recorded university lectures are tedious to review when searching for specific key concepts or exam topics.",
    solution: "An automated tool that ingests lecture video URLs, transcribes speech, extracts key visual slides, and builds interactive searchable chapters.",
    description: "Integrates Whisper AI for speech-to-text, keyframe extraction algorithms, and semantic vector search so students can query lecture moments directly.",
    domain: "AI/ML",
    tech_stack: "Python, Whisper AI, OpenCV, FastAPI, React, Tailwind CSS",
    required_roles: [
      { role: "Computer Vision / PyTorch", count: 1, filled: 1 },
      { role: "FastAPI & Video Stream Dev", count: 1, filled: 0 },
      { role: "React Web UI Dev", count: 1, filled: 1 }
    ],
    team_size: 3,
    duration: "4 Weeks",
    difficulty: "Advanced",
    motivation: "Revolutionize how students review 2-hour lecture recordings during finals week.",
    looking_for: "Python AI developer comfortable with OpenCV/Whisper and video streaming APIs.",
    author_id: 3,
    status: "recruiting",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const INITIAL_TEAM_MEMBERS = [
  { id: 1, project_id: 1, user_id: 1, role_title: "Python/ML Lead", responsibilities: "Train resume parsing model & build FastAPI scoring endpoints", joined_at: new Date().toISOString() },
  { id: 2, project_id: 1, user_id: 2, role_title: "Backend Engineer", responsibilities: "Architect database schemas, authentication & file storage APIs", joined_at: new Date().toISOString() },
  { id: 3, project_id: 1, user_id: 3, role_title: "React Frontend Dev", responsibilities: "Build interactive resume uploader, score dashboard, & feedback UI", joined_at: new Date().toISOString() },
  { id: 4, project_id: 1, user_id: 4, role_title: "UI/UX Designer", responsibilities: "Design Figma wireframes, visual component library & user flow", joined_at: new Date().toISOString() },
  { id: 5, project_id: 2, user_id: 5, role_title: "Flutter Lead", responsibilities: "Mobile application architecture and UI widgets", joined_at: new Date().toISOString() },
  { id: 6, project_id: 3, user_id: 6, role_title: "Solidity Lead", responsibilities: "Smart contract deployment and verification testing", joined_at: new Date().toISOString() }
];

const INITIAL_JOIN_REQUESTS = [
  {
    id: 1,
    project_id: 2,
    applicant_id: 2,
    role_applied: "Node.js Backend Dev",
    pitch_message: "Hi Elena! I have extensive experience building Express.js REST APIs and PostgreSQL databases for mobile backends. I'd love to handle EcoTrack's API server!",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 2,
    project_id: 2,
    applicant_id: 4,
    role_applied: "UI/UX Designer",
    pitch_message: "Hey Elena, I checked out EcoTrack's mission and love green tech! I can design an intuitive Figma prototype with custom gamification badges and micro-interactions.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 3,
    project_id: 3,
    applicant_id: 3,
    role_applied: "React Web3 Frontend Dev",
    pitch_message: "Hi Marcus, I'm building React frontends with Ethers.js and Tailwind CSS. Would love to contribute to VeriCert's student credentials web interface!",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const INITIAL_TASKS = [
  { id: 1, project_id: 1, title: "Design PostgreSQL Database Schema", description: "Define tables for Users, Resumes, Feedback Logs, and Skill Badges", assigned_to_id: 2, status: "done", priority: "high", due_date: "2026-10-02" },
  { id: 2, project_id: 1, title: "Create Figma Design Tokens & Component Specs", description: "Color palettes, typography, card layouts, and upload dropzone state designs", assigned_to_id: 4, status: "done", priority: "medium", due_date: "2026-10-03" },
  { id: 3, project_id: 1, title: "Implement JWT Authentication & User Sessions", description: "Backend endpoints for login, signup, and token verification", assigned_to_id: 2, status: "in_progress", priority: "high", due_date: "2026-10-10" },
  { id: 4, project_id: 1, title: "Train SpaCy NLP Model for Skill Extraction", description: "Extract technologies, tools, and experience metrics from raw PDF text", assigned_to_id: 1, status: "in_progress", priority: "high", due_date: "2026-10-12" },
  { id: 5, project_id: 1, title: "Build Resume Analysis Results Dashboard UI", description: "Interactive circular score chart, missing keyword pill tags, and action items list", assigned_to_id: 3, status: "in_progress", priority: "medium", due_date: "2026-10-14" },
  { id: 6, project_id: 1, title: "Deploy Staging Build to Vercel & Render", description: "Set up automated CI/CD pipeline for frontend and API server", assigned_to_id: 2, status: "pending", priority: "low", due_date: "2026-10-20" }
];

const INITIAL_RESOURCES = [
  { id: 1, project_id: 1, title: "GitHub Repository", category: "github", url: "https://github.com/arun-sharma-ai/ai-resume-analyzer", description: "Main source code repository containing FastAPI backend and React frontend." },
  { id: 2, project_id: 1, title: "Figma UI Workspace", category: "figma", url: "https://figma.com/@student-collab/ai-resume-analyzer", description: "Complete UI/UX design mockups, design system components, and wireframes." },
  { id: 3, project_id: 1, title: "Resume Dataset & Benchmarks", category: "dataset", url: "https://huggingface.co/datasets/tech-resumes-annotated", description: "Annotated tech dataset for training skill extraction NLP pipelines." },
  { id: 4, project_id: 1, title: "FastAPI Swagger Documentation", category: "docs", url: "http://localhost:8000/docs", description: "Interactive REST API endpoint specification and model schemas." }
];

const INITIAL_DISCUSSIONS = [
  { id: 1, project_id: 1, sender_id: 1, text: "Welcome everyone to the team! I've set up the initial GitHub repository structure and posted the core tasks in our workspace task board. Let's aim to have our prototype ready by end of week!", is_announcement: true, created_at: new Date(Date.now() - 3600000 * 20).toISOString() },
  { id: 2, project_id: 1, sender_id: 4, text: "Awesome! The Figma design tokens are updated. Priya, check out the upload drag-and-drop state components on page 2.", is_announcement: false, created_at: new Date(Date.now() - 3600000 * 15).toISOString() },
  { id: 3, project_id: 1, sender_id: 3, text: "Thanks Kiran! The designs look slick. I'm hooking up the Tailwind UI components to match your specs now.", is_announcement: false, created_at: new Date(Date.now() - 3600000 * 10).toISOString() },
  { id: 4, project_id: 1, sender_id: 2, text: "Backend auth endpoints are 80% ready. I'll push the JWT middleware PR tonight for review.", is_announcement: false, created_at: new Date(Date.now() - 3600000 * 2).toISOString() }
];

const INITIAL_COMPLETED_PROJECTS = [
  {
    id: 1,
    project_id: 1,
    title: "UniMarket - Global Campus Peer-to-Peer Rental Network",
    summary: "A web app allowing students across university campuses to rent textbooks, lab equipment, and scientific calculators safely from verified peers.",
    demo_url: "https://unimarket-demo.vercel.app",
    github_url: "https://github.com/stanford-students/unimarket",
    screenshots: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80"
    ],
    key_learnings: "Learned how to handle realtime WebSocket inventory updates, implement university email verification, and design localized geolocation search filters.",
    finished_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    domain: "Web Development",
    tech_stack: "React, Node.js, Express, MongoDB, Tailwind CSS",
    team_members: [
      { name: "Rahul Verma", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", role: "Full-Stack Developer" },
      { name: "Priya Patel", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", role: "Frontend & UI/UX" }
    ]
  }
];

// LocalStorage Persistence Wrapper
function initLocalStorage() {
  if (!localStorage.getItem("collabcraft_users")) {
    localStorage.setItem("collabcraft_users", JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem("collabcraft_projects")) {
    localStorage.setItem("collabcraft_projects", JSON.stringify(INITIAL_PROJECTS));
  }
  if (!localStorage.getItem("collabcraft_team_members")) {
    localStorage.setItem("collabcraft_team_members", JSON.stringify(INITIAL_TEAM_MEMBERS));
  }
  if (!localStorage.getItem("collabcraft_join_requests")) {
    localStorage.setItem("collabcraft_join_requests", JSON.stringify(INITIAL_JOIN_REQUESTS));
  }
  if (!localStorage.getItem("collabcraft_tasks")) {
    localStorage.setItem("collabcraft_tasks", JSON.stringify(INITIAL_TASKS));
  }
  if (!localStorage.getItem("collabcraft_resources")) {
    localStorage.setItem("collabcraft_resources", JSON.stringify(INITIAL_RESOURCES));
  }
  if (!localStorage.getItem("collabcraft_discussions")) {
    localStorage.setItem("collabcraft_discussions", JSON.stringify(INITIAL_DISCUSSIONS));
  }
  if (!localStorage.getItem("collabcraft_completed")) {
    localStorage.setItem("collabcraft_completed", JSON.stringify(INITIAL_COMPLETED_PROJECTS));
  }
}

initLocalStorage();
