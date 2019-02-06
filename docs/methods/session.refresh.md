# session.refresh

`POST /api/v1/session.refresh`

## Description

Refreshes an existing session that is about to expire or has already expired.

---

## Public method

This method is publicly available.

## Parameters

### Body

- **accessToken** _(string)_ — user access token that is about to expire or has already expired, as provided via [session.create()](methods/session.create.md) (required)
- **refreshToken** _(string)_ — user refresh token, as provided via [session.create()](methods/session.create.md); this token will be redeemed and can never be used again (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **accessToken** _(string)_ — a refreshed access token
- **refreshToken** _(string)_ — a new refresh token

---

## Example

**Request**

```
POST /api/v1/session.refresh
```

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  "refreshToken": "frpp2b3fesG3ZS3E9vqa3pm1"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "accessToken": "erOicGF00OiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  "refreshToken": "cdck24285sG3ZS3E9vqa4pp4"
}
```
