# user.delete

`POST /api/v1/user.delete`

## Description

Deletes the designated user.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.user.write` permission.

## Parameters

### Body

- **id** _(string)_ — user ID (required)
***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

***

## Example

**Request**

```
POST /api/v1/user.delete
Authorization: `Bearer ${authToken}`
```

``` json
{
  "id": "507f191e810c19729de860ea"
}
```

**Response**

`200 OK`

``` json
{
  "ok": true
}
```
