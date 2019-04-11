# totp.enroll

`POST /api/v1/totp.enroll`

## Description

Enrolls the designated user to TOTP authentication.

This is the first of a 2-step process. In order to complete enrollment the user must call [totp.activate()](totp.activate.md) with the OTP token, as provided by their _authenticator_ software, e.g. Google Authenticator.

---

## Auth logic

Requestor must be authenticated and (a) assigned with the `yeep.user.write` permission in _global_ scope or (b) match the requested user ID.

## Parameters

### Body

- **userId** _(string)_ — the ID of the user to enroll to TOTP authentication (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details (in case of an error)
- **totp** _(Object)_ — TOTP authentication details
  - **totp.secret** _(string)_ — TOTP secret key
  - **totp.qrcode** _(string)_ — handy QR code to use with your authenticator software
  - **totp.isPendingActivation** _(boolean)_ — indicates whether the TOTP authentication factor is pending activation

---

## Example

**Request**

```
POST /api/v1/totp.enroll
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
  "ok": true,
  "totp": {
    "secret": "JFBVG4R7ORKHEZCFHZFW26L5F55SSP2Y",
    "qrcode": "data:image/png;base64,iVBORw0KGgoAAA
  ANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4
  //8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU
  5ErkJggg==",
    "isPendingActivation": true
  }
}
```
