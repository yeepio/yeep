# user.revokeRole

`POST /api/v1/user.revokeRole`

## Description

Dissociates the specified role from the the designated user.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.role.assignment.write` permission.

## Parameters

### Body

- **id** _(string)_ — the ID of role assignment (required)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

***

## Example

**Request**

```
POST /api/v1/user.revokeRole
Authorization: `Bearer ${authToken}`
```

``` json
{
  "id": "1000291e910c19729de903ab"
}
```

**Response**

`200 OK`

``` json
{
  "ok": true
}
```
