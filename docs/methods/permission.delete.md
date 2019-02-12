# permission.delete

`POST /api/v1/permission.delete`

## Description

Deletes the designated permission.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.permission.write` permission for the designated permission's scope or the _global_ scope.

## Parameters

### Body

- **id** _(string)_ — permission ID (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/v1/permission.delete
Authorization: `Bearer ${accessToken}`
```

```json
{
  "id": "5b2d649ce248cb779e7f26e2"
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
