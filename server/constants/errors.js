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

export class DuplicatePermissionError extends Error {
  constructor(message) {
    super(message);
    this.code = 10007;
  }
}

export class PermissionNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10008;
  }
}

export class ImmutablePermissionError extends Error {
  constructor(message) {
    super(message);
    this.code = 10009;
  }
}

export class DuplicatePermissionAssignmentError extends Error {
  constructor(message) {
    super(message);
    this.code = 10010;
  }
}

export class OrgNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10011;
  }
}

export class InvalidPermissionAssignmentError extends Error {
  constructor(message) {
    super(message);
    this.code = 10011;
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.code = 10012;
  }
}

export class PermissionAssignmentNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10013;
  }
}
