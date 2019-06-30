# session.destroyCookie

`POST /api/session.destroyCookie`

## Description

Removes the designated session cookie, a.k.a sign-out. This method is a direct equivalent of _user sign-out_.

After calling `session.destroyToken()` the user will not be able to use the specific cookie against the system until they create a new session cookie.

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
Authorization: `Cookie ${cookie}`
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
