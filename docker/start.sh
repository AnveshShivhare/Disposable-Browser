#!/bin/bash

# Start virtual display
Xvfb :99 -screen 0 1280x720x24 &
sleep 1

# Launch Chromium on virtual display
DISPLAY=:99 chromium \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  http://google.com &
sleep 2

# Start VNC server
x11vnc -display :99 -passwd secret -forever -shared &
sleep 1

# noVNC path on Debian is different — this is the correct one
websockify --web=/usr/share/novnc/ 6080 localhost:5900 &

# Keep container alive
wait