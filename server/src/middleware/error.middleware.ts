export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public errorCode?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

}

export class ValidationError extends AppError {
    constructor(message: string, public details?: any[]) {
        super(message, 422, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_REQUIRED');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, 'INSUFFICIENT_PERMISSIONS');
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND');
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests'){
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}