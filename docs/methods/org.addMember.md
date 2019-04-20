# org.addMember

`POST /api/org.addMember`

## Description

Adds the designated user as member to the specified org.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.user.write` permission for the specified org scope (see body params below) or the _global_ scope.

When `permissions` are specified (see body params below) then requestor must be additionaly assigned with the `yeep.permission.assignment.write` permission for the specified org scope (see body params below) or the _global_ scope.

When `roles` are specified (see body params below) then requestor must be additionaly assigned with the `yeep.role.assignment.write` permission for the specified org scope (see body params below) or the _global_ scope.

## Parameters

### Body

- **orgId** _(string)_ — the ID of the org to add member to (required)
- **userId** _(string)_ — the ID of the user to add as member (required)
- **roles** _(Array\<string>)_ — array of roles to assign the user with (optional)
  - **roles[].id** _(string)_ — role ID (required)
  - **roles[].resourceId** _(string)_ — optional resource ID to limit the scope of the role assignment (optional)
- **permissions** _(Array\<Object>)_ — array of permissions to assign the user with (optional)
  - **permissions[].id** _(string)_ — permission ID (required)
  - **permissions[].resourceId** _(string)_ — optional resource ID to limit the scope of the permission assignment (optional)
- **expiresInSeconds** _(number)_ — number of seconds after which the user membership will automatically expire (optional; implies _forever_ if not specified)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/org.addMember
Authorization: `Bearer ${accessToken}`
```

```json
{
  "orgId": "333a291e810c19729de902ee",
  "userId": "507f191e810c19729de860ea",
  "permissions": [
    {
      "id": "402f191e901c19729de720ba"
    }
  ]
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
