# Install library and build source code
git pull
npm install
npm run build

# Remove current build
Remove-Item \\11.11.4.221\staging-hrms.tma.com.vn\www\* -Force -Recurse

# Copy new build to production folder
robocopy.exe dist \\11.11.4.221\staging-hrms.tma.com.vn\www\ /r:10 /w:5 /MT:32 /S /E /XO