export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    return Promise.resolve().then(() => handler(req, res, next)).catch(next);
  };
}

export function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;
  if (status >= 500) {
    console.error(isProduction ? 'Internal server error' : err.stack ?? err.message);
  }
  const message = status >= 500
    ? 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    : err.message;
  res.status(status).json({ error: message });
}

export function notFound(req, res) {
  res.status(404).json({ error: `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}` });
}
