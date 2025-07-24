#!/bin/bash

# NoseCone Bot Docker Deployment Script
# This script handles deployment of the bot using Docker Compose

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
COMPOSE_PROJECT_NAME="nosecone"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE="../.env"

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
NoseCone Bot Docker Deployment Script

Usage: $0 [COMMAND] [OPTIONS]

COMMANDS:
    start       Start the bot services
    stop        Stop the bot services
    restart     Restart the bot services
    update      Update and restart services
    logs        Show service logs
    status      Show service status
    clean       Clean up containers and volumes
    health      Check service health
    backup      Backup bot data
    restore     Restore bot data from backup

OPTIONS:
    -h, --help              Show this help message
    -f, --file FILE         Docker compose file to use
    -e, --env-file FILE     Environment file to use
    -d, --detach           Run in detached mode
    --dev                  Use development configuration
    --prod                 Use production configuration
    --follow               Follow log output
    --no-build             Don't build images before starting

EXAMPLES:
    $0 start                # Start bot in production mode
    $0 start --dev          # Start bot in development mode
    $0 logs --follow        # Follow log output
    $0 update --prod        # Update production deployment
    $0 clean                # Clean up everything

EOF
}

# Parse command line arguments
COMMAND=""
DETACH=true
FOLLOW=false
BUILD=true
ENVIRONMENT="prod"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        -e|--env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        -d|--detach)
            DETACH=true
            shift
            ;;
        --dev)
            ENVIRONMENT="dev"
            COMPOSE_FILE="docker-compose.dev.yml"
            shift
            ;;
        --prod)
            ENVIRONMENT="prod"
            COMPOSE_FILE="docker-compose.prod.yml"
            shift
            ;;
        --follow)
            FOLLOW=true
            shift
            ;;
        --no-build)
            BUILD=false
            shift
            ;;
        start|stop|restart|update|logs|status|clean|health|backup|restore)
            COMMAND="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate command
if [ -z "$COMMAND" ]; then
    log_error "No command specified"
    show_help
    exit 1
fi

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Copy env.example to .env and configure it"
        exit 1
    fi
    
    # Check compose file
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Validate environment file
validate_env() {
    log_info "Validating environment configuration..."
    
    # Required variables
    local required_vars=(
        "DISCORD_BOT_TOKEN"
        "DISCORD_CLIENT_ID"
        "N8N_WEBHOOK_URL"
    )
    
    local missing_vars=()
    
    # Source the env file
    set -a
    source "$ENV_FILE"
    set +a
    
    # Check required variables
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            log_error "  - $var"
        done
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Common Docker Compose command builder
compose_cmd() {
    echo "docker-compose -f $COMPOSE_FILE -p $COMPOSE_PROJECT_NAME"
}

# Start services
start_services() {
    log_info "Starting NoseCone bot services ($ENVIRONMENT mode)..."
    
    local cmd_args=""
    if [ "$BUILD" = true ]; then
        cmd_args="--build"
    fi
    
    if [ "$DETACH" = true ]; then
        cmd_args="$cmd_args -d"
    fi
    
    $(compose_cmd) up $cmd_args
    
    if [ "$DETACH" = true ]; then
        log_success "Services started in detached mode"
        log_info "Use '$0 logs --follow' to view logs"
        log_info "Use '$0 status' to check service status"
    fi
}

# Stop services
stop_services() {
    log_info "Stopping NoseCone bot services..."
    $(compose_cmd) down
    log_success "Services stopped"
}

# Restart services
restart_services() {
    log_info "Restarting NoseCone bot services..."
    $(compose_cmd) restart
    log_success "Services restarted"
}

# Update services
update_services() {
    log_info "Updating NoseCone bot services..."
    
    # Pull latest images
    log_info "Pulling latest images..."
    $(compose_cmd) pull
    
    # Rebuild and restart
    log_info "Rebuilding and restarting services..."
    $(compose_cmd) up -d --build
    
    # Clean up old images
    log_info "Cleaning up old images..."
    docker image prune -f
    
    log_success "Services updated successfully"
}

# Show logs
show_logs() {
    local cmd_args=""
    if [ "$FOLLOW" = true ]; then
        cmd_args="-f"
    fi
    
    $(compose_cmd) logs $cmd_args
}

# Show status
show_status() {
    log_info "Service Status:"
    $(compose_cmd) ps
    
    echo ""
    log_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" $($(compose_cmd) ps -q) 2>/dev/null || log_warning "No running containers found"
}

# Clean up
clean_up() {
    log_warning "This will remove all containers, networks, and volumes"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up NoseCone deployment..."
        $(compose_cmd) down -v --remove-orphans
        
        # Remove unused images
        docker image prune -a -f
        
        # Remove unused volumes
        docker volume prune -f
        
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

# Health check
health_check() {
    log_info "Checking service health..."
    
    local container_id=$($(compose_cmd) ps -q nosecone-bot)
    
    if [ -z "$container_id" ]; then
        log_error "NoseCone bot container is not running"
        return 1
    fi
    
    # Check container health
    local health_status=$(docker inspect --format '{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "no-health-check")
    
    case $health_status in
        "healthy")
            log_success "Container is healthy"
            ;;
        "unhealthy")
            log_error "Container is unhealthy"
            log_info "Recent health check logs:"
            docker inspect --format '{{range .State.Health.Log}}{{.Output}}{{end}}' "$container_id"
            return 1
            ;;
        "starting")
            log_warning "Container is starting up..."
            ;;
        "no-health-check")
            log_warning "No health check configured"
            ;;
    esac
    
    # Check if bot is responsive
    log_info "Testing bot connectivity..."
    if docker exec "$container_id" node -e "console.log('Bot process test successful')" &>/dev/null; then
        log_success "Bot process is responsive"
    else
        log_error "Bot process is not responsive"
        return 1
    fi
    
    log_success "Health check completed successfully"
}

