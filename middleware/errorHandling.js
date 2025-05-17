// Custom error classes
class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
        this.validationErrors = [];
    }

    addValidationError(field, message) {
        this.validationErrors.push({ field, message });
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTH_FAILED');
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
        this.retryAfter = null;
    }

    setRetryAfter(seconds) {
        this.retryAfter = seconds;
        return this;
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
        this.originalError = null;
    }

    setOriginalError(error) {
        this.originalError = error;
        return this;
    }
}

class APIError extends AppError {
    constructor(message, statusCode = 400, errorCode = 'API_ERROR') {
        super(message, statusCode, errorCode);
        this.errors = [];
    }

    addError(detail) {
        this.errors.push(detail);
        return this;
    }
}

// Error logger with enhanced capabilities
class ErrorLogger {
    static log(err, req) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: {
                message: err.message,
                code: err.errorCode,
                stack: err.stack,
                name: err.constructor.name
            },
            request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
                ip: req.ip,
                userId: req.user?.id || 'anonymous'
            },
            context: {
                environment: process.env.NODE_ENV,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage()
            }
        };

        // Add specific error details
        if (err instanceof ValidationError) {
            errorLog.error.validationErrors = err.validationErrors;
        } else if (err instanceof DatabaseError && err.originalError) {
            errorLog.error.originalError = {
                message: err.originalError.message,
                code: err.originalError.code
            };
        } else if (err instanceof APIError) {
            errorLog.error.details = err.errors;
        }

        // Log based on environment
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Log:', JSON.stringify(errorLog, null, 2));
        } else {
            // Production logging
            console.error(JSON.stringify(errorLog));
            // Here you would typically send to your logging service
            // this.sendToLoggingService(errorLog);
        }

        // Alert on critical errors
        if (err.statusCode >= 500) {
            this.alertOnCriticalError(errorLog);
        }
    }

    static alertOnCriticalError(errorLog) {
        // Implement alerting logic here
        // This could send notifications to admin, DevOps team, etc.
        console.error('CRITICAL ERROR ALERT:', errorLog);
    }

    static async sendToLoggingService(errorLog) {
        // Implement connection to external logging service
        // Example: Winston, Bunyan, CloudWatch, etc.
    }
}

// Enhanced error response formatter
class ErrorResponse {
    static format(err, req) {
        const response = {
            status: err.status || 'error',
            message: err.message,
            errorCode: err.errorCode || 'UNKNOWN_ERROR',
            requestId: req.id // Assuming you're using a request ID middleware
        };

        // Add specific error information based on error type
        if (err instanceof ValidationError) {
            response.validationErrors = err.validationErrors;
        } else if (err instanceof RateLimitError) {
            response.retryAfter = err.retryAfter;
        } else if (err instanceof APIError) {
            response.errors = err.errors;
        }

        // Add debug information in development
        if (process.env.NODE_ENV === 'development') {
            response.debug = {
                stack: err.stack,
                path: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            };
        }

        return response;
    }
}

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error
    ErrorLogger.log(err, req);

    // Set appropriate headers
    if (err instanceof RateLimitError && err.retryAfter) {
        res.set('Retry-After', err.retryAfter);
    }

    // Handle different types of requests
    if (req.accepts('html')) {
        // Render error page
        res.status(err.statusCode).render('error', {
            title: `Error ${err.statusCode}`,
            message: err.message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    } else {
        // API response
        res.status(err.statusCode).json(ErrorResponse.format(err, req));
    }

    // If this is a critical error, ensure it's properly handled
    if (err.statusCode >= 500) {
        // Implement recovery mechanisms or failsafe procedures
        // This could include clearing cached data, resetting connections, etc.
        ErrorLogger.alertOnCriticalError(err);
    }
};

// Async error handler wrapper
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler middleware with enhanced detection
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
    error.suggestions = [
        'Check if the URL is correct',
        'Ensure you have the necessary permissions',
        'The resource might have been moved or deleted'
    ];
    next(error);
};

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    RateLimitError,
    DatabaseError,
    APIError,
    ErrorLogger,
    ErrorResponse,
    errorHandler,
    catchAsync,
    notFoundHandler
};
