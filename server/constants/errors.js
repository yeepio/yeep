export class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10001;
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message) {
    super(message);
    this.code = 10002;
  }
}

export class DuplicateOrgError extends Error {
  constructor(message) {
    super(message);
    this.code = 10003;
  }
}
