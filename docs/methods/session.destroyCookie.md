# session.destroyCookie

`POST /api/session.destroyCookie`

## Description

Removes the designated session cookie, a.k.a sign-out.

After calling `session.destroyCookie()` the user will not be able to perform authenticated API requests until they sign-in again.

---

## Auth logic

Requestor must be authenticated with session cookie.

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/session.destroyCookie
Authorization: `Cookie ${sessionCookie}`
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
