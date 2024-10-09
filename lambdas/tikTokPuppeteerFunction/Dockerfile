# Stage 1: Build the project
FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run build

# Stage 2: Final stage with xvfb setup
FROM public.ecr.aws/lambda/nodejs:18

# Install xvfb and related dependencies
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && \
    apt-get install -y \
    xvfb \
    x11-xkb-utils \
    xfonts-100dpi \
    xfonts-75dpi \
    xfonts-scalable \
    xfonts-cyrillic \
    libxfont2 \
    x11-apps \
    dbus-x11 \
    libxtst6 \
    libnss3 \
    libasound2 \
    && apt-get clean

# Set the DISPLAY environment variable to use xvfb
ENV DISPLAY=:99

# Start Xvfb
RUN nohup /usr/bin/Xvfb :99 -screen 0 1280x1024x24 &

# Set working directory and copy over the app
WORKDIR ${LAMBDA_TASK_ROOT}
COPY package.json ./
COPY --from=builder /usr/app/dist/index.js ./
COPY --from=builder /usr/app/dist/functions ./functions
COPY --from=builder /usr/app/dist/interfaces ./interfaces
COPY --from=builder /usr/app/dist/models ./models
COPY --from=builder /usr/app/dist/logger ./logger

# Install production dependencies
RUN npm install --production

# Set the entry point
CMD ["index.handler"]