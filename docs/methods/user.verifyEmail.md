# user.verifyEmail

`POST /api/user.verifyEmail`

## Description

Initiates the _email verification_ process for the designated user.

***

## Auth logic

### A. Verifying the email address of another user

Requestor must be authenticated and assigned with `yeep.user.write` permission in _global_ scope to initiate the email verification process of another user.

> Please note: a user authenticated with these permissions in the global scope can also set the `isVerified` property immediatelly on the user, bypassing the email verification process.

### B. Verifying the requestor's own email address

Users are able to request the verification of their own email address without explicit permissions.

## Parameters

### Body

- **id** _(string)_ — the user id (required)
- **emailAddress** _(string)_ — the user email address to verify (required)
- **tokenExpiresInSeconds** _(number)_ — number of seconds after which the _email verification_ token will expire (optional; defaults to 10800 seconds, i.e. 3 hours; can only be set by superUsers)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

***

## Example

**Request**

```
POST /api/user.verifyEmail
```

``` json
{
  "id": "507f1f77bcf86cd799439012",
  "emailAddress": "coyote-new@acme.com",
}
```

**Response**

`200 OK`

``` json
{
  "ok": true
}
```
