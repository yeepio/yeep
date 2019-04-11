# totp.verify

`POST /api/v1/totp.verify`

## Description

Verifies the supples OTP token.

---

## Auth logic

Requestor must be authenticated.

## Parameters

### Body

- **token** _(string)_ — OTP token as produces by the authenticator software (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details (in case of an error)
- **isTokenValid** _(boolean)_ — indicates whether the supplied token is valid

---

## Example

**Request**

```
POST /api/v1/totp.verify
Authorization: `Bearer ${accessToken}`
```

```json
{
  "token": "085761"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "isTokenValid": true
}
```
