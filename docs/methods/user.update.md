# user.update

`POST /api/v1/user.update`

## Description

Updated user with the specified properties.

***

## Auth logic

### A. Updating another user

Requestor must be authenticated and assigned with the `yeep.user.write` permission in _global_ scope.

### B. Updating the requestor's own user

Users are able to update their own account without explicit permissions.

## Parameters

### Body

- **id** _(string)_ — the user id (required)
- **username** _(string)_ — the display name of the user (optional, only accepted as a value if `isUsernameEnabled` setting is true)
- **password** _(string)_ — user password (optional)
- **fullName** _(string)_ — user full name, e.g. "Wile E. Coyote"
(optional)
- **emails** _(Array\<Object>)_ — array of emails (optional)
  - **emails[].address** _(string)_ — email address, e.g. "coyote@acme.com" (required)
  - **emails[].isVerified** _(boolean)_ — indicates whether the specified email has been verified (optional; defaults to `false`)
  - **emails[].isPrimary** _(boolean)_ — indicates whether the specified email is the user's primary email address (optional; defaults to `false`)
- **orgs** _(Array\<string>)_ — array of org IDs to associate the user with (optional)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — the newly created user

***

## Example

**Request**

```
POST /api/v1/user.update
Authorization: `Bearer ${accessToken}`
```

``` json
{
  "username": "wile",
  "password": "catch-the-b1rd$",
  "fullName": "Wile E. Coyote",
  "emails": [
    {
      "address": "coyote@acme.com",
      "isVerified": true,
      "isPrimary": true,
    },
  ]
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "username": "wile",
    "fullName": "Wile E. Coyote",
    "emails": [
      {
        "address": "coyote@acme.com",
        "isVerified": true,
        "isPrimary": true,
      },
    ],
    "orgs": [],
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
