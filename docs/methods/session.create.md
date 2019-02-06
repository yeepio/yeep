# session.create

`POST /api/v1/session.create`

## Description

Creates new session, a.k.a. sign-in, for the designated user. Returns...

1. An access token that the user should present in subsequent requests to authenticate their identity;
2. A refresh token that can be used to refresh the access token after it has expired.

---

## Public method

This method is publicly available.

## Parameters

### Body

- **user** _(string)_ — username or email address of the user (required)
- **password** _(string)_ — user password (required)
- **scope** _(Object)_ — user props to include in the access token payload (optional)
  - **profile** _(boolean)_ — indicates whether to include user profile information to the access token payload (optional; defaults to `false`)
  - **permissions** _(boolean)_ — indicates whether to include user permissions to the access token payload (optional; defaults to `false`)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **accessToken** _(string)_ — an access token, used to authenticate the user identity
- **refreshToken** _(string)_ — a refresh token, used to refresh the accessToken above

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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  "refreshToken": "frpp2b3fesG3ZS3E9vqa3pm1"
}
```
