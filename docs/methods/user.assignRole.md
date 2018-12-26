# user.assignRole

`POST /api/v1/user.assignRole`

## Description

Assigns the designated role to the specified user, in the context of org, applying to the given resource.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.role.assignment.write` permission for the specified org scope (see body parameters below) or the _global_ scope.

## Parameters

### Body

- **userId** _(string)_ — the ID of the assignee user (required)
- **roleId** _(string)_ — the ID of the role to assign to user (required)
- **orgId** _(string)_ — optional org ID to define the context of the assignment; implies global context (i.e. all orgs) if left undefined (optional)
- **resourceId** _(string|number)_ — optional resource ID to limit the application of the role assignment (optional)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **roleAssignment** _(Object)_ — details on the newly created role assignment

---

## Example

**Request**

```
POST /api/v1/user.assignRole
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
  "ok": true,
  "roleAssignment": {
    "userId": "507f191e810c19729de860ea",
    "roleId": "402f191e901c19729de720ba",
    "orgId": "333a291e810c19729de902ee"
  }
}
```
