FROM node:18-alpine

WORKDIR /app

# Copy package files and configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Copy entire project
COPY . .

# # Copy server directory
# COPY server ./server

# Install dependencies (only production)
RUN npm install 

# Build both client and server
RUN npm run build


# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV PORT=8080

# Start the server
CMD ["npm", "run", "start"]