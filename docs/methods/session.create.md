# session.create

`POST /api/v1/session.create`

## Description

Creates new session, a.k.a. sign-in, for the designated user. Returns (1) an `accessToken` and (2) a `refreshToken`.

The `accessToken` is used to authenticate the user identity in API requests that require authentication, e.g.

```
POST /api/v1/user.info
Authorization: `Bearer ${accessToken}`
```

The `refreshToken` can be used to refresh the `accessToken` after the latter has expired or is about to expire. Use this to extend a user's session. See [session.refresh()](./session.refresh.md) for further info.

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
