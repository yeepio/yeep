# user.resetPassword

`POST /api/v1/user.resetPassword`

## Description

Resets user password by redeeming the supplied _RESET_PASSWORD_ token.

---

## Public method

This method is publicly available.

## Parameters

### Body

- **token** _(string)_ — reset-password token (required)
- **password** _(string)_ — new user password (required)

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
POST /api/v1/user.resetPassword
```

```json
{
  "token": "jerp2befqsG3ZMNF9vqyJfm1",
  "password": "new-pa$$w0rd"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
