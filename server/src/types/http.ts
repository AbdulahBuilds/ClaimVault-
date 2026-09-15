import { IncomingMessage, ServerResponse, IncomingHttpHeaders } from 'http';
import { JwtPayload } from '../utils/security';

export interface Request extends IncomingMessage {
  headers: IncomingHttpHeaders;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
  user?: JwtPayload;
  originalUrl?: string;
  path?: string;
}

export interface Response extends ServerResponse {
  status: (code: number) => Response;
  json: (data: any) => void;
  send: (data: any) => void;
}

export type NextFunction = (err?: any) => void;
export type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
  path: string;
  handlers: RouteHandler[];
}

export class Router {
  public routes: RouteDefinition[] = [];
  public middlewares: RouteHandler[] = [];

  use(middleware: RouteHandler) {
    this.middlewares.push(middleware);
  }

  get(path: string, ...handlers: RouteHandler[]) {
    this.routes.push({ method: 'GET', path, handlers });
  }

  post(path: string, ...handlers: RouteHandler[]) {
    this.routes.push({ method: 'POST', path, handlers });
  }

  patch(path: string, ...handlers: RouteHandler[]) {
    this.routes.push({ method: 'PATCH', path, handlers });
  }

  delete(path: string, ...handlers: RouteHandler[]) {
    this.routes.push({ method: 'DELETE', path, handlers });
  }
}
