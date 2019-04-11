# totp.eject

`POST /api/v1/totp.eject`

## Description

Removes TOTP authentication factor from the designated user.

The user may call [totp.enroll()](totp.enroll.md) to enroll to a new TOTP authentication factor after calling this method.

---

## Auth logic

Requestor must be authenticated and (a) assigned with the `yeep.user.write` permission in _global_ scope or (b) match the requested user.

## Parameters

### Body

- **userId** _(string)_ — the ID of the user to eject from TOTP authentication (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/v1/totp.eject
Authorization: `Bearer ${accessToken}`
```

```json
{
  "userId": "507f191e810c19729de860ea"
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
