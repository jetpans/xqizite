#!/bin/bash
# deploy_flask_nextjs.sh
# Deploys Flask backend and Next.js frontend containers

# -------- CONFIGURATION --------
# Docker images
FLASK_IMAGE="jetpans/xqzite:backend-latest"
NEXTJS_IMAGE="jetpans/xqzite:frontend-latest"

# Container names
FLASK_CONTAINER="xqz-backend"
NEXTJS_CONTAINER="xqz-frontend"

# Ports mapping
FLASK_PORT="5001:5000"      # host:container
NEXTJS_PORT="3000:3000"       # host:container (frontend production)

# Flask environment variables (example)
FLASK_ENV_VARS="-e FLASK_ENV=${FLASK_ENV} -e DB_CONNECT_URL_PROD=${DB_CONNECT_URL_PROD} -e SECRET_KEY=${SECRET_KEY} -e JWT_SECRET_KEY=${JWT_SECRET_KEY}"

# -------- INSTALL DOCKER IF MISSING --------
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# -------- PULL IMAGES --------
echo "Pulling Docker images..."
docker pull $FLASK_IMAGE
docker pull $NEXTJS_IMAGE

# -------- STOP AND REMOVE EXISTING CONTAINERS --------
for CONTAINER in $FLASK_CONTAINER $NEXTJS_CONTAINER; do
    if [ "$(docker ps -aq -f name=$CONTAINER)" ]; then
        echo "Stopping and removing existing container $CONTAINER..."
        docker stop $CONTAINER
        docker rm $CONTAINER
    fi
done

# -------- RUN CONTAINERS --------
echo "Starting Flask container..."
docker run -d --name $FLASK_CONTAINER $FLASK_ENV_VARS -p $FLASK_PORT $FLASK_IMAGE

echo "Starting Next.js container..."
docker run -d --name $NEXTJS_CONTAINER -p $NEXTJS_PORT $NEXTJS_IMAGE

echo "Deployment complete!"
