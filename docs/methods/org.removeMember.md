# org.removeMember

`POST /api/org.removeMember`

## Description

Remove the designated user from the specified org.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.user.write` permission for the specified org scope (see body params below) or the _global_ scope.

## Parameters

### Body

- **orgId** _(string)_ — the ID of the org to add member to (required)
- **userId** _(string)_ — the ID of the user to add as member (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error

---

## Example

**Request**

```
POST /api/org.removeMember
Authorization: `Bearer ${accessToken}`
```

```json
{
  "orgId": "333a291e810c19729de902ee",
  "userId": "507f191e810c19729de860ea"
}
```

**Response**

`200 OK`

```json
{
  "ok": true
}
```
