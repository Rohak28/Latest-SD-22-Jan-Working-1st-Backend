# Quick Start Guide - Stutter Detection Application

## 📥 Installation & Setup

### Option 1: Using Docker Compose (Recommended - Easiest)

#### Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

#### Steps

1. **Extract the zip file**
   ```bash
   unzip stutter-detection-updated.zip
   cd stutter-detection-frontend
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to start** (takes ~30-60 seconds)
   ```bash
   docker-compose logs -f
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:10000

5. **Stop the application**
   ```bash
   docker-compose down
   ```

---

### Option 2: Local Development Setup

#### Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- Python 3.11+ ([Download](https://www.python.org/))
- FFmpeg ([Installation guide](https://ffmpeg.org/download.html))

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd stutter-detection-frontend/Stutter-Detection-Frontend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access frontend**
   - Open http://localhost:5173 in your browser

#### Backend Setup (in another terminal)

1. **Navigate to backend directory**
   ```bash
   cd stutter-detection-frontend/Stutter-detection-backend-main
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run backend server**
   ```bash
   python app.py
   ```

6. **Backend will be available at**
   - http://localhost:10000

---

## 🧪 Testing the Application

### 1. Test Consent Page
- Click "Start Analysis" button
- Consent modal should appear
- Try clicking "Accept & Start Analysis" without checking the checkbox (should show error)
- Check the checkbox and click "Accept & Start Analysis"
- Analysis should proceed

### 2. Test Animations
- Navigate through different pages
- Observe smooth fade-in animations
- Hover over cards on the results page (should lift up)
- Click buttons to see scale animations

### 3. Test File Upload
- Go to Analyze page
- Upload an audio file or record audio
- Submit for analysis
- Wait for results
- Check if animations and charts display correctly

---

## 🐳 Docker Commands Reference

### View running containers
```bash
docker-compose ps
```

### View logs
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Rebuild images
```bash
docker-compose up -d --build
```

### Stop services
```bash
docker-compose down
```

### Remove everything (including volumes)
```bash
docker-compose down -v
```

### Access container shell
```bash
docker exec -it stutter-detection-frontend bash
docker exec -it stutter-detection-backend bash
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Error:** `bind: address already in use`

**Solution:**
```bash
# Find process using port 80
lsof -i :80

# Kill the process (replace PID)
kill -9 <PID>

# Or change ports in docker-compose.yml
# Change "80:80" to "8080:80"
# Change "10000:10000" to "10001:10000"
```

### Container Exits Immediately

**Check logs:**
```bash
docker logs stutter-detection-frontend
docker logs stutter-detection-backend
```

### Cannot Connect to Backend

**Verify backend is running:**
```bash
curl http://localhost:10000/health
```

**Check network:**
```bash
docker network ls
docker network inspect stutter-network
```

### Memory Issues

**Increase Docker memory:**
- Docker Desktop → Preferences → Resources → Memory (set to 4GB+)

---

## 📁 Project Structure

```
stutter-detection-frontend/
├── Stutter-Detection-Frontend-main/     # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ConsentPage.jsx         # NEW: Consent modal
│   │   │   ├── Analyze.jsx             # UPDATED: With consent
│   │   │   ├── Results.jsx             # UPDATED: Enhanced animations
│   │   │   └── ...
│   │   ├── components/
│   │   └── ...
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
├── Stutter-detection-backend-main/      # Python backend
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml                   # NEW: Docker orchestration
├── DOCKER_README.md                     # NEW: Detailed Docker guide
├── README_UPDATED.md                    # NEW: Updated README
├── CHANGES_SUMMARY.md                   # NEW: Changelog
└── QUICK_START.md                       # This file
```

---

## 🎯 New Features

### ✅ Consent Page
- Mandatory T&C agreement before analysis
- Clear terms about data collection and privacy
- Smooth animations with error handling
- Prevents analysis until user agrees

### ✅ Enhanced Animations
- Smooth page transitions (0.5s)
- Card hover effects (lift on hover)
- Button interactions (scale on hover/tap)
- Staggered element animations

### ✅ Docker Support
- Multi-stage builds for optimized images
- Docker Compose for easy orchestration
- Health checks for service monitoring
- Production-ready configuration

---

## 📞 Support & Documentation

### For More Information
- **Docker Setup:** See `DOCKER_README.md`
- **Project Details:** See `README_UPDATED.md`
- **Changes Made:** See `CHANGES_SUMMARY.md`
- **Original Frontend:** See `Stutter-Detection-Frontend-main/README.md`
- **Original Backend:** See `Stutter-detection-backend-main/README.md`

### Common Issues

**Q: How do I change the port?**
A: Edit `docker-compose.yml` and change the port mappings (e.g., "8080:80")

**Q: How do I enable debug mode?**
A: Set `FLASK_DEBUG=True` in the backend environment variables

**Q: How do I access the database?**
A: Check the backend logs or configuration files for database details

**Q: Can I run without Docker?**
A: Yes, follow Option 2 (Local Development Setup) above

---

## ✨ Next Steps

1. Extract the zip file
2. Choose your setup method (Docker or Local)
3. Follow the steps for your chosen method
4. Test the consent page and animations
5. Upload an audio file and run analysis
6. Review the results with enhanced visualizations

---

**Version:** 2.0.0
**Last Updated:** December 29, 2024
**Status:** Ready for Production
