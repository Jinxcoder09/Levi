import time
import logging
from fastapi import Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            if duration > 1.0:
                logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration:.2f}s")
            return response
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"{request.method} {request.url.path} failed - {e} - {duration:.2f}s")
            raise
