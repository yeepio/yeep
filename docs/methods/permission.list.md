# permission.list

`POST /api/v1/permission.list`

## Description

Retrieves list of permissions that the requestor has access to.

***

## Auth logic

Requestor must be authenticated. No explicit permissions are required; only retrieves permissions that the requestor can access via `yeep.permission.read`.

## Parameters

### Body

- **q** _(string)_ — filters permissions by the designated query (optional)
- **limit** _(string)_ — maximum number of permissions to return (optional)
- **cursor** _(string)_ — paginates through permissions by setting the `cursor` param (optional)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **permissions** _(Array\<Object>)_ — array of permissions
- **nextCursor** _(string)_ — use this `cursor` to facilitate pagination

***

## Example

**Request**

```
POST /api/v1/permission.list
Authorization: `Bearer ${authToken}`
```

``` json
{
  "q": "yeep.perm",
  "limit": 1,
  "cursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwOSI="
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "permissions": [{
    "id": "327f191e810c19729de76232",
    "name": "yeep.permission.read",
    "description": "Permission to read permissions",
    "isSystemPermission": true,
    "usersCount": 12,
    "rolesCount": 5,
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }],
  "nextCursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwYSI="
}
```
