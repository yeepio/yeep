# user.addFactor

`POST /api/v1/user.addFactor`

## Description

Enrolls new authentication factor for the specified user.

---

## Auth logic

Requestor must be authenticated and (a) assigned with the `yeep.user.write` permission in _global_ scope or (b) match the requested user.

## Parameters

### Body

- **userId** _(string)_ — the ID of the user (required)
- **type** _(string)_ — the type of the factor; must be `SOTP` (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **factor** _(Object)_ — details on the new authentication factor

---

## Example

**Request**

```
POST /api/v1/user.addFactor
Authorization: `Bearer ${accessToken}`
```

```json
{
  "userId": "507f191e810c19729de860ea",
  "type": "SOTP"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "factor": {
    "type": "SOTP",
    "secret": "JFBVG4R7ORKHEZCFHZFW26L5F55SSP2Y",
    "qrcode": "data:image/png;base64,iVBORw0KGgoAAA
ANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4
//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU
5ErkJggg==",
    "pendingVerification": true
  }
}
```
