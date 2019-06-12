# session.refreshToken

`POST /api/session.refreshToken`

## Description

Refreshes the specified session token that is about to expire or has already expired. Use this method to extend a user's session.

---

## Public method

This method is publicly available.

## Parameters

### Body

- **token** _(string)_ — session token that is about to expire or has already expired, as provided via [session.issueToken()](./session.issueToken.md) (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **token** _(string)_ — a refreshed session token
- **expiresAt** _(string)_ — a string representation of the date when the new session token expires

---

## Example

**Request**

```
POST /api/session.refreshToken
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUzNTc2MzIwNn0.rDEBkzfdLdm3RnkPpozWGZMF_VGvBHQfCk1-Q1oz2mg"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUzNTc2NjgwNn0.2XMBMAGmQv7xTP-tzXksXfpxlxD8ZvsIGOlCXfPZXq0",
  "expiresAt": "Sat Sep 01 2018 15:53:26 GMT+1400 (LINT)"
}
```
