# role.update

`POST /api/v1/role.update`

## Description

Updates the designated role with the specified properties.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.role.write` permission.

## Parameters

### Body

- **id** _(string)_ — role ID (required)
- **name** _(string)_ — next role name (optional)
- **description** _(string)_ — next role description (optional)
- **permissions** _(Array\<string>)_ — next role permissions (optional)

_Please note: one of `name`, `description` or `permissions` must be specified, otherwise update makes no sense._

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
POST /api/v1/role.update
Authorization: `Bearer ${authToken}`
```

``` json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "acme:developer",
  "permissions": [
    "327f191e810c19729de76232"
  ]
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "role": {
    "id": "507f1f77bcf86cd799439011",
    "name": "acme:developer",
    "description": "Developer role",
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
