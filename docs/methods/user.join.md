# user.join

`POST /api/v1/user.join`

## Description

Adds user to org by redeeming the supplied _INVITATION_ token.

---

## Auth logic

This method is publicly available when inviting a new user to join an org. Authentication is required when invitee is already an existing yeep user.

## Parameters

### Body

- **token** _(string)_ — invitation token (required)
- **username** _(string)_ — the display name of the user (required if invitee is a new user, otherwise forbidden)
- **password** _(string)_ — user password (required if invitee is a new user, otherwise forbidden)
- **fullName** _(string)_ — user full name, e.g. "Wile E. Coyote"
  (required if invitee is a new user, otherwise forbidden)
- **picture** _(string)_ — user profile picture URL (optional if invitee is a new user, otherwise forbidden)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — the joined user

---

## Examples

### Example with existing user

Invitation token was sent to an existing yeep user. Please note authentication is required.

**Request**

```
POST /api/v1/user.join
Authorization: `Bearer ${authToken}`
```

```json
{
  "token": "jerp2befqsG3ZMNF9vqyJfm1"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "username": "wile",
    "fullName": "Wile E. Coyote",
    "picture": "https://www.acme.com/pictures/coyote.png",
    "emails": [
      {
        "address": "coyote@acme.com",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "orgs": ["5b85b610394ca184fe18076e"],
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```

### Example with new user

Invitation token was sent to a non-yeep user. The user will first create a yeep account and then automatically join the underlying org.

**Request**

```
POST /api/v1/user.join
```

```json
{
  "token": "jerp2befqsG3ZMNF9vqyJfm1",
  "username": "wile",
  "password": "catch-the-b1rd$",
  "fullName": "Wile E. Coyote",
  "picture": "https://www.acme.com/pictures/coyote.png"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "username": "wile",
    "fullName": "Wile E. Coyote",
    "picture": "https://www.acme.com/pictures/coyote.png",
    "emails": [
      {
        "address": "coyote@acme.com",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "orgs": ["5b85b610394ca184fe18076e"],
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
