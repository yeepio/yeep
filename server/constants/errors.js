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

export class InvalidUsernameError extends Error {
  constructor(message) {
    super(message);
    this.code = 10014;
  }
}

export class InvalidPermissionError extends Error {
  constructor(message) {
    super(message);
    this.code = 10015;
  }
}

export class DuplicateRoleError extends Error {
  constructor(message) {
    super(message);
    this.code = 10016;
  }
}

export class RoleNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10017;
  }
}

export class ImmutableRoleError extends Error {
  constructor(message) {
    super(message);
    this.code = 10018;
  }
}

export class InvalidRoleAssignmentError extends Error {
  constructor(message) {
    super(message);
    this.code = 10019;
  }
}

export class DuplicateRoleAssignmentError extends Error {
  constructor(message) {
    super(message);
    this.code = 10020;
  }
}
