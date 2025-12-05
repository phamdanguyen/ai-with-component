.PHONY: help docker-build docker-up docker-down docker-logs docker-clean docker-rebuild

help:
	@echo "GenUI Platform - Docker Commands"
	@echo "=================================="
	@echo ""
	@echo "docker-build    Build Docker images"
	@echo "docker-up       Start all services"
	@echo "docker-down     Stop all services"
	@echo "docker-logs     View service logs"
	@echo "docker-clean    Remove images and volumes"
	@echo "docker-rebuild  Rebuild everything fresh"
	@echo ""

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting GenUI services..."
	docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:3000/playground"
	@echo ""

docker-down:
	@echo "Stopping GenUI services..."
	docker-compose down

docker-logs:
	docker-compose logs -f frontend

docker-clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f

docker-rebuild: docker-clean docker-build docker-up
	@echo "✅ Fresh rebuild complete!"

# Alternative commands for Windows (batch)
.PHONY: help-windows docker-build-windows docker-up-windows docker-down-windows

help-windows:
	@echo GenUI Platform - Docker Commands (Windows)
	@echo ==========================================
	@echo.
	@echo docker-build-windows    Build Docker images
	@echo docker-up-windows       Start all services
	@echo docker-down-windows     Stop all services
	@echo.

docker-build-windows:
	docker-compose build

docker-up-windows:
	docker-compose up -d

docker-down-windows:
	docker-compose down
