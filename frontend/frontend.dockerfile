# Frontend Dockerfile
FROM node:18.18.0-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY ./frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY ./frontend ./

# Increase Node.js memory limit globally
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set the environment variable for build time
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Run the build
RUN npm run build

# Install 'serve' to serve the production build
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "build", "-l", "3000"]
