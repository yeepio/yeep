# role.create

`POST /api/v1/role.create`

## Description

Creates new role with the specified properties.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.role.write` permission.

## Parameters

### Body

- **name** _(string)_ — role name (required)
- **description** _(string)_ — role description (optional)
- **permissions** _(Array\<string>)_ — permissions that the role is assigned with (required)
- **scope** _(string)_ — org ID that the role can be applied to; implies global role if left empty (optional)

_Please note: global roles can be applied to any org._

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **role** _(Object)_ — role details

***

## Example

**Request**

```
POST /api/v1/role.create
Authorization: `Bearer ${authToken}`
```

``` json
{
  "name": "acme:manager",
  "description": "Manager role",
  "permissions": [
    "327f191e810c19729de76232"
  ],
  "scope": "5b2d649ce248cb779e7f26e2"
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "role": {
    "id": "507f191e810c19729de860ea",
    "name": "acme:manager",
    "description": "Manager role",
    "permissions": [
      "327f191e810c19729de76232"
    ],
    "scope": "5b2d649ce248cb779e7f26e2",
    "isSystemRole": false,
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
