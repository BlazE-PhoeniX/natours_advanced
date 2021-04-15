class ApiError extends Error {
  constructor(statusCode, status, message) {
    super(message);
    this.status = status;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
