# role.delete

`POST /api/role.delete`

## Description

Deletes the designated role.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.role.write` permission for the designated role's org scope or the _global_ scope.

## Parameters

### Body

- **id** _(string)_ — role ID (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/role.delete
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
  "ok": true
}
```
