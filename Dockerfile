# Build stage - use full slim image for building
FROM node:20-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application files
COPY . .

# Build the frontend and backend
RUN npm run build

# Production stage - use Google Distroless (minimal vulnerabilities)
FROM gcr.io/distroless/nodejs20-debian12:latest

# Set working directory
WORKDIR /app

# Copy built application and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application (distroless uses nonroot user by default)
CMD ["dist/index.js"]
