# session.destroy

`POST /api/v1/session.destroy`

## Description

Destroys the designated existing session, a.k.a sign-out.

After calling `session.destroy()` the user will not be able to perform auth-required actions against the system until they create a new session token.

***

## Requires auth

Requestor must be authenticated to the system.

## Parameters

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

***

## Example

**Request**

```
POST /api/v1/session.destroy
Authorization: `Bearer ${authToken}`
```

**Response**

`200 OK`

``` json
{
  "ok": true
}
```
