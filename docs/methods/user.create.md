# user.create

`POST /api/v1/user.create`

## Description

Creates new user with the specified properties.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.user.write` permission.

## Parameters

### Body

- **username** _(string)_ — the display name of the user (required if `isUsernameEnabled` setting is true, otherwise forbidden)
- **password** _(string)_ — user password (required)
- **fullName** _(string)_ — user full name, e.g. "Wile E. Coyote"
(required)
- **picture** _(string)_ — user profile picture URL (optional)
- **emails** _(Array\<Object>)_ — array of emails (required; at least 1 email must be specified)
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
POST /api/v1/user.create
Authorization: `Bearer ${authToken}`
```

``` json
{
  "username": "wile",
  "password": "catch-the-b1rd$",
  "fullName": "Wile E. Coyote",
  "picture": "https://www.acme.com/pictures/coyote.png",
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
    "picture": "https://www.acme.com/pictures/coyote.png",
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
