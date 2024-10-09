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
    xorg-x11-server-Xvfb \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXtst \
    libnss3 \
    libXScrnSaver \
    alsa-lib \
    atk \
    cups-libs \
    gtk3 \
    ipa-gothic-fonts \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-Type1 \
    xorg-x11-fonts-misc \
    xorg-x11-utils \
    && yum clean all

# Set xvfb as the default display
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