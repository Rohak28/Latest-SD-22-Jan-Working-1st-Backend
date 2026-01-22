# 🚀 START HERE - Quick Setup Guide

**Get the app running in 3 minutes!**

---

## ⚡ Quick Start (Copy & Paste)

### 1. Extract Project
```bash
unzip stutter-detection-app.zip
cd stutter-detection-app
```

### 2. Start Docker
```bash
docker-compose up -d
```

### 3. Wait 60 Seconds & Open Browser
```
http://localhost
```

**Done! Your app is running!** ✅

---

## 🧪 Test It

### Sign Up
1. Click "Sign Up"
2. Enter: Name, Email, Password
3. Choose "Patient"
4. Click "Sign Up"

### Login
1. Click "Login"
2. Enter your email & password
3. Choose "Patient"
4. Click "Sign In"

### Use App
1. Go to "Analyze"
2. Select Language (English, Hindi, or Marathi)
3. Select Grade Level
4. Record or upload audio
5. Click "Start Analysis"
6. Accept consent terms
7. View results!

---

## 🛑 Stop the App

```bash
docker-compose down
```

---

## 🐛 Something Not Working?

### Check Status
```bash
docker-compose ps
```

Both should say "Up (healthy)"

### View Logs
```bash
docker-compose logs -f
```

Press Ctrl+C to exit

### Restart
```bash
docker-compose restart
```

### Full Reset
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 📖 Need More Help?

Read: `DOCKER_BEGINNER_GUIDE.md`

---

**That's it! Enjoy! 🎉**
