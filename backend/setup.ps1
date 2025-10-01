# Aegis Backend Setup Script
# This script helps you set up the backend quickly

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Aegis Backend Setup Wizard" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in backend directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "Usage: cd backend; .\setup.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Green
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Setup environment file
Write-Host "Step 3: Setting up environment variables..." -ForegroundColor Green
Write-Host ""

if (Test-Path ".env") {
    Write-Host "⚠ .env file already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Keeping existing .env file" -ForegroundColor Yellow
    } else {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "✓ .env file created from template" -ForegroundColor Green
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created from template" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Configure your environment..." -ForegroundColor Green
Write-Host ""

# Prompt for MongoDB URI
Write-Host "MongoDB Setup:" -ForegroundColor Cyan
Write-Host "1. Local MongoDB (mongodb://localhost:27017/aegis)" -ForegroundColor White
Write-Host "2. MongoDB Atlas (cloud)" -ForegroundColor White
$mongoChoice = Read-Host "Choose option (1/2)"

if ($mongoChoice -eq "2") {
    Write-Host ""
    Write-Host "MongoDB Atlas Setup:" -ForegroundColor Yellow
    Write-Host "1. Go to https://www.mongodb.com/cloud/atlas/register" -ForegroundColor White
    Write-Host "2. Create a free cluster" -ForegroundColor White
    Write-Host "3. Create a database user" -ForegroundColor White
    Write-Host "4. Whitelist all IPs (0.0.0.0/0)" -ForegroundColor White
    Write-Host "5. Get your connection string" -ForegroundColor White
    Write-Host ""
    $mongoUri = Read-Host "Enter your MongoDB Atlas connection string"
    
    # Update .env file
    (Get-Content ".env") -replace 'MONGODB_URI=.*', "MONGODB_URI=$mongoUri" | Set-Content ".env"
    Write-Host "✓ MongoDB URI updated" -ForegroundColor Green
} else {
    Write-Host "✓ Using local MongoDB" -ForegroundColor Green
    Write-Host "⚠ Make sure MongoDB is installed and running" -ForegroundColor Yellow
    Write-Host "Start MongoDB: net start MongoDB" -ForegroundColor White
}

Write-Host ""

# Generate JWT secret
Write-Host "Generating secure JWT secret..." -ForegroundColor Cyan
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
(Get-Content ".env") -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret" | Set-Content ".env"
Write-Host "✓ JWT secret generated" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Review your .env file:" -ForegroundColor White
Write-Host "   notepad .env" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Test the server:" -ForegroundColor White
Write-Host "   Open http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Read the documentation:" -ForegroundColor White
Write-Host "   - QUICKSTART.md - Quick setup guide" -ForegroundColor Cyan
Write-Host "   - README.md - Complete documentation" -ForegroundColor Cyan
Write-Host "   - API_TESTING.md - API testing examples" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Do you want to start the development server now? (y/N)"
if ($startNow -eq "y" -or $startNow -eq "Y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
}
