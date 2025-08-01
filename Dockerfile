# Stage 1: Build the application
FROM node:18-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build server and client with NODE_ENV set only for this command
RUN NODE_ENV=production npm run build:prod

# Stage 2: Create the production image
FROM node:18-slim

# Set environment values
ENV SEQUELIZE_CONNECT="src/server/models/sequelize-sqlite-docker.yaml"
ENV DEBUG="nffyi-rest:*"
ENV PORT="3000"
ENV NODE_ENV="production"

# Create app directory
WORKDIR /usr/src/app

# Install sqlite3 for runtime
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
# Copy production-necessary files
COPY --from=builder /usr/src/app/src/server/models/sequelize-sqlite-docker.yaml ./src/server/models/sequelize-sqlite-docker.yaml

# Expose the port the app runs on
EXPOSE 3000

# Start the server
ENTRYPOINT [ "node", "dist/server/server.js" ]
