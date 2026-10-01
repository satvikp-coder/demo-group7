import { log } from "../services/logger.js";
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res, next) {
  next(new HttpError(404, "Route not found"));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error instanceof HttpError ? error.status : 500;
  let message = error instanceof HttpError ? error.message : "Internal server error";
  if (error.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  } else if (error.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  } else if (error instanceof URIError) {
    status = 400;
    message = "Malformed URL encoding";
  } else if (error.code === "23505") {
    status = 409;
    message = "Record already exists";
  }
  // pg-pool wraps some connection timeouts in a code-less Error. Exact known
  // driver messages keep these dependency failures retryable without treating
  // arbitrary application errors as database outages or exposing their text.
  const driverUnavailable=["timeout exceeded when trying to connect", "Connection terminated due to connection timeout", "Connection terminated unexpectedly", "Connection terminated", "timeout expired", "Query read timeout", "Client has encountered a connection error and is not queryable", "Client was closed and is not queryable"].includes(error.message);
  if (["ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "EPIPE", "ENETUNREACH", "EHOSTUNREACH", "ETIMEDOUT", "57P01", "57P03", "53300", "57014"].includes(error.code) || /^08[A-Z0-9]{3}$/.test(error.code ?? "") || driverUnavailable) {
    status = 503; message = "Service temporarily unavailable";
  }
  // Never expose SQL details, credentials, tokens, or stack traces in responses/logs.
  if (status >= 500 && status !== 501) log("request_error", {requestId:req.requestId, status, code: /^[A-Z0-9]{5,20}$/.test(error.code ?? "") ? error.code : driverUnavailable ? "DB_UNAVAILABLE" : "INTERNAL"}, "error");
  res.status(status).json({ error: { message } });
}
