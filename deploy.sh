#!/bin/bash

# Admin Dashboard Deployment Script for GCP Cloud Run
echo "🚀 Deploying Admin Dashboard to GCP Cloud Run..."

# Set variables
PROJECT_ID=${PROJECT_ID:-"your-project-id"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME="admin-dashboard"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

# Build the Docker image with build arguments
echo "📦 Building Docker image..."
docker build \
    --build-arg VITE_API_BASE_URL=https://api.curk.in/api/v1 \
    --build-arg VITE_USE_API_KEY=false \
    -t $IMAGE_NAME:latest .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Push to Container Registry
    echo "📤 Pushing image to Container Registry..."
    docker push $IMAGE_NAME:latest
    
    if [ $? -eq 0 ]; then
        echo "✅ Image pushed successfully!"
        
        # Deploy to Cloud Run
        echo "🌐 Deploying to Cloud Run..."
        gcloud run deploy $SERVICE_NAME \
            --image $IMAGE_NAME:latest \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated \
            --port 8080 \
            --memory 512Mi \
            --cpu 1 \
            --min-instances 0 \
            --max-instances 10 \
            --concurrency 1000 \
            --timeout 300 \
            --set-env-vars NODE_ENV=production \
            --set-env-vars VITE_API_BASE_URL=https://api.curk.in/api/v1 \
            --set-env-vars VITE_USE_API_KEY=false
        
        if [ $? -eq 0 ]; then
            echo "🎉 Deployment successful!"
            echo "🌍 Service URL: https://$SERVICE_NAME-$PROJECT_ID.a.run.app"
        else
            echo "❌ Cloud Run deployment failed!"
            exit 1
        fi
    else
        echo "❌ Failed to push image to Container Registry!"
        exit 1
    fi
else
    echo "❌ Docker build failed!"
    exit 1
fi