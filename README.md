# 🔒 Disposable Browser

A browser extension that spins up **isolated, containerized browser sessions** on demand — with shareable links and automatic cleanup.

> Built with Chrome Extension (MV3) · Node.js · Docker · noVNC

---

##  What It Does

| Feature | Description |
|---|---|
|  One-click launch | Click the extension → isolated browser opens instantly |
|  Docker isolation | Every session runs in its own container — nothing persists |
|  Shareable sessions | Share a link and collaborate in the same browser session |
|  Auto-expiry | Sessions auto-terminate after 30 minutes |
|  Auto-cleanup | Closing the tab stops and removes the container automatically |
|  Clipboard sync | Copy-paste between your host machine and the session |

---

##  Architecture

```
┌─────────────────┐
│ Chrome Extension│  Manifest V3 · popup.html · background.js
│   (MV3, JS)     │
└────────┬────────┘
         │ POST /api/session/create
         ▼
┌─────────────────────┐
│  Node.js Backend    │  Express · dockerode · uuid
│  localhost:4000     │
└────────┬────────────┘
         │ docker.createContainer()
         ▼
┌──────────────────────────────┐
│  Docker Container (per user) │
│  Chromium · Xvfb · x11vnc   │
│  noVNC · websockify          │
│  Port: auto-assigned         │
└──────────────────────────────┘
         │ http://localhost:{port}/vnc.html
         ▼
┌─────────────────┐
│  Browser Tab    │  Live Chromium session via noVNC
└─────────────────┘
```

---

##  Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Extension | Chrome MV3 · JS | Launch sessions, track tab lifecycle |
| Backend | Node.js · Express | REST API, session management |
| Container | Docker · dockerode | Isolated browser environments |
| Browser | Chromium · Xvfb | Headless browser on virtual display |
| Streaming | x11vnc · noVNC · websockify | Stream browser UI to web tab |
| Process | PM2 | Auto-start backend on system boot |

---

##  Getting Started

### Prerequisites
- Node.js v18+
- Docker Desktop
- Google Chrome

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/disposable-browser.git
cd disposable-browser

# Build the Docker image
cd docker
docker build -t disposable-browser:v1 .

# Install and start the backend
cd ../backend
npm install
npm install -g pm2
pm2 start index.js --name "disposable-browser-backend"
pm2 save
```

### Load the Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode** (top right)
3. Click **Load Unpacked** → select the `extension/` folder
4. Pin the extension to your toolbar

### Usage

1. Click the **🔒 Disposable Browser** icon in Chrome toolbar
2. Click **🚀 New Session**
3. An isolated browser opens in a new tab
4. Share the session URL for collaborative browsing
5. Close the tab → container is automatically destroyed

---

##  Project Structure

```
disposable-browser/
├── backend/
│   ├── index.js          # Express API + Docker session manager
│   └── package.json
├── docker/
│   ├── Dockerfile        # Debian + Chromium + noVNC image
│   └── start.sh          # Container startup script
├── extension/
│   ├── manifest.json     # Chrome MV3 manifest
│   ├── popup.html        # Extension UI
│   ├── popup.js          # Session creation logic
│   └── background.js     # Tab lifecycle + auto-cleanup
└── README.md
```

---

##  Security Design

- Each session runs in a **fully isolated Docker container**
- Containers have **512MB RAM limit** to prevent resource abuse
- Sessions **auto-expire** after 30 minutes
- Container is **force-removed** on session end — no data persists
- noVNC is password-protected per session

---


