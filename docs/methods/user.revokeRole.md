# user.revokeRole

`POST /api/user.revokeRole`

## Description

Dissociates the specified role from the the designated user.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.role.assignment.write` permission for the specified org scope (see body params below) or the _global_ scope.

## Parameters

### Body

- **userId** _(string)_ — the ID of the assignee user (required)
- **roleId** _(string)_ — the ID of the role assigned to user (required)
- **orgId** _(string)_ — the org context of the assignment; implies global context if left undefined (optional)
- **resourceId** _(string|number)_ — the resource ID that the assigned permission applies to (optional)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/user.revokeRole
Authorization: `Bearer ${authToken}`
```

```json
{
  "userId": "507f191e810c19729de860ea",
  "roleId": "402f191e901c19729de720ba",
  "orgId": "333a291e810c19729de902ee"
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
