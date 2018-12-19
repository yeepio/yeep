# user.assignPermission

`POST /api/v1/user.assignPermission`

## Description

Assigns the designated permission to the specified user, in the context of org, applying to the given resource.

***

## Auth logic

Requestor must be authenticated and assigned with the `yeep.permission.assignment.write` permission for the specified org (see body parameters below).

## Parameters

### Body

- **userId** _(string)_ — the ID of the assignee user (required)
- **permissionId** _(string)_ — the ID of the permission to assign to user (required)
- **orgId** _(string)_ — optional org ID to define the context of the assignment; implies global context (i.e. all orgs) if left undefined (optional)
- **resourceId** _(string|number)_ — optional resource ID to limit the application of the permission assignment (optional)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **permissionAssignment** _(Object)_ — details on the newly created permission-assignment

***

## Example

**Request**

```
POST /api/v1/user.assignPermission
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
  "ok": true,
  "permissionAssignment": {
    "userId": "507f191e810c19729de860ea",
    "permissionId": "402f191e901c19729de720ba",
    "orgId": "333a291e810c19729de902ee"
  }
}
```
