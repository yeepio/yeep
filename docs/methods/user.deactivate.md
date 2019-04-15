# user.deactivate

`POST /api/user.deactivate`

## Description

Deactivates the designated user.

Deactivated users function as if they were deleted, i.e. cannot create new session, or perform any action using an existing session.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.user.write` permission in _global_ scope.

## Parameters

### Body

- **id** _(string)_ — user ID (required)
- **deactivateAfterSeconds** _(number)_ — number of seconds after which the user will become deactivated (optional; defaults to 0)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — updated user info

---

## Example

**Request**

```
POST /api/user.deactivate
Authorization: `Bearer ${accessToken}`
```

```json
{
  "id": "507f191e810c19729de860ea",
  "deactivateAfterSeconds": 3600
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "deactivatedAt": "2017-07-13T06:42:42.222Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
