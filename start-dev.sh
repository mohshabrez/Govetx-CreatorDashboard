#!/bin/bash
# Creator Dashboard Development Startup Script
# This script starts both the client and server applications in development mode

echo -e "\e[32mStarting Creator Dashboard in development mode...\e[0m"

# Start the server in a new terminal window
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell app "Terminal" to do script "cd '$PWD'/server && echo -e \"\e[36mStarting server...\e[0m\" && export NODE_ENV=development && npx tsx server/index.ts"'
else
  # Linux
  gnome-terminal -- bash -c "cd $PWD/server && echo -e '\e[36mStarting server...\e[0m' && export NODE_ENV=development && npx tsx server/index.ts; exec bash" || 
  xterm -e "cd $PWD/server && echo -e '\e[36mStarting server...\e[0m' && export NODE_ENV=development && npx tsx server/index.ts; exec bash" || 
  echo -e "\e[31mCould not open new terminal window for server. Please start server manually.\e[0m"
fi

# Start the client in a new terminal window
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell app "Terminal" to do script "cd '$PWD'/client && echo -e \"\e[36mStarting client...\e[0m\" && npm run dev"'
else
  # Linux
  gnome-terminal -- bash -c "cd $PWD/client && echo -e '\e[36mStarting client...\e[0m' && npm run dev; exec bash" || 
  xterm -e "cd $PWD/client && echo -e '\e[36mStarting client...\e[0m' && npm run dev; exec bash" || 
  echo -e "\e[31mCould not open new terminal window for client. Please start client manually.\e[0m"
fi

echo -e "\e[32mBoth applications have been started in separate windows.\e[0m"
echo -e "\e[33mServer: http://localhost:3000\e[0m"
echo -e "\e[33mClient: http://localhost:5173\e[0m" 