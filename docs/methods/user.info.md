# user.info

`POST /api/user.info`

## Description

Retrieves details for the designated user.

---

## Auth logic

### A. Retrieving details for another user

Requestor must be authenticated and assigned with `yeep.user.read` permission in _global_ scope to retrieve details for another user.

Please note:

1. When `projection.permissions` is set to `true` user should additionally be assigned with the `yeep.permission.assignment.read` permissions;
2. When `projection.roles` is set to `true` user should additionally be assigned with the `yeep.role.assignment.read` permissions.

### B. Retrieving the requestor's own details

Users are able to retrieve their own details without explicit permissions.

## Parameters

### Body

- **id** _(string)_ — user ID (required)
- **projection** _(Object)_ — user fields to return (optional)
  - **permissions** _(boolean)_ — indicates whether user permissions should be returned (optional; defaults to `false`)
  - **roles** _(boolean)_ — indicates whether user roles should be returned (optional; defaults to `false`)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — the newly created user

---

## Example

**Request**

```
POST /api/user.info
Authorization: `Bearer ${accessToken}`
```

```json
{
  "id": "507f191e810c19729de860ea",
  "projection": {
    "permissions": true,
    "roles": true
  }
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "username": "wile",
    "fullName": "Wile E. Coyote",
    "picture": "https://www.acme.com/pictures/coyote.png",
    "emails": [
      {
        "address": "coyote@acme.com",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "orgs": ["5b85b610394ca184fe18076e"],
    "permissions": [
      {
        "id": "5b85b4f7c7451d8448128740",
        "name": "yeep.org.read",
        "isSystemPermission": true,
        "orgId": "5b85b610394ca184fe18076e",
        "roleId": "5b85b4f7c7451d844812874b"
      },
      {
        "id": "5b85b4f7c7451d844812873f",
        "name": "yeep.org.write",
        "isSystemPermission": true,
        "orgId": "5b85b610394ca184fe18076e",
        "roleId": "5b85b4f7c7451d844812874b"
      }
    ],
    "roles": [
      {
        "id": "5b85b4f7c7451d844812874b",
        "name": "org_manager",
        "isSystemRole": false,
        "orgId": "5b85b610394ca184fe18076e"
      }
    ],
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
