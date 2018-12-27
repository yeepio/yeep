# user.forgotPassword

`POST /api/v1/user.forgotPassword`

## Description

Initiates the _forgot password_ process for the designated user.

***

## Public method

This method is publicly available.

## Parameters

### Body

- **userKey** _(string)_ — username or email address of the user (required)
- **tokenExpiresInSeconds** _(number)_ — number of seconds after which the _password reset_ token will expire (optional; defaults to 10800 seconds, i.e. 3 hours)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

***

## Example

**Request**

```
POST /api/v1/user.forgotPassword
```

``` json
{
  "userKey": "coyote@acme.com"
}
```

**Response**

`200 OK`

``` json
{
  "ok": true
}
```
