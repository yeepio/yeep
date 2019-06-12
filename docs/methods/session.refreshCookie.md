# session.refreshCookie

`POST /api/session.refreshCookie`

## Description

Refreshes the designated session cookie that is about to expire or has already expired. Use this method to extend a user's session.

---

## Auth logic

Requestor must be authenticated with session cookie.

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — authenticated user details

---

## Example

**Request**

```
POST /api/session.refreshCookie
Authorization: `Cookie ${cookie}`
```

**Response**

```
200 OK
Set-Cookie eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTUzNTc2NjgwNn0.2XMBMAGmQv7xTP-tzXksXfpxlxD8ZvsIGOlCXfPZXq0
```

```json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea"
  }
}
```
