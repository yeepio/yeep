# user.activate

`POST /api/v1/user.activate`

## Description

Activates the designated user.

This function only makes sense if the user had previously been deactivated.

***

## Requires auth

Requestor must be authenticated and assigned with the global `yeep.user.write` permission.

## Parameters

### Body

- **id** _(string)_ — user ID (required)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — updated user info

***

## Example

**Request**

```
POST /api/v1/user.activate
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
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "deactivatedAt": null,
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
