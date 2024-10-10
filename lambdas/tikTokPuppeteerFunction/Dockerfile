# Use the official Node.js 16 image as the base image
FROM node:16 AS builder

# Set npm registry
RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force

# Install necessary dependencies for running Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Use a multi-stage build to optimize the image size for Lambda
FROM public.ecr.aws/lambda/nodejs:16 AS lambda

# Copy the necessary files from the builder stage
COPY --from=builder /app /var/task

# Command to run the application (adjust the command as necessary)
CMD ["index.handler"]