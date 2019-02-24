# role.list

`POST /api/v1/role.list`

## Description

Retrieves list of roles that the requestor has access to.

***

## Auth logic

Requestor must be authenticated. No explicit permissions are required; only retrieves permissions that the requestor can access via `yeep.role.read`.

## Parameters

### Body

- **q** _(string)_ — filters roles by the designated query (optional)
- **scope** _(string)_ — filters roles by the designated org (optional)
- **isSystemRole** _(boolean)_ — retrieves only system roles (optional)
- **limit** _(string)_ — maximum number of roles to return (optional)
- **cursor** _(string)_ — paginates through roles by setting the `cursor` param (optional)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **roles** _(Array\<Object>)_ — array of roles
- **nextCursor** _(string)_ — use this `cursor` to facilitate pagination

***

## Example

**Request**

```
POST /api/v1/role.list
Authorization: `Bearer ${accessToken}`
```

``` json
{
  "q": "acme",
  "limit": 1,
  "cursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwOSI="
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "roles": [{
    "id": "5b969dc9901e2af192780a35",
    "name": "acme:developer",
    "description": "Developer role",
    "isSystemRole": false,
    "usersCount": 5,
    "permissions": [
      "5b969dc9901e2af192780a34",
    ],
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }],
  "nextCursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwYSI="
}
```
