#!/bin/bash

# NoseCone Bot Docker Build Script
# This script builds Docker images for different environments

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
IMAGE_NAME="nosecone-bot"
REGISTRY="${REGISTRY:-}"
VERSION="${VERSION:-latest}"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
NoseCone Bot Docker Build Script

Usage: $0 [OPTIONS] [TARGET]

TARGETS:
    dev         Build development image
    prod        Build production image (default)
    all         Build all images

OPTIONS:
    -h, --help              Show this help message
    -v, --version VERSION   Set image version (default: latest)
    -r, --registry REGISTRY Set registry URL
    --no-cache             Build without using cache
    --push                 Push images to registry after build
    --tag-latest           Tag image as latest
    --multi-arch           Build multi-architecture image

EXAMPLES:
    $0                      # Build production image
    $0 dev                  # Build development image
    $0 --version 1.2.3      # Build with specific version
    $0 --push --tag-latest  # Build, tag as latest, and push
    $0 --multi-arch prod    # Build multi-arch production image

ENVIRONMENT VARIABLES:
    REGISTRY    Docker registry URL
    VERSION     Image version tag
    DOCKER_BUILDKIT Enable BuildKit (recommended)

EOF
}

# Parse command line arguments
PUSH=false
NO_CACHE=false
TAG_LATEST=false
MULTI_ARCH=false
TARGET="prod"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --tag-latest)
            TAG_LATEST=true
            shift
            ;;
        --multi-arch)
            MULTI_ARCH=true
            shift
            ;;
        dev|prod|all)
            TARGET="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validation
if [ "$PUSH" = true ] && [ -z "$REGISTRY" ]; then
    log_error "Registry URL is required when pushing images"
    exit 1
fi

# Build arguments
BUILD_ARGS=(
    --build-arg "BUILD_DATE=$BUILD_DATE"
    --build-arg "VCS_REF=$VCS_REF"
    --build-arg "VERSION=$VERSION"
)

if [ "$NO_CACHE" = true ]; then
    BUILD_ARGS+=(--no-cache)
fi

# Docker context
DOCKER_CONTEXT="../"
DOCKERFILE="Dockerfile"

# Enable BuildKit for better performance
export DOCKER_BUILDKIT=1

log_info "Starting NoseCone Bot Docker build"
log_info "Target: $TARGET"
log_info "Version: $VERSION"
log_info "Registry: ${REGISTRY:-none}"
log_info "Build date: $BUILD_DATE"
log_info "VCS ref: $VCS_REF"

# Function to build image
build_image() {
    local target="$1"
    local image_suffix="$2"
    
    local full_image_name="$IMAGE_NAME$image_suffix"
    if [ -n "$REGISTRY" ]; then
        full_image_name="$REGISTRY/$full_image_name"
    fi
    
    log_info "Building $target image: $full_image_name:$VERSION"
    
    if [ "$MULTI_ARCH" = true ]; then
        # Multi-architecture build using buildx
        docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --target "$target" \
            --tag "$full_image_name:$VERSION" \
            "${BUILD_ARGS[@]}" \
            -f "$DOCKERFILE" \
            "$DOCKER_CONTEXT"
    else
        # Standard build
        docker build \
            --target "$target" \
            --tag "$full_image_name:$VERSION" \
            "${BUILD_ARGS[@]}" \
            -f "$DOCKERFILE" \
            "$DOCKER_CONTEXT"
    fi
    
    # Tag as latest if requested
    if [ "$TAG_LATEST" = true ]; then
        log_info "Tagging as latest: $full_image_name:latest"
        docker tag "$full_image_name:$VERSION" "$full_image_name:latest"
    fi
    
    # Push if requested
    if [ "$PUSH" = true ]; then
        log_info "Pushing image: $full_image_name:$VERSION"
        docker push "$full_image_name:$VERSION"
        
        if [ "$TAG_LATEST" = true ]; then
            log_info "Pushing latest tag: $full_image_name:latest"
            docker push "$full_image_name:latest"
        fi
    fi
    
    log_success "Successfully built $target image: $full_image_name:$VERSION"
}

# Build based on target
case $TARGET in
    dev)
        build_image "build" "-dev"
        ;;
    prod)
        build_image "runtime" ""
        ;;
    all)
        log_info "Building all images"
        build_image "build" "-dev"
        build_image "runtime" ""
        ;;
    *)
        log_error "Unknown target: $TARGET"
        exit 1
        ;;
esac

# Show final summary
log_success "Build completed successfully!"

if [ "$PUSH" = false ]; then
    log_info "Images built locally. Use --push to push to registry."
fi

# Show built images
log_info "Built images:"
if [ "$TARGET" = "all" ]; then
    docker images | grep "$IMAGE_NAME" | head -4
else
    docker images | grep "$IMAGE_NAME" | head -2
fi

log_info "Build script completed" 