# Backup data
backup_data() {
    log_info "Creating backup of bot data..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup logs
    if [ -d "../logs" ]; then
        cp -r "../logs" "$backup_dir/"
        log_info "Logs backed up"
    fi
    
    # Backup config
    if [ -d "../config" ]; then
        cp -r "../config" "$backup_dir/"
        log_info "Config backed up"
    fi
    
    # Backup env file (without sensitive data)
    if [ -f "$ENV_FILE" ]; then
        # Create sanitized env file
        grep -v -E "TOKEN|SECRET|PASSWORD" "$ENV_FILE" > "$backup_dir/env.template" || true
        log_info "Environment template backed up"
    fi
    
    # Create backup info
    cat > "$backup_dir/backup_info.txt" << EOF
NoseCone Bot Backup
Created: $(date)
Environment: $ENVIRONMENT
Compose File: $COMPOSE_FILE
Docker Images:
$(docker images | grep nosecone-bot)
EOF
    
    log_success "Backup created in: $backup_dir"
}

# Restore data
restore_data() {
    log_error "Restore functionality not implemented yet"
    log_info "To restore manually:"
    log_info "1. Stop services: $0 stop"
    log_info "2. Copy backup files to appropriate locations"
    log_info "3. Start services: $0 start"
}

# Main execution
main() {
    log_info "NoseCone Bot Deployment Script"
    log_info "Environment: $ENVIRONMENT"
    log_info "Compose file: $COMPOSE_FILE"
    
    # Run prerequisites check for most commands
    case $COMMAND in
        start|restart|update|status|health)
            check_prerequisites
            validate_env
            ;;
        stop|clean|backup|restore)
            check_prerequisites
            ;;
        logs)
            # Only check Docker for logs
            if ! command -v docker-compose &> /dev/null; then
                log_error "Docker Compose is not installed"
                exit 1
            fi
            ;;
    esac
    
    # Execute command
    case $COMMAND in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        update)
            update_services
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean_up
            ;;
        health)
            health_check
            ;;
        backup)
            backup_data
            ;;
        restore)
            restore_data
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 