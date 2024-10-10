#!/bin/bash

# Start Xvfb in the background
Xvfb :99 -screen 0 1280x1024x24 &

# Wait a few seconds to make sure Xvfb starts
sleep 3

# Start the Lambda function handler
exec "$@"