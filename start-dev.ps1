# Creator Dashboard Development Startup Script
# This script starts both the client and server applications in development mode

Write-Host "Starting Creator Dashboard in development mode..." -ForegroundColor Green

# Start the server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD/server; Write-Host 'Starting server...' -ForegroundColor Cyan; `$env:NODE_ENV='development'; npx tsx server/index.ts"

# Start the client in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD/client; Write-Host 'Starting client...' -ForegroundColor Cyan; npm run dev"

Write-Host "Both applications have been started in separate windows." -ForegroundColor Green
Write-Host "Server: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Client: http://localhost:5000" -ForegroundColor Yellow 


ENV ELEMENTS:

MONGODB_URI=mongodb+srv://govertx_admin:govertx@cluster0.u0jhkvi.mongodb.net/govertx?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b7c9fc26b787130ea4dd819074c8ede53dc57d71eb881504462b9e1561d8dab2a70d1027bd52cb76287b5ba94a3b587b22642283f9b65229b17914e5107f8e3c