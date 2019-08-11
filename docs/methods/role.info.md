# role.info

`POST /api/role.info`

## Description

Retrieves information on the designated role.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.role.read` permission for the designated role's org scope or the _global_ scope.

## Parameters

### Body

- **id** _(string)_ — role ID (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **role** _(Object)_ — role details

---

## Example

**Request**

```
POST /api/role.info
Authorization: `Bearer ${authToken}`
```

```json
{
  "id": "507f191e810c19729de860ea"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "role": {
    "id": "507f191e810c19729de860ea",
    "name": "acme:manager",
    "description": "Manager role",
    "isSystemRole": false,
    "permissions": [
      {
        "id": "5b969dc9901e2af192780a34",
        "name": "acme.user.write"
      }
    ],
    "org": {
      "id": "8a9295c9901e7af196785a34",
      "name": "acme"
    },
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
