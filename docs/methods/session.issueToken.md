# session.issueToken

`POST /api/session.issueToken`

## Description

Issues a new session token for the designated user. Session tokens are used to authenticate the user identity with subsequent API requests.

This method is a direct equivalent to _user sign-in_. It is best suited for microservices and native applications. If you are building a web application or an SPA please consider using [session.setCookie()](./session.setCookie.md) instead, as there is no secure way for storing a session token in the browser.

Here's a handy example of how to use the session token to authenticate against an API request:

```
POST /api/user.info
Authorization: `Bearer ${token}`
```

All session tokens expire after specific time (as indicated by `yeep.config.js`) and require refreshing. Use [session.refreshToken()](./session.refreshToken.md) to extend a user's session after their token has expired or is about to expire.

If you want to destroy a session token, a.k.a. _user sign-out_, use [session.destroyToken()](./session.destroyToken.md).

---

## Public method

This method is publicly available.

## Parameters

### Body

- **user** _(string)_ — the username or email address of the user (required)
- **password** _(string)_ — the user password (required)
- **projection** _(Object)_ — user props to include in the `accessToken` payload (optional)
  - **profile** _(boolean)_ — indicates whether to include user profile information to the `accessToken` payload (optional; defaults to `false`)
  - **permissions** _(boolean)_ — indicates whether to include user permissions to the `accessToken` payload (optional; defaults to `false`)
- **secondaryAuthFactor** _(Object)_ — secondary authentication factor (required only if user has enabled MFA)
  - **type** _(string)_ — authentication factor type, e.g. "TOTP" - must not be "PASSWORD" (required)
  - **token** _(string)_ — authentication factor token, e.g. OTP code as provided by the user's authenticator software (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **token** _(string)_ — session token, used to authenticate the user identity
- **expiresAt** _(string)_ — a string representation of the date when the new session token expires

---

## Example

### User without MFA

**Request**

```
POST /api/session.issueToken
```

```json
{
  "user": "coyote@acme.com",
  "password": "catch-the-b1rd$"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUzNTc2MzIwNn0.rDEBkzfdLdm3RnkPpozWGZMF_VGvBHQfCk1-Q1oz2mg",
  "expiresAt": "Sat Sep 01 2018 14:53:26 GMT+1400 (LINT)"
}
```

### User with MFA enabled

**Request**

```
POST /api/session.issueToken
```

```json
{
  "user": "coyote@acme.com",
  "password": "catch-the-b1rd$"
}
```

**Response**

`200 OK`

```json
{
  "ok": false,
  "error": {
    "code": 10034,
    "message": "User \"coyote@acme.com\" has enabled MFA; please specify secondary authentication factor",
    "applicableAuthFactorTypes": ["TOTP"]
  }
}
```

In which case the user should repeat the initial request, alongside their OTP token...

```json
{
  "user": "coyote@acme.com",
  "password": "catch-the-b1rd$",
  "secondaryAuthFactor": {
    "type": "TOTP",
    "token": "009910"
  }
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUzNTc2MzIwNn0.rDEBkzfdLdm3RnkPpozWGZMF_VGvBHQfCk1-Q1oz2mg",
  "expiresAt": "Sat Sep 01 2018 14:53:26 GMT+1400 (LINT)"
}
```
