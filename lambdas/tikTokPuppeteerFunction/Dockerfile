# Stage 1: Build the project
FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run build

# Stage 2: Final stage with xvfb setup
FROM public.ecr.aws/lambda/nodejs:18

# Install xvfb and related dependencies
RUN yum install -y \
    xorg-x11-utils \
    xorg-x11-server-Xvfb \
    xorg-x11-xauth \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-cyrillic \
    alsa-lib \
    && yum clean all

# Set the DISPLAY environment variable to use xvfb
ENV DISPLAY=:99

# Copy the start script into the container and make it executable
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

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

# Set up permissions for Xvfb in the Docker container
RUN mkdir -p /tmp/.X11-unix && \
    chmod 1777 /tmp/.X11-unix && \
    chown root:root /tmp/.X11-unix

# Use the start.sh script as the entry point
ENTRYPOINT ["/usr/local/bin/start.sh"]

# CMD to run the Lambda function handler
CMD ["./index.handler"]