import time
import logging
from collections import defaultdict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from backend.app.config import settings

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, requests_per_minute: int):
        self.limit = requests_per_minute
        self.clients = defaultdict(list)

    def is_allowed(self, ip: str) -> bool:
        now = time.time()
        # Clean up requests older than 60 seconds
        self.clients[ip] = [req_time for req_time in self.clients[ip] if now - req_time < 60]
        
        if len(self.clients[ip]) >= self.limit:
            return False
            
        self.clients[ip].append(now)
        return True

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = None):
        super().__init__(app)
        self.limiter = RateLimiter(limit or settings.RATE_LIMIT_PER_MINUTE)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Bypass rate limits for health and metric endpoints
        if request.url.path in ["/health", "/metrics", "/model-info"]:
            return await call_next(request)

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        if not self.limiter.is_allowed(client_ip):
            logger.warning(f"Rate limit exceeded for client: {client_ip} on path {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please try again in a minute."}
            )

        return await call_next(request)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Incoming: {request.method} {request.url.path} from {client_ip}")

        try:
            response = await call_next(request)
            duration = time.time() - start_time
            logger.info(
                f"Outgoing: {request.method} {request.url.path} - "
                f"Status: {response.status_code} - Duration: {duration:.4f}s"
            )
            return response
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Exception: {request.method} {request.url.path} failed - "
                f"Error: {e} - Duration: {duration:.4f}s",
                exc_info=True
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error occurred."}
            )
