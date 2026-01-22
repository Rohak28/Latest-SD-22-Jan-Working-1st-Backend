# 🐳 Docker Beginner's Guide - Stutter Detection App

**New to Docker? This guide will help you run the entire application with just a few commands!**

---

## 📚 What is Docker?

Think of Docker as a **virtual computer inside your computer**. It packages your entire application (frontend, backend, databases, etc.) into a single container so it runs the same way on any computer.

**Benefits:**
- ✅ No need to install Python, Node.js, databases separately
- ✅ Everything works the same on Windows, Mac, and Linux
- ✅ No "it works on my computer but not on yours" problems
- ✅ Easy to share and deploy

---

## 🛠️ Installation (5 minutes)

### Step 1: Download Docker Desktop

**For Windows/Mac:**
1. Go to [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Click "Download for [Your OS]"
3. Run the installer
4. Follow the installation wizard
5. Restart your computer

**For Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

### Step 2: Verify Installation

Open Command Prompt / Terminal and run:
```bash
docker --version
docker-compose --version
```

You should see version numbers. If you do, Docker is installed! ✅

---

## 🚀 Running the Application (3 Simple Steps)

### Step 1: Extract the Project
```bash
# Extract the zip file
unzip stutter-detection-app.zip

# Navigate to the project folder
cd stutter-detection-app
```

### Step 2: Start Everything with One Command
```bash
docker-compose up -d
```

**What this does:**
- Downloads required images
- Starts the backend (Flask API)
- Starts the frontend (React + Nginx)
- Sets up networking between them

**First time?** This might take 2-5 minutes. Be patient! ⏳

### Step 3: Open in Browser
```
http://localhost
```

**That's it! Your app is running!** 🎉

---

## ✅ Verify Everything is Working

### Check if services are running
```bash
docker-compose ps
```

**You should see:**
```
NAME                           STATUS
stutter-detection-backend      Up (healthy)
stutter-detection-frontend     Up (healthy)
```

### Test the backend
```bash
curl http://localhost:10000/health
```

**You should see:**
```
healthy
```

### Open the app
Open your browser and go to: **http://localhost**

---

## 🧪 Test Login/Signup

1. **Sign Up:**
   - Click "Sign Up"
   - Fill in: Name, Email, Password
   - Choose "Patient" or "SLP"
   - Click "Sign Up"

2. **Login:**
   - Click "Login"
   - Enter your email and password
   - Choose same user type
   - Click "Sign In"

3. **Use the App:**
   - Select language (English, Hindi, Marathi)
   - Select grade level
   - Record or upload audio
   - Click "Start Analysis"
   - Accept consent
   - View results

---

## 📋 Common Docker Commands

### View Logs (to see what's happening)
```bash
# All logs
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend

# Exit logs: Press Ctrl+C
```

### Stop the Application
```bash
docker-compose down
```

### Restart the Application
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Remove Everything (including data)
```bash
docker-compose down -v
```

### Access Container Terminal
```bash
# Frontend terminal
docker exec -it stutter-detection-frontend bash

# Backend terminal
docker exec -it stutter-detection-backend bash
```

---

## 🐛 Troubleshooting

### Problem: "Port 80 already in use"

**Error message:** `bind: address already in use`

**Solution:**
1. Open `docker-compose.yml`
2. Find this line: `- "80:80"`
3. Change it to: `- "8080:80"`
4. Save the file
5. Run: `docker-compose up -d --build`
6. Open: `http://localhost:8080`

### Problem: "Cannot connect to Docker"

**Error message:** `Cannot connect to Docker daemon`

**Solution:**
- Make sure Docker Desktop is running
- On Windows/Mac: Open Docker Desktop app
- On Linux: Run `sudo systemctl start docker`

### Problem: "Services not starting"

**Solution:**
```bash
# Stop everything
docker-compose down -v

# Start fresh
docker-compose up -d --build

# Wait 60 seconds
sleep 60

# Check status
docker-compose ps

# View logs
docker-compose logs
```

### Problem: "Blank page when opening http://localhost"

**Solution:**
1. Press F12 (open Developer Tools)
2. Go to Console tab
3. Look for error messages
4. Check backend is running: `docker-compose ps`
5. Check backend logs: `docker-compose logs backend`

### Problem: "Login/Signup not working"

**Solution:**
```bash
# Check backend logs
docker-compose logs backend

# Verify backend is healthy
curl http://localhost:10000/health

# Restart backend
docker-compose restart backend
```

### Problem: "High memory usage / computer slow"

**Solution:**
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory (set to 4GB or more)
4. Increase CPU cores (set to 4 or more)

---

## 📁 Project Structure Explained

```
stutter-detection-app/
├── docker-compose.yml          ← Configuration file (tells Docker what to run)
├── nginx.conf                  ← Web server configuration
├── Dockerfile.frontend         ← Instructions to build frontend image
│
├── Stutter-Detection-Frontend-main/
│   ├── src/
│   │   ├── pages/              ← Login, Signup, Analyze, Results pages
│   │   ├── components/         ← Reusable UI components
│   │   ├── contexts/           ← Authentication logic
│   │   └── data/               ← Multi-language sentences
│   ├── package.json            ← Frontend dependencies
│   └── Dockerfile              ← Frontend build instructions
│
├── Stutter-detection-backend-main/
│   ├── app.py                  ← Main backend server
│   ├── analyzer.py             ← Speech analysis logic
│   ├── requirements.txt         ← Python dependencies
│   └── Dockerfile              ← Backend build instructions
```

---

## 🔍 Understanding Docker Compose

`docker-compose.yml` is like a recipe that tells Docker:

1. **What services to run:**
   - Frontend (React app)
   - Backend (Flask API)

2. **What ports to use:**
   - Frontend: 80 (http://localhost)
   - Backend: 10000 (http://localhost:10000)

3. **How they connect:**
   - Both on same network
   - Frontend sends requests to backend
   - Backend processes and responds

4. **Health checks:**
   - Automatically restarts if service dies
   - Ensures everything is healthy

---

## 🎯 Workflow Explained

```
1. You open http://localhost
   ↓
2. Nginx serves the React frontend
   ↓
3. You click "Sign Up"
   ↓
4. Frontend sends request to http://localhost/api/signup
   ↓
5. Nginx proxies to http://backend:10000/api/signup
   ↓
6. Backend processes and saves to MongoDB
   ↓
7. Backend returns response
   ↓
8. Frontend shows success message
```

---

## 📊 What Happens When You Run Commands

### `docker-compose up -d`
- Downloads images (if needed)
- Creates containers
- Starts all services
- `-d` means "run in background"

### `docker-compose ps`
- Shows all running containers
- Shows their status (healthy/unhealthy)
- Shows mapped ports

### `docker-compose logs -f`
- Shows real-time logs from all services
- `-f` means "follow" (keep showing new logs)
- Useful for debugging

### `docker-compose down`
- Stops all services
- Removes containers
- Keeps images (for faster restart)

---

## 💡 Pro Tips

### Tip 1: Keep Logs Open While Testing
```bash
# In one terminal
docker-compose logs -f

# In another terminal
# Run your tests or use the app
```

### Tip 2: Restart Only One Service
```bash
docker-compose restart backend
# or
docker-compose restart frontend
```

### Tip 3: View Resource Usage
```bash
docker stats
```

### Tip 4: Clean Up Old Images
```bash
docker image prune -a
```

### Tip 5: Save Logs to File
```bash
docker-compose logs > logs.txt
```

---

## 🔐 Security Notes

**For Local Development:**
- MongoDB connection string is in code (OK for local)
- No SSL/HTTPS (OK for local)
- Debug mode might be on (OK for local)

**For Production:**
- Use environment variables for secrets
- Enable SSL/HTTPS
- Use strong passwords
- Implement rate limiting
- Use proper authentication tokens

---

## 📞 Getting Help

### Check Logs First
```bash
docker-compose logs
```

### Restart Everything
```bash
docker-compose down -v
docker-compose up -d --build
```

### Common Issues
- **Port in use:** Change port in docker-compose.yml
- **Out of memory:** Increase Docker memory in settings
- **Services won't start:** Check logs for error messages
- **Cannot connect:** Make sure Docker is running

---

## ✨ Next Steps

1. ✅ Install Docker
2. ✅ Extract the project
3. ✅ Run `docker-compose up -d`
4. ✅ Open http://localhost
5. ✅ Test Sign Up / Login
6. ✅ Try the app features
7. ✅ Check logs if anything breaks

---

## 🎓 Learn More

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Congratulations! You now know how to run the app with Docker! 🚀**

If you have questions, check the logs first. They usually tell you what's wrong!

**Version:** 1.0 (Beginner Friendly)
**Last Updated:** January 4, 2025
