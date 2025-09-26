#!/bin/bash
# deploy_flask_nextjs.sh
# Deploys Flask backend and Next.js frontend containers

# -------- CONFIGURATION --------
# Docker images
FLASK_IMAGE="jetpans/xqzite:backend-latest"
NEXTJS_IMAGE="jetpans/xqzite:frontend-latest"


# Ports mapping
FLASK_PORT="5000:5000"      # host:container
NEXTJS_PORT="3000:3000"       # host:container (frontend production)

# Flask environment variables (example)
FLASK_ENV_VARS="-e FLASK_ENV=${FLASK_ENV} -e DB_CONNECT_URL_PROD=${DB_CONNECT_URL_PROD} -e SECRET_KEY=${SECRET_KEY} -e JWT_SECRET_KEY=${JWT_SECRET_KEY}"

docker build -f ./backend/Dockerfile -t $FLASK_IMAGE ./backend
docker build -f ./Dockerfile -t $NEXTJS_IMAGE .


docker run -d  $FLASK_ENV_VARS -p $FLASK_PORT $FLASK_IMAGE

echo "Starting Next.js container..."
docker run -d -p $NEXTJS_PORT $NEXTJS_IMAGE

echo "Running complete!"
