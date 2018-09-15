# permission.create

`POST /api/v1/permission.create`

## Description

Creates new permission with the specified properties.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.permission.write` permission.

## Parameters

### Body

- **name** _(string)_ — permission name (required)
- **description** _(string)_ — permission description (optional)
- **scope** _(string)_ — org ID that the permission can be applied to; implies global permission if left empty (optional)

_Please note: global permissions can be applied to any org._

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **permission** _(Object)_ — permission details

***

## Example

**Request**

```
POST /api/v1/permission.create
Authorization: `Bearer ${authToken}`
```

``` json
{
  "name": "acme.test",
  "description": "This is a test",
  "scope": "5b2d649ce248cb779e7f26e2"
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "permission": {
    "id": "327f191e810c19729de76232",
    "name": "acme.test",
    "description": "This is a test",
    "scope": "5b2d649ce248cb779e7f26e2",
    "isSystemPermission": false,
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
