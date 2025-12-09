# PowerShell script to update all process.env.REACT_APP_ to import.meta.env.VITE_APP_

Write-Host "🔄 Updating environment variable references in source files..." -ForegroundColor Cyan

$filesUpdated = 0

# Get all TypeScript and JavaScript files in src directory
Get-ChildItem -Path "src" -Include "*.ts","*.tsx","*.js","*.jsx" -Recurse | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "process\.env\.REACT_APP_") {
        Write-Host "  📝 Updating: $($file.FullName)" -ForegroundColor Yellow
        $newContent = $content -replace "process\.env\.REACT_APP_", "import.meta.env.VITE_APP_"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $filesUpdated++
    }
}

Write-Host ""
Write-Host "✅ Updated $filesUpdated files!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env files (replace REACT_APP_ with VITE_APP_)" -ForegroundColor White
Write-Host "2. Run: npm install" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
