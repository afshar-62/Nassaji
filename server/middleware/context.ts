import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.ts';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      requestedLocale?: string;
    }
    interface Response {
      apiSuccess<T>(data: T, metaExtra?: Record<string, any>, status?: number): void;
      apiError(status: number, code: string, message: string, details?: unknown): void;
    }
  }
}

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const locale = (req.headers['accept-language'] || 'fa-IR').split(',')[0];

  req.requestId = requestId;
  req.requestedLocale = locale;

  res.apiSuccess = function <T>(data: T, metaExtra?: Record<string, any>, status: number = 200) {
    const envelope: ApiResponse<T> = {
      success: true,
      data,
      error: null,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
        locale,
        ...(metaExtra || {}),
      },
    };
    res.status(status).json(envelope);
  };

  res.apiError = function (status: number, code: string, message: string, details?: unknown) {
    const envelope: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
        locale,
      },
    };
    res.status(status).json(envelope);
  };

  next();
};
