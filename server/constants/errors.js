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

export class InvalidPrimaryEmailError extends Error {
  constructor(message) {
    super(message);
    this.code = 10004;
  }
}

export class DuplicateEmailAddressError extends Error {
  constructor(message) {
    super(message);
    this.code = 10005;
  }
}

export class DuplicateUsernameError extends Error {
  constructor(message) {
    super(message);
    this.code = 10006;
  }
}
