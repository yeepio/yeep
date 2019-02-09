# session.destroy

`POST /api/v1/session.destroy`

## Description

Destroys the designated `accessToken` and (optionally) `refreshToken`, a.k.a sign-out.

After calling `session.destroy()` the user will not be able to perform authenticated actions against the system until they create a new `accessToken`.

---

## Public method

This method is publicly available.

## Parameters

### Body

- **accessToken** _(string)_ — user `accessToken`, as provided via [session.create()](./session.create.md) (required)
- **refreshToken** _(string)_ — user `refreshToken`, as provided via [session.create()](./session.create.md) (optional)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/v1/session.destroy
```

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  "refreshToken": "frpp2b3fesG3ZS3E9vqa3pm1"
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
