# Frontend Dockerfile
FROM node:18.18.0-alpine

# Create and set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY ./frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY ./frontend ./

COPY ./frontend/.env.production /app/frontend/.env.production

# Increase Node.js memory limit globally - may not longer be required
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Run the build
RUN npm run build

# Install 'serve' to serve the build directory
RUN npm install -g serve

# Expose the port to match the host
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "build", "-l", "3000"]
