# user.invite

`POST /api/v1/user.invite`

## Description

Sends an email invitation to the designated user, inviting them to join the specified org with the supplied permissions.

Invitee must explicitly accept the invitation. If invitee is already a yeep user they will simply join the org. If invitee is not already a yeep user, they must create a user account first and then automatically join the org.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.user.write` permission in the specified org scope (see body params below) or the _global_ scope.

When `permissions` are specified (see body params below) then requestor must be additionaly assigned with the `yeep.permission.assignment.write` permission for the specified org scope (see body params below) or the _global_ scope.

When `roles` are specified (see body params below) then requestor must be additionaly assigned with the `yeep.role.assignment.write` permission for the specified org scope (see body params below) or the _global_ scope.

## Parameters

### Body

- **userKey** _(string)_ — username or email address of the invitee (required)
- **orgId** _(string)_ — the ID of the org that the invitee would join (required)
- **roles** _(Array\<string>)_ — array of roles to assign the user with (optional)
  - **roles[].id** _(string)_ — role ID (required)
  - **roles[].resourceId** _(string)_ — optional resource ID to limit the scope of the role assignment (optional)
- **permissions** _(Array\<Object>)_ — array of permissions to assign the user with (optional)
  - **permissions[].id** _(string)_ — permission ID (required)
  - **permissions[].resourceId** _(string)_ — optional resource ID to limit the scope of the permission assignment (optional)
- **tokenExpiresInSeconds** _(number)_ — number of seconds after which the _invitation_ token will expire (optional; defaults to 604800 seconds, i.e. 1 week)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/v1/user.invite
Authorization: `Bearer ${authToken}`
```

```json
{
  "userKey": "coyote@acme.com",
  "orgId": "333a291e810c19729de902ee",
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
