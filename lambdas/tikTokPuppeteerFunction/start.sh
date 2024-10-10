#!/bin/bash

# Remount /tmp/.X11-unix as read-write
mount -o remount,rw /tmp/.X11-unix

# Remove the Xvfb lock file if it exists
if [ -e /tmp/.X99-lock ]; then
    echo "Removing Xvfb lock file..."
    rm -f /tmp/.X99-lock
fi

echo "Starting Xvfb with the following directory contents:"
ls -al

# Start Xvfb without listening on IPv6
Xvfb :99 -screen 0 1280x1024x24 -nolisten tcp &

# Wait a few seconds to make sure Xvfb starts
sleep 3

# Start the Lambda function handler
exec node /var/task/index.js
