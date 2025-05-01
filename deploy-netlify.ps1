# PowerShell script for deploying to Netlify

Write-Host "Building client for production..." -ForegroundColor Green
cd client
npm install
npm run build

Write-Host "Deploying to Netlify..." -ForegroundColor Green
npx netlify-cli deploy --prod --dir=dist

Write-Host "Deployment complete!" -ForegroundColor Green 