FROM node:16.20.2-alpine

# create application directory
RUN mkdir -p /app

WORKDIR /app

# copy package and package-json file
COPY frontend/package*.json ./

# install node packages
RUN npm install

COPY frontend/ ./

RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Set environment variables
ENV PORT=3000

RUN npm install -g serve

# Command to run the app, serving the built static files
CMD ["serve", "-s", "build"]