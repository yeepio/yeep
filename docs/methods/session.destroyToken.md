# session.destroyToken

`POST /api/session.destroyToken`

## Description

Destroys the specified session token. This method is a direct equivalent of _user sign-out_.

After calling `session.destroyToken()` the user will not be able to use the token against the system until they create a new session token.

---

## Public method

This method is publicly available.

## Parameters

### Body

- **token** _(string)_ — session token, as provided via [session.issueToken()](./session.issueToken.md) (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/session.destroyToken
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUzNTc2MzIwNn0.rDEBkzfdLdm3RnkPpozWGZMF_VGvBHQfCk1-Q1oz2mgQ"
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
