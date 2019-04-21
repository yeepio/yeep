# email.verify

`POST /api/email.verify`

## Description

Verifies user email by redeeming the supplied _EMAIL_VERIFICATION_ token.

***

## Public method

This method is publicly available.

## Parameters

### Body

- **token** _(string)_ — email-verification token (required)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — the updated user
***

## Example

**Request**

```
POST /api/email.verify
```

``` json
{
  "token": "jerp2befqsG3ZMNF9vqyJfm1",
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "emails": [{
      "address": "coyote@acme.com",
      "isVerified": true,
      "isPrimary": true,
    },
    {
      "address": "coyote-new@acme.com",
      "isVerified": true,
      "isPrimary": false,
    }],
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
