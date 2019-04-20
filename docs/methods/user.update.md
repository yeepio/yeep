# user.update

`POST /api/user.update`

## Description

Updates user details with the specified properties

Please note: the `user.update()` API method accepts partial updates, meaning you need only specify the properties you want to change instead of supplying full user properties every single time.

---

## Auth logic

### A. Updating another user

Requestor must be authenticated and (a) assigned with the `yeep.user.write` permission in _global_ scope or (b) match the designated user, i.e. update their own account.

## Parameters

### Body

- **id** _(string)_ — the user id (required)
- **username** _(string)_ — the display name of the user (optional, only accepted as a value if `isUsernameEnabled` setting is true)
- **password** _(string)_ — user password (optional)
- **fullName** _(string)_ — user full name, e.g. "Wile E. Coyote"
- **picture** _(string)_ — user profile picture URL (optional)
- **emails** _(Array\<Object>)_ — array of emails (optional)
  - **emails[].address** _(string)_ — email address, e.g. "coyote@acme.com" (required)
  - **emails[].isVerified** (boolean) - indicates whether the specified email has been verified (optional; may only be specified by the superuser)
  - **emails[].isPrimary** _(boolean)_ — indicates whether the specified email is the user's primary email address (optional; defaults to `false`, needs to be a verified email)
- **secondaryAuthFactor** _(Object)_ — secondary authentication factor (required only when password is provided and requestor matches the designated user)
  - **type** _(string)_ — authentication factor type, e.g. "PASSWORD" (required)
  - **token** _(string)_ — authentication factor token, e.g. the user's current password (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — the updated user

---

## Example

**Request**

```
POST /api/user.update
Authorization: `Bearer ${accessToken}`
```

```json
{
  "id": "507f191e810c19729de860ea",
  "fullName": "Wile E. Coyote",
  "emails": [
    {
      "address": "coyote@acme.com",
      "isVerified": true,
      "isPrimary": true
    }
  ]
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
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
