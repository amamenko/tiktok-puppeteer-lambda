# Use the official Node.js 16 image as the base image
FROM node:16 AS builder

# Set npm registry
RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force

# Set working directory and copy over the app
WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run build

# Use a multi-stage build to optimize the image size for Lambda
FROM public.ecr.aws/lambda/nodejs:16 AS lambda

# Install necessary dependencies for running Chrome in the Lambda layer
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

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy the necessary files from the builder stage
COPY --from=builder /usr/app/dist/index.js ./
COPY --from=builder /usr/app/dist/functions ./functions
COPY --from=builder /usr/app/dist/interfaces ./interfaces
COPY --from=builder /usr/app/dist/models ./models
COPY --from=builder /usr/app/dist/logger ./logger

CMD ["index.handler"]