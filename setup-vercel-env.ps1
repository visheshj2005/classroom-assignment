# PowerShell script to set up Vercel environment variables
Write-Host "🔧 Setting up Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host "=" * 50

# Check if vercel CLI is available
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Please install with: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# Environment variables to set
$envVars = @{
    "MONGODB_URI" = "mongodb+srv://visheshj2005:Visheshjain18@classroom-portal.dl5nzmz.mongodb.net/?appName=classroom-portal"
    "JWT_SECRET" = "your-super-secret-jwt-key-for-local-development-minimum-32-characters-long"
    "JWT_EXPIRES_IN" = "7d"
    "NODE_ENV" = "production"
    "BCRYPT_ROUNDS" = "12"
    "RATE_LIMIT_WINDOW_MS" = "900000"
    "RATE_LIMIT_MAX_REQUESTS" = "200"
    "AUTH_RATE_LIMIT_MAX" = "10"
    "EMAIL_SERVICE" = "gmail"
    "EMAIL_USER" = "visheshj2005@gmail.com"
    "EMAIL_PASS" = "wxxjnvemknawzrkf"
    "EMAIL_FROM" = "visheshj2005@gmail.com"
    "ENABLE_ANALYTICS" = "true"
    "ENABLE_NOTIFICATIONS" = "true"
    "ENABLE_FILE_UPLOADS" = "true"
    "MAX_FILE_SIZE" = "50MB"
    "ANALYTICS_RETENTION_DAYS" = "365"
    "NOTIFICATION_RETENTION_DAYS" = "30"
}

Write-Host "`n🚀 Setting environment variables..." -ForegroundColor Yellow

foreach ($key in $envVars.Keys) {
    Write-Host "Setting $key..." -ForegroundColor Cyan
    try {
        $value = $envVars[$key]
        echo $value | vercel env add $key production
        Write-Host "✅ $key set successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to set $key" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Environment variables setup complete!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Redeploy your application: vercel --prod" -ForegroundColor White
Write-Host "   2. Test the deployment: npm run verify:deployment <your-url>" -ForegroundColor White