# role.info

`POST /api/v1/role.info`

## Description

Retrieves information on the designated role.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.role.read` permission.

## Parameters

### Body

- **id** _(string)_ — role ID (required)

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
POST /api/v1/role.info
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
