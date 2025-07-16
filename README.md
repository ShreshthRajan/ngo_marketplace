# NGO Marketplace

**A 3‑step guide to demo the project (no tech background needed).**

---

## 1. Get the Tools (Run Once)

1. **Git**: Download & install from https://git-scm.com/downloads.
2. **Node.js**: Download & install (which includes npm) from https://nodejs.org/. Choose the LTS version.

---

## 2. Download the Project

1. **Open Terminal/Command Prompt**
   - **macOS**: Press `⌘ + Space`, type **Terminal**, press Enter.
   - **Windows**: Press Start, type **cmd**, press Enter.
2. **Run these commands** (copy & paste each line, press Enter):
   ```bash
   git clone https://github.com/ShreshthRajan/ngo_marketplace.git
   cd ngo_marketplace
   ```

---

## 3. Run the App

### A) Start the Backend API

1. In the same Terminal window, run:
   ```bash
   cd backend
   npm install
   node api/server.js
   ```
2. Wait until you see:
   ```text
   NGO Marketplace API server running on port 3001
   ```

> Leave this window open.


### B) Start the Frontend

1. Open a **new** Terminal/Command Prompt window (repeat step 2 above).
2. In the new window, run:
   ```bash
   cd ngo_marketplace/frontend
   npm install
   npm start
   ```
3. Your web browser should open **http://localhost:3000** automatically. If it doesn’t, type that address in your browser.

---

🚀 **That’s it!**

- Browse the site at **http://localhost:3000**
- Click through NGOs and use the Contact button to see live logs in the backend window.

Enjoy your demo!
