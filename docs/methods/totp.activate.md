# totp.activate

`POST /api/totp.activate`

## Description

Verifies the supples OTP token and activates TOTP authentication for the designated user.

---

## Auth logic

Requestor must be authenticated and (a) assigned with the `yeep.user.write` permission in _global_ scope or (b) match the requested user ID.

## Parameters

### Body

- **userId** _(string)_ — the ID of the user to activate TOTP authentication for (required)
- **secret** _(string)_ — TOTP secret key (required)
- **token** _(string)_ — OTP token as produced by the user's authenticator software (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details (in case of an error)

---

## Example

**Request**

```
POST /api/totp.activate
Authorization: `Bearer ${accessToken}`
```

```json
{
  "userId": "507f191e810c19729de860ea",
  "secret": "JFBVG4R7ORKHEZCFHZFW26L5F55SSP2Y",
  "token": "582761"
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
