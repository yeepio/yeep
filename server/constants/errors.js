export class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10001;
  }
}

export class InvalidUserPasswordError extends Error {
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

export class RoleAssignmentNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10021;
  }
}

export class UserDeactivatedError extends Error {
  constructor(message) {
    super(message);
    this.code = 10022;
  }
}

export class OrgMembershipNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10023;
  }
}

export class UnprocessableImage extends Error {
  constructor(message) {
    super(message);
    this.code = 10024;
  }
}

export class ImageTooSmall extends Error {
  constructor(message) {
    super(message);
    this.code = 10025;
  }
}

export class ImageTooLarge extends Error {
  constructor(message) {
    super(message);
    this.code = 10025;
  }
}

export class InvalidImageCropArea extends Error {
  constructor(message) {
    super(message);
    this.code = 10026;
  }
}

export class TokenNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 10027;
  }
}

export class OrgMembershipAlreadyExists extends Error {
  constructor(message) {
    super(message);
    this.code = 10028;
  }
}

export class InvalidAccessToken extends Error {
  constructor(message) {
    super(message);
    this.code = 10029;
  }
}

export class InvalidRefreshToken extends Error {
  constructor(message) {
    super(message);
    this.code = 10030;
  }
}

export class InvalidTOTPToken extends Error {
  constructor(message) {
    super(message);
    this.code = 10031;
  }
}

export class DuplicateAuthFactor extends Error {
  constructor(message) {
    super(message);
    this.code = 10032;
  }
}

export class AuthFactorNotFound extends Error {
  constructor(message) {
    super(message);
    this.code = 10033;
  }
}
