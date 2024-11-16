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

# Run the build
RUN npm run build

COPY ./frontend/replace-env.sh .

# Install 'serve' to serve the production build
RUN npm install -g serve

# Expose the port
EXPOSE 3000

ENTRYPOINT ["./replace-env.sh"]

# Command to run the app
CMD ["serve", "-s", "build", "-l", "3000"]
