# user.revokePermission

`POST /api/v1/user.revokePermission`

## Description

Dissociates the specified permission from the the designated user.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.permission.assignment.write` permission.

## Parameters

### Body

- **userId** _(string)_ — the ID of the assignee user (required)
- **permissionId** _(string)_ — the ID of the permission assigned to user (required)
- **orgId** _(string)_ — the org context of the assignment; implies global context if left undefined (optional)
- **resourceId** _(string|number)_ — the resource ID that the assigned permission applies to (optional)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

***

## Example

**Request**

```
POST /api/v1/user.revokePermission
Authorization: `Bearer ${authToken}`
```

``` json
{
  "userId": "507f191e810c19729de860ea",
  "permissionId": "402f191e901c19729de720ba",
  "orgId": "333a291e810c19729de902ee"
}
```

**Response**

`200 OK`

``` json
{
  "ok": true
}
```
