# user.deleteFactor

`POST /api/v1/user.deleteFactor`

## Description

Deletes designated authentication factor from the specified user.

---

## Auth logic

Requestor must be authenticated and (a) assigned with the `yeep.user.write` permission in _global_ scope or (b) match the requested user.

## Parameters

### Body

- **userId** _(string)_ — the ID of the user (required)
- **type** _(string)_ — the type of the factor to delete (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/v1/user.deleteFactor
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
  "ok": true
}
```
