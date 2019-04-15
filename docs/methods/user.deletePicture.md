# user.deletePicture

`POST /api/user.deletePicture`

## Description

Deletes the profile picture of the designated user.

---

## Auth logic

### A. Deleting the profile picture of another user

Requestor must be authenticated and assigned with `yeep.user.write` permission in _global_ scope to set the profile picture of another user.

### B. Deleting the requestor's own profile picture

Users are able to delete their own profile picture without explicit permissions.

## Parameters

### Body

- **id** _(string)_ — user ID (required)

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
POST /api/user.deletePicture
Authorization: `Bearer ${accessToken}`
```

```json
{
  "id": "507f191e810c19729de860ea"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "picture": null,
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
