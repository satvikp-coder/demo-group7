import { randomUUID } from 'node:crypto';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { log } from '../services/logger.js';

export function requestLogging(req, res, next) {
  req.requestId = randomUUID();
  res.set('X-Request-ID', req.requestId);
  const start = performance.now();
  res.once('finish', () => log('http_request', {
    requestId: req.requestId, method: req.method,
    // Log route templates, never arbitrary URLs, query strings or credentials.
    path: req.route ? req.baseUrl + req.route.path : 'unmatched',
    status: res.statusCode, durationMs: Math.round((performance.now()-start)*100)/100,
  }, res.statusCode >= 500 ? 'error' : 'info'));
  next();
}

export function limiter(scope, limit, windowMs = 60000, perUser = false) {
  return rateLimit({
    windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false,
    ...(perUser ? {keyGenerator: req => req.user?.id ?? ipKeyGenerator(req.ip)} : {}),
    handler(req, res) {
      log('rate_limit', {requestId:req.requestId, scope, status:429});
      res.status(429).json({error:{message:'Too many requests. Please try again later.'}});
    },
  });
}
