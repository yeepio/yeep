# permission.info

`POST /api/permission.info`

## Description

Retrieves information on the designated permission.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.permission.read` permission for the designated permission's org scope or the _global_ scope.

## Parameters

### Body

- **id** _(string)_ — permission ID (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **permission** _(Object)_ — permission details

---

## Example

**Request**

```
POST /api/permission.info
Authorization: `Bearer ${accessToken}`
```

```json
{
  "id": "327f191e810c19729de76232"
}
```

**Response**

`200 OK`

```json
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
