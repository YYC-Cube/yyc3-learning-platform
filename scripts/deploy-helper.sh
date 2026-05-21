#!/bin/bash
# YYC³ Learning Platform - Deployment Helper Script
# Optimized for learning.yyc3.top deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="learning.yyc3.top"
REPO_NAME="yyc3-learning-platform"
BRANCH="main"

# Functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_git_status() {
    print_info "Checking git status..."

    if [ -n "$(git status --porcelain)" ]; then
        print_error "Working directory is not clean"
        print_warning "Please commit or stash changes before deploying"
        return 1
    fi

    print_success "Git status is clean"
}

check_current_branch() {
    print_info "Checking current branch..."

    current_branch=$(git rev-parse --abbrev-ref HEAD)

    if [ "$current_branch" != "$BRANCH" ]; then
        print_warning "You are on branch '$current_branch', not '$BRANCH'"
        read -p "Continue with deployment? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Deployment cancelled"
            return 1
        fi
    fi

    print_success "Branch check completed"
}

run_tests() {
    print_info "Running test suite..."

    if pnpm test:run; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        return 1
    fi
}

run_type_check() {
    print_info "Running TypeScript type check..."

    if pnpm type-check; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript check failed"
        return 1
    fi
}

run_lint() {
    print_info "Running ESLint..."

    if pnpm lint; then
        print_success "ESLint check passed"
    else
        print_error "ESLint check failed"
        return 1
    fi
}

create_deployment_tag() {
    print_info "Creating deployment tag..."

    version="v$(date +%Y.%m.%d)-$(git rev-parse --short HEAD)"
    tag_message="Deployment $version for $DOMAIN"

    if git tag -a "$version" -m "$tag_message"; then
        print_success "Created tag: $version"
    else
        print_warning "Failed to create tag, continuing..."
    fi
}

push_to_remote() {
    print_info "Pushing to remote repository..."

    if git push origin "$BRANCH"; then
        print_success "Code pushed to remote"
    else
        print_error "Failed to push to remote"
        return 1
    fi

    # Push tags if any were created
    if [ -n "$(git tag -l)" ]; then
        print_info "Pushing tags..."
        git push origin --tags || print_warning "Failed to push some tags"
    fi
}

wait_for_deployment() {
    print_info "Waiting for deployment to complete..."
    print_info "GitHub Actions will automatically deploy your changes"
    print_info "Monitor deployment at: https://github.com/YYC-Cube/$REPO_NAME/actions"

    # Wait a bit and check if site is accessible
    sleep 30

    print_info "Checking if $DOMAIN is accessible..."

    max_attempts=12
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "https://$DOMAIN" > /dev/null; then
            print_success "Deployment completed successfully!"
            echo ""
            echo "🌐 Your site is live at: https://$DOMAIN"
            return 0
        fi

        echo "Attempt $attempt/$max_attempts: Waiting for deployment..."
        sleep 10
        ((attempt++))
    done

    print_warning "Deployment is still in progress. Check GitHub Actions for status."
}

show_deployment_summary() {
    echo ""
    echo "=========================================="
    echo "🚀 YYC³ Learning Platform - Deployment"
    echo "=========================================="
    echo ""
    echo "📊 Deployment Details:"
    echo "  • Domain: $DOMAIN"
    echo "  • Branch: $BRANCH"
    echo "  • Repository: $REPO_NAME"
    echo "  • Timestamp: $(date)"
    echo ""
    echo "🔗 Quick Links:"
    echo "  • Live Site: https://$DOMAIN"
    echo "  • GitHub Actions: https://github.com/YYC-Cube/$REPO_NAME/actions"
    echo "  • Repository: https://github.com/YYC-Cube/$REPO_NAME"
    echo ""
    echo "=========================================="
    echo ""
}

# Main deployment flow
main() {
    show_deployment_summary

    # Parse command line arguments
    SKIP_TESTS=false
    FORCE_DEPLOY=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --force)
                FORCE_DEPLOY=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-tests    Skip running tests before deployment"
                echo "  --force         Force deployment even if checks fail"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Pre-deployment checks
    if ! check_git_status && [ "$FORCE_DEPLOY" = false ]; then
        exit 1
    fi

    if ! check_current_branch; then
        exit 1
    fi

    # Quality checks
    if [ "$SKIP_TESTS" = false ]; then
        if ! run_type_check && [ "$FORCE_DEPLOY" = false ]; then
            print_error "TypeScript check failed. Use --force to deploy anyway."
            exit 1
        fi

        if ! run_lint && [ "$FORCE_DEPLOY" = false ]; then
            print_error "Lint check failed. Use --force to deploy anyway."
            exit 1
        fi

        if ! run_tests && [ "$FORCE_DEPLOY" = false ]; then
            print_error "Tests failed. Use --force to deploy anyway."
            exit 1
        fi
    else
        print_warning "Skipping tests as requested"
    fi

    # Create deployment tag
    create_deployment_tag

    # Push to remote
    if ! push_to_remote; then
        exit 1
    fi

    # Wait for deployment
    wait_for_deployment

    print_success "Deployment process completed!"
}

# Run main function
main "$@"
