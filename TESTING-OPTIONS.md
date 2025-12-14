# TravelPlan v1.1 - Testing Options

## ❌ Issue: Firebase Requires HTTP/HTTPS

Firebase authentication doesn't work with `file://` protocol (opening HTML directly).

You need to run the app on a local web server.

---

## ✅ SOLUTION OPTIONS

### **Option 1: Use VS Code Live Server (Recommended)**

If you have VS Code:

1. **Install Live Server Extension:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Install it

2. **Start Server:**
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - App opens at `http://127.0.0.1:5500`

3. **Test Firebase:**
   - Click "Sign In"
   - Try Google authentication
   - Should work now!

---

### **Option 2: Deploy to GitHub Pages (Best for Testing)**

Since you need to deploy anyway:

1. **Upload to GitHub:**
   - Go to https://github.com/rknallamalli/travel-plan
   - Upload all files from `wanderlog-clone` folder
   - Commit changes

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: main branch, / (root)
   - Save

3. **Test at:**
   - https://rknallamalli.github.io/travel-plan/
   - Firebase will work perfectly!

---

### **Option 3: Install Python (Quick)**

1. **Install Python:**
   - Go to: https://www.python.org/downloads/
   - Download and install
   - Check "Add Python to PATH"

2. **Run Server:**
   - Open PowerShell in `wanderlog-clone` folder
   - Run: `python -m http.server 8000`
   - Open: http://localhost:8000

---

### **Option 4: Use Chrome with Flags (Not Recommended)**

This is a workaround but not ideal:

1. Close all Chrome windows
2. Run Chrome with: `chrome.exe --allow-file-access-from-files`
3. Open `index.html`

**Warning:** This is insecure and only for testing!

---

## 🎯 RECOMMENDED: Option 1 or Option 2

**Option 1 (VS Code Live Server)** - Fastest for local testing
**Option 2 (GitHub Pages)** - Best for real testing on iPhone

---

## 📱 For Your Trip Next Week

You'll need to deploy to GitHub Pages anyway for iPhone testing, so **Option 2** makes the most sense!

---

**Which option would you like to use?**
