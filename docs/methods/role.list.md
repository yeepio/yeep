# role.list

`POST /api/role.list`

## Description

Retrieves list of roles that the requestor has access to.

---

## Auth logic

Requestor must be authenticated. No explicit permissions are required; only retrieves permissions that the requestor can access via `yeep.role.read`.

## Parameters

### Body

- **q** _(string)_ — filters roles by the designated query (optional)
- **scope** _(string)_ — filters roles by the designated org (optional)
- **isSystemRole** _(boolean)_ — retrieves only system roles (optional)
- **limit** _(string)_ — maximum number of roles to return (optional)
- **cursor** _(string)_ — paginates through roles by setting the `cursor` param (optional)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **roles** _(Array\<Object>)_ — array of roles
- **roleCount** _(Number)_ — total number of roles
- **nextCursor** _(string)_ — use this `cursor` to facilitate pagination

---

## Example

**Request**

```
POST /api/role.list
Authorization: `Bearer ${authToken}`
```

```json
{
  "q": "acme",
  "limit": 1,
  "cursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwOSI="
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "roles": [
    {
      "id": "5b969dc9901e2af192780a35",
      "name": "acme:developer",
      "description": "Developer role",
      "isSystemRole": false,
      "permissions": [
        {
          "id": "5b969dc9901e2af192780a34",
          "name": "acme.repo.write"
        }
      ],
      "org": {
        "id": "8a9295c9901e7af196785a34",
        "name": "acme"
      },
      "createdAt": "2017-07-13T05:00:42.145Z",
      "updatedAt": "2017-07-13T05:42:42.222Z"
    }
  ],
  "roleCount": 1000,
  "nextCursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwYSI="
}
```
