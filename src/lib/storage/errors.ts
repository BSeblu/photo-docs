export class QuotaExceededError extends Error {
  constructor(message = "Storage quota exceeded") {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class NetworkTimeoutError extends Error {
  constructor(message = "Storage request timed out") {
    super(message);
    this.name = "NetworkTimeoutError";
  }
}

export class AuthTokenExpiredError extends Error {
  constructor(message = "Storage authentication expired") {
    super(message);
    this.name = "AuthTokenExpiredError";
  }
}

export class ServerError extends Error {
  constructor(message = "Storage server error") {
    super(message);
    this.name = "ServerError";
  }
}
