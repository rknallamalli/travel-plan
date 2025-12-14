# TravelPlan v1.0.0 - GitHub Deployment Script
# Repository: https://github.com/rknallamalli/travel-plan.git

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TravelPlan v1.0.0 - GitHub Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
$gitInstalled = $false
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
        $gitInstalled = $true
    }
}
catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
}

if (-not $gitInstalled) {
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installing Git, run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Upload files manually via GitHub web interface" -ForegroundColor Cyan
    Write-Host "Go to: https://github.com/rknallamalli/travel-plan" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Repository: https://github.com/rknallamalli/travel-plan.git" -ForegroundColor Cyan
Write-Host ""

# Initialize Git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git initialized" -ForegroundColor Green
}
else {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
}

Write-Host ""

# Configure Git user (if not already configured)
$gitUser = git config user.name 2>&1
if ([string]::IsNullOrEmpty($gitUser)) {
    Write-Host "Configuring Git user..." -ForegroundColor Yellow
    $userName = Read-Host "Enter your name"
    $userEmail = Read-Host "Enter your email"
    git config user.name "$userName"
    git config user.email "$userEmail"
    Write-Host "✓ Git user configured" -ForegroundColor Green
}
else {
    Write-Host "✓ Git user already configured: $gitUser" -ForegroundColor Green
}

Write-Host ""

# Add remote if not already added
$remotes = git remote 2>&1
if ($remotes -notcontains "origin") {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/rknallamalli/travel-plan.git
    Write-Host "✓ Remote added" -ForegroundColor Green
}
else {
    Write-Host "✓ Remote already configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "Preparing files for commit..." -ForegroundColor Yellow

# Add all files
git add .

Write-Host "✓ Files staged" -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "Files to be committed:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow

# Commit with version tag
git commit -m "Release v1.0.0 - Initial TravelPlan PWA

Features:
- Trip management (create, edit, delete)
- Day-by-day itinerary planning
- Interactive maps with Leaflet.js
- Offline map tile caching
- Expense tracking by category
- Trip notes with auto-save
- Progressive Web App support
- Service Worker for offline functionality
- iPhone home screen installation
- Complete offline support
- Dark theme design
- Responsive layout

Repository: https://github.com/rknallamalli/travel-plan
Live Demo: https://rknallamalli.github.io/travel-plan/"

Write-Host "✓ Changes committed" -ForegroundColor Green
Write-Host ""

# Create and push tag
Write-Host "Creating version tag v1.0.0..." -ForegroundColor Yellow
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Release"
Write-Host "✓ Tag created" -ForegroundColor Green
Write-Host ""

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: You may be prompted for your GitHub credentials" -ForegroundColor Cyan
Write-Host ""

# Set main branch
git branch -M main

# Push code
git push -u origin main

# Push tags
git push origin --tags

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your TravelPlan v1.0.0 is now on GitHub!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository: https://github.com/rknallamalli/travel-plan" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/rknallamalli/travel-plan/settings/pages" -ForegroundColor White
Write-Host "2. Under 'Source', select: main branch, / (root)" -ForegroundColor White
Write-Host "3. Click 'Save'" -ForegroundColor White
Write-Host "4. Wait ~1 minute for deployment" -ForegroundColor White
Write-Host "5. Your app will be live at: https://rknallamalli.github.io/travel-plan/" -ForegroundColor White
Write-Host ""
Write-Host "Then test on your iPhone 16 Pro Max!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
