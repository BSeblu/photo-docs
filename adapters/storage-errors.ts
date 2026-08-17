export class QuotaExceededError extends Error {
  constructor(message = "Storage quota exceeded") {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class NetworkTimeoutError extends Error {
  constructor(message = "Network timeout") {
    super(message);
    this.name = "NetworkTimeoutError";
  }
}

export class AuthTokenExpiredError extends Error {
  constructor(message = "Auth token expired") {
    super(message);
    this.name = "AuthTokenExpiredError";
  }
}

export class ServerError extends Error {
  public readonly statusCode: number;
  constructor(message = "Server error", statusCode = 500) {
    super(message);
    this.name = "ServerError";
    this.statusCode = statusCode;
  }
}