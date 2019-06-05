# session.refreshCookie

`POST /api/session.refreshCookie`

## Description

Refreshes the designated session cookie that is about to expire or has already expired.

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
Authorization: `Cookie ${sessionCookie}`
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
