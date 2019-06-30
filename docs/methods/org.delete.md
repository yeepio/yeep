# org.delete

`POST /api/org.delete`

## Description

Deletes the designated org.

Users are automatically dissociated with the deleted org. Assigned roles and permissions are deleted. Scoped permissions and roles not associated with another org are also deleted.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.org.write` permission with _global_ scope or within the scope of the designated org.

## Parameters

### Body

- **id** _(string)_ — the ID of the organization to delete (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **org** _(Object)_ — the newly delete org

---

## Example

**Request**

```
POST /api/org.delete
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
