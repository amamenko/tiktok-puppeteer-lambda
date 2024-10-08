# Use the official Node.js 16 image as the base image for building
FROM node:16 AS builder

# Set npm registry
RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force

# Set working directory and copy over the app
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use the AWS Lambda Node.js base image
FROM public.ecr.aws/lambda/nodejs:18 AS lambda

# Install necessary packages for running headless Chromium
RUN yum install -y \
    fontconfig \
    freetype \
    libXrender \
    libXext \
    libX11 \
    libXScrnSaver \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-scalable \
    xorg-x11-utils \
    xorg-x11-server-Xvfb \
    && yum clean all

# Download headless Chromium
RUN curl -L -o /usr/local/bin/chromium \
    https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0/chromium \
    && chmod +x /usr/local/bin/chromium

# Copy the necessary files from the builder stage
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/index.js ./
COPY --from=builder /usr/app/dist/functions ./functions
COPY --from=builder /usr/app/dist/interfaces ./interfaces
COPY --from=builder /usr/app/dist/models ./models
COPY --from=builder /usr/app/dist/logger ./logger
COPY --from=builder /usr/app/node_modules ./node_modules

# Set the executable for Chromium
ENV CHROME_BIN=/usr/local/bin/chromium

# Set the command for the Lambda function
CMD ["index.handler"]