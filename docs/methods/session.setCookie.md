# session.setCookie

`POST /api/session.setCookie`

## Description

Sets new session cookie, a.k.a. sign-in, for the designated user.

The session cookie is used to authenticate the user identity in API requests that require authentication, e.g.

```
POST /api/user.info
Authorization: `Cookie ${sessionCookie}`
```

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
- **user** _(Object)_ — authenticated user details

---

## Example

### User without MFA

**Request**

```
POST /api/session.setCookie
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
  "user": {
    "id": "507f191e810c19729de860ea"
  }
}
```

### User with MFA enabled

**Request**

```
POST /api/session.setCookie
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
  "user": {
    "id": "507f191e810c19729de860ea"
  }
}
```
