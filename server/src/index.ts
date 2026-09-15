import http from 'http';
import url from 'url';
import { Request, Response, Router, RouteHandler } from './types/http';
import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { receiptsRouter } from './routes/receipts.routes';
import { remindersRouter } from './routes/reminders.routes';
import { settingsRouter } from './routes/settings.routes';
import { healthRouter } from './routes/health.routes';
import { storageRouter } from './routes/storage.routes';
import { sanitizeObject } from './middleware/sanitization';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const PORT = parseInt(process.env.PORT || '5000', 10);

interface MountedRouter {
  prefix: string;
  router: Router;
}

const mountedRouters: MountedRouter[] = [
  { prefix: '/api/auth', router: authRouter },
  { prefix: '/api/products', router: productsRouter },
  { prefix: '/api/receipts', router: receiptsRouter },
  { prefix: '/api/storage', router: storageRouter },
  { prefix: '/api/reminders', router: remindersRouter },
  { prefix: '/api/settings', router: settingsRouter },
  { prefix: '/api/health', router: healthRouter },
];

/**
 * Match dynamic route parameters (e.g. /api/products/:id)
 */
const matchRoute = (
  routePath: string,
  requestPath: string
): { matched: boolean; params: Record<string, string> } => {
  const routeParts = routePath.split('/').filter(Boolean);
  const reqParts = requestPath.split('/').filter(Boolean);

  if (routeParts.length !== reqParts.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeParts.length; i++) {
    const rPart = routeParts[i];
    const reqPart = reqParts[i];

    if (rPart.startsWith(':')) {
      const paramName = rPart.substring(1);
      params[paramName] = decodeURIComponent(reqPart);
    } else if (rPart !== reqPart) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
};

/**
 * Parse JSON body from IncomingMessage
 */
const parseBody = (req: http.IncomingMessage): Promise<any> => {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
};

/**
 * Enhance Response with .status(), .json(), .send()
 */
const enhanceResponse = (res: http.ServerResponse): Response => {
  const enhanced = res as Response;

  enhanced.status = (code: number) => {
    res.statusCode = code;
    return enhanced;
  };

  enhanced.json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  enhanced.send = (data: any) => {
    if (typeof data === 'object') {
      enhanced.json(data);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.end(String(data));
    }
  };

  return enhanced;
};

/**
 * Create ClaimVault Backend Server
 */
export const server = http.createServer(async (rawReq, rawRes) => {
  const req = rawReq as Request;
  const res = enhanceResponse(rawRes);

  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Test-RateLimit');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '/';
  req.originalUrl = req.url;
  req.path = pathname;
  req.query = parsedUrl.query as Record<string, string>;

  // Parse & Sanitize Body
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    const rawBody = await parseBody(rawReq);
    req.body = sanitizeObject(rawBody);
  } else {
    req.body = {};
  }

  // Route Dispatcher
  try {
    for (const { prefix, router } of mountedRouters) {
      if (pathname.startsWith(prefix)) {
        const subPath = pathname.substring(prefix.length) || '/';

        // Check each route in router
        for (const route of router.routes) {
          if (route.method === req.method) {
            const { matched, params } = matchRoute(route.path, subPath);
            if (matched) {
              req.params = params;

              // Execute middlewares first
              const handlers = [...router.middlewares, ...route.handlers];
              let idx = 0;

              const runNext = async (err?: any) => {
                if (err) {
                  errorHandler(err, req, res, () => {});
                  return;
                }

                if (idx < handlers.length) {
                  const currentHandler = handlers[idx++];
                  try {
                    await currentHandler(req, res, runNext);
                  } catch (handlerErr) {
                    errorHandler(handlerErr, req, res, () => {});
                  }
                }
              };

              await runNext();
              return;
            }
          }
        }
      }
    }

    // 404 Route Not Found
    notFoundHandler(req, res);
  } catch (serverErr) {
    errorHandler(serverErr, req, res, () => {});
  }
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ClaimVault Backend REST API running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth:         http://localhost:${PORT}/api/auth`);
    console.log(`📦 Products:     http://localhost:${PORT}/api/products`);
    console.log(`🔔 Reminders:    http://localhost:${PORT}/api/reminders`);
    console.log(`⚙️  Settings:     http://localhost:${PORT}/api/settings`);
    console.log(`=======================================================`);
  });
}
