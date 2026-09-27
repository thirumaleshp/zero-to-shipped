# ==============================================================================
# OpsPulse AI — 1-Click AWS Deployment Script
# AWS Zero to Shipped Hackathon (2026)
# Deploys production bundle directly to AWS Amplify Hosting / S3 + CloudFront
# ==============================================================================

param(
    [string]$Region = "us-east-1",
    [string]$AppName = "opspulse-ai"
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  🚀 OpsPulse AI — AWS 1-Click Deployment Engine" -ForegroundColor Yellow
Write-Host "  Category: #workplace-efficiency | Lane: #startups" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan

# Step 1: Verify AWS CLI Identity
Write-Host "`n[1/4] Verifying AWS Identity (STS)..." -ForegroundColor Cyan
$identity = aws sts get-caller-identity --output json 2>$null

if (-not $identity) {
    Write-Host "[ERROR] AWS credentials not detected." -ForegroundColor Red
    Write-Host "Please run 'aws configure' first or set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Connected to AWS Principal:" -ForegroundColor Green
Write-Host $identity -ForegroundColor DarkGray

# Step 2: Build Production Bundle
Write-Host "`n[2/4] Building optimized production artifacts..." -ForegroundColor Cyan
npm.cmd run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Production build failed." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build successful: dist/ ready for deployment." -ForegroundColor Green

# Step 3: Deploy to AWS Amplify Hosting
Write-Host "`n[3/4] Deploying to AWS Amplify Hosting..." -ForegroundColor Cyan

# Check if Amplify app exists or create one
$appCheck = aws amplify list-apps --region $Region --output json 2>$null | ConvertFrom-Json
$existingApp = $appCheck.apps | Where-Object { $_.name -eq $AppName }

if (-not $existingApp) {
    Write-Host "Creating new AWS Amplify App '$AppName' in $Region..." -ForegroundColor Yellow
    $createResult = aws amplify create-app --name $AppName --region $Region --platform WEB --output json | ConvertFrom-Json
    $appId = $createResult.app.appId
    $defaultDomain = $createResult.app.defaultDomain
    Write-Host "[OK] Created Amplify App ID: $appId" -ForegroundColor Green
    
    # Create main branch
    aws amplify create-branch --app-id $appId --branch-name main --region $Region --output json | Out-Null
} else {
    $appId = $existingApp.appId
    $defaultDomain = $existingApp.defaultDomain
    Write-Host "[OK] Found existing Amplify App ID: $appId" -ForegroundColor Green
}

# Zip dist directory
Write-Host "Packaging deployment bundle..." -ForegroundColor Cyan
Compress-Archive -Path dist\* -DestinationPath dist.zip -Force

# Create deployment
Write-Host "Deploying bundle to Amplify main branch..." -ForegroundColor Cyan
$deployResult = aws amplify create-deployment --app-id $appId --branch-name main --region $Region --output json | ConvertFrom-Json
$jobId = $deployResult.jobId
$uploadUrl = $deployResult.zipUploadUrl

# Upload bundle to S3 presigned URL
Invoke-RestMethod -Uri $uploadUrl -Method Put -InFile "dist.zip" -ContentType "application/zip"

# Start deployment job
aws amplify start-deployment --app-id $appId --branch-name main --job-id $jobId --region $Region --output json | Out-Null

Remove-Item -Path "dist.zip" -Force

$publicUrl = "https://main.$defaultDomain"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "  🎉 DEPLOYMENT SUCCESSFUL — SHIP GATE QUALIFIED!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Public Live URL: $publicUrl" -ForegroundColor Yellow
Write-Host "  Hackathon Tags:  #workplace-efficiency #startups" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
