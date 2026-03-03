# Rapt — React Frontend
### AI Chat Interface for Raptbot Technologies

---

## 🖥️ Complete Step-by-Step Setup (Windows + VS Code)

---

### STEP 1 — Install Prerequisites

You need Node.js and VS Code installed before anything else.

**A) Install Node.js**
1. Open your browser and go to: https://nodejs.org
2. Download the **LTS** version (e.g., 20.x or 22.x)
3. Run the installer (.msi) — click Next through all defaults
4. When done, open **Command Prompt** (press `Win + R`, type `cmd`, press Enter)
5. Verify Node is installed:
   ```
   node --version
   npm --version
   ```
   You should see version numbers like `v20.11.0` and `10.2.4`

**B) Install VS Code** (if not already)
1. Go to: https://code.visualstudio.com
2. Download for Windows and install

---

### STEP 2 — Open This Project in VS Code

1. Extract / place the `rapt-frontend` folder wherever you like (e.g., `C:\Projects\rapt-frontend`)
2. Open VS Code
3. Click **File → Open Folder**
4. Navigate to and select the `rapt-frontend` folder
5. Click **Select Folder**

You should now see the project files in the left sidebar.

---

### STEP 3 — Open the Integrated Terminal

In VS Code, press:
```
Ctrl + `   (that's the backtick key, top-left under Escape)
```
Or go to **Terminal → New Terminal** from the menu.

A terminal panel will open at the bottom. Make sure you're in the `rapt-frontend` directory:
```
cd C:\Projects\rapt-frontend
```
(Adjust the path to where you put the folder.)

---

### STEP 4 — Set Your Backend URL

1. In the VS Code file explorer, find `.env.example`
2. Right-click it → **Rename** → rename to `.env`
3. Open the `.env` file
4. Change the URL to point to your FastAPI backend:

```
REACT_APP_API_URL=http://localhost:8000
```

If your backend is deployed online (e.g., on AWS, Render, etc.), replace with:
```
REACT_APP_API_URL=https://your-api-domain.com
```

Save the file (`Ctrl + S`).

---

### STEP 5 — Install Dependencies

In the VS Code terminal, run:
```
npm install
```

This downloads all required packages into a `node_modules` folder.
It may take 1–3 minutes. You'll see a progress bar.

When complete you'll see something like:
```
added 1423 packages in 45s
```

---

### STEP 6 — Make Sure Your Backend is Running

Before starting the frontend, make sure your FastAPI backend is running.

Open a **second terminal** (click the `+` icon in the terminal panel), navigate to your backend folder, and run:
```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### STEP 7 — Start the React App

Back in your **first terminal** (in `rapt-frontend`), run:
```
npm start
```

This will:
- Compile the React app
- Automatically open your browser at `http://localhost:3000`
- Hot-reload whenever you save any file

You'll see the Rapt chat interface load with the welcome screen!

---

### STEP 8 — Test the Chat

1. You'll see the welcome screen with quick-prompt buttons
2. Click any quick prompt or type your own message
3. Press **Enter** to send
4. Watch Rapt respond from your backend!

---

## 📁 Project File Structure

```
rapt-frontend/
├── public/
│   └── index.html              ← HTML shell
├── src/
│   ├── components/
│   │   ├── ChatHeader.jsx      ← Top bar with bot avatar & clear button
│   │   ├── ChatHeader.css
│   │   ├── WelcomeScreen.jsx   ← Intro screen with quick prompts
│   │   ├── WelcomeScreen.css
│   │   ├── MessageList.jsx     ← Renders all chat messages
│   │   ├── MessageList.css
│   │   ├── Message.jsx         ← Individual chat bubble
│   │   ├── Message.css
│   │   ├── TypingIndicator.jsx ← Animated "Rapt is thinking" indicator
│   │   ├── TypingIndicator.css
│   │   ├── ChatInput.jsx       ← Message input with auto-resize
│   │   └── ChatInput.css
│   ├── App.js                  ← Main app logic & API calls
│   ├── App.css                 ← Layout & ambient background
│   ├── index.js                ← React entry point
│   └── index.css               ← Global styles & CSS variables
├── .env                        ← Your environment variables (YOU CREATE THIS)
├── .env.example                ← Template for .env
└── package.json                ← Project dependencies
```

---

## 🔧 Common Issues & Fixes

**Problem:** `npm start` shows "PORT 3000 is already in use"
**Fix:** Press `Y` when asked if you want to use another port, or kill the other process using port 3000.

**Problem:** Messages send but get CORS error in browser console
**Fix:** Your FastAPI backend already has CORS configured. Make sure the backend is running and the URL in `.env` is correct.

**Problem:** App loads but API calls fail with "Network Error"
**Fix:** Check that your FastAPI backend is running (`uvicorn main:app --reload`). Also confirm `REACT_APP_API_URL` in `.env` has no trailing slash.

**Problem:** Changes to `.env` not taking effect
**Fix:** Stop the dev server (`Ctrl + C` in terminal), then run `npm start` again. React only reads `.env` at startup.

---

## 🚀 Building for Production

When you're ready to deploy:
```
npm run build
```

This creates an optimized `build/` folder. You can then:
- Upload it to any static host (Netlify, Vercel, S3, etc.)
- Serve it with Nginx or any web server

---

## ✅ Recommended VS Code Extensions

Open the Extensions panel (`Ctrl + Shift + X`) and search for:

- **ES7+ React/Redux/React-Native snippets** — autocomplete for React
- **Prettier - Code formatter** — auto-formats your code on save
- **ESLint** — catches JavaScript errors as you type
- **Auto Rename Tag** — renames paired HTML/JSX tags together

---

*Rapt frontend v1.0.0 — Raptbot Technologies Private Limited*
*info@raptbot.in · www.raptbot.in · +91 8123975208*
