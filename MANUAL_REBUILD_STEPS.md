# Manual Git History Rebuild Steps

Since automated scripts are having shell issues, here's how to do it manually:

## Step 1: Open PowerShell as Administrator

Right-click on PowerShell and select "Run as Administrator"

## Step 2: Navigate to Your Project

```powershell
cd C:\Users\ammar\Desktop\AmmarBin
```

## Step 3: Create Backup (Optional but Recommended)

```powershell
git branch backup-before-rebuild
```

## Step 4: Delete Git History

```powershell
Remove-Item -Recurse -Force .git
```

## Step 5: Initialize New Repository

```powershell
git init
git branch -M main
git config user.name "ammarbinanwarfuad"
git config user.email "ammarbinanwarfuad@gmail.com"
```

## Step 6: Run the PowerShell Script

Now that we're in a clean PowerShell environment:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\rebuild-git-history.ps1
```

## Alternative: Use Git Bash

If PowerShell continues to have issues:

1. Open **Git Bash** (comes with Git for Windows)
2. Navigate to your project:
   ```bash
   cd /c/Users/ammar/Desktop/AmmarBin
   ```
3. Run the bash script:
   ```bash
   chmod +x rebuild-git-history.sh
   ./rebuild-git-history.sh
   ```

## Step 7: Verify the New History

```powershell
git log --oneline
git log --graph --all --decorate --oneline
```

## Step 8: Force Push to Remote (If Needed)

⚠️ **WARNING**: This will overwrite your remote repository history!

```powershell
git remote add origin https://github.com/yourusername/yourrepo.git
git push -f origin main
```

## Troubleshooting

### If you get "execution policy" errors:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### If you need to restore the old history:
```powershell
git checkout backup-before-rebuild
git branch -D main
git checkout -b main
```

### If Git Bash doesn't work:
Make sure Git for Windows is installed from: https://git-scm.com/download/win

## Quick One-Liner (PowerShell)

```powershell
cd C:\Users\ammar\Desktop\AmmarBin; Remove-Item -Recurse -Force .git; git init; git branch -M main; git config user.name "ammarbinanwarfuad"; git config user.email "ammarbinanwarfuad@gmail.com"; Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\rebuild-git-history.ps1
```
