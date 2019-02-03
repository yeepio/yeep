# session.create

`POST /api/v1/session.create`

## Description

Creates new session, a.k.a. sign-in, for the designated user. Returns a token that the user should present in subsequent requests to authenticate their identity.

---

## Public method

This method is publicly available.

## Parameters

### Body

- **user** _(string)_ — username or email address of the user (required)
- **password** _(string)_ — user password (required)
- **includePermissions** _(boolean)_ — indicates whether user permissions should be added to the token payload (optional; defaults to `false`)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **token** _(string)_ — session token
- **expiresIn** _(string)_ — session expiration time (in seconds)

---

## Example

**Request**

```
POST /api/v1/session.create
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  "expiresIn": 604800
}
```
