# 🌐 How to Deploy CollabCraft to a Live Web Server

This guide explains how to put **CollabCraft** live on the internet for real students to use worldwide — for free!

---

## ⚡ Option 1: Render.com (Recommended - 1-Click Free Hosting)

1. **Create a GitHub Repository**:
   - Push this project codebase to a public or private GitHub repository:
     ```bash
     git init
     git add .
     git commit -m "Production CollabCraft launch"
     git remote add origin https://github.com/YOUR_USERNAME/collabcraft.git
     git push -u origin main
     ```

2. **Deploy on Render**:
   - Sign up for a free account at [https://render.com](https://render.com).
   - Click **New +** ➔ **Web Service**.
   - Connect your GitHub repository.
   - Set the following settings:
     - **Name**: `collabcraft`
     - **Runtime**: `Python`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python server/main.py`
   - Click **Create Web Service**.

3. **Your Live Website**:
   - Render will build and launch your application automatically in ~2 minutes!
   - You will get a live URL such as: `https://collabcraft.onrender.com`

---

## 🚀 Option 2: Railway.app (Free / Low Cost Deployment)

1. Sign up at [https://railway.app](https://railway.app).
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select your `collabcraft` repository.
4. Railway will automatically detect Python & FastAPI and launch the server.
5. In your project settings, click **Generate Domain** to receive your live web address!

---

## 🐳 Option 3: Deploy via Docker on Any Cloud VPS (DigitalOcean / AWS / Hetzner)

If you own a Linux server (Ubuntu/Debian):

```bash
# 1. Clone your repo onto your server
git clone https://github.com/YOUR_USERNAME/collabcraft.git
cd collabcraft

# 2. Build Docker Image
docker build -t collabcraft .

# 3. Run Container on Port 80
docker run -d -p 80:8000 --name collabcraft_live collabcraft
```

Your website is now live at `http://YOUR_SERVER_IP`!

---

## 🔐 Real Security & Database Settings

- **Real User Authentication**: All students register with their actual email and password. Passwords are securely hashed with `bcrypt`. Tokens are issued using `PyJWT`.
- **Zero Dummy Data**: Production mode starts with a clean database. Only real student profiles and genuine project submissions will populate the site.
