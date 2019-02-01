# invitation.list

`POST /api/v1/invitation.list`

## Description

Retrieves list of pending invitations.

---

## Auth logic

### A. Generic requests

Requestor must be authenticated and assigned with the `yeep.invitation.read` permission for the designated org (see body params below) or the _global_ scope.

### B. Requestor is same as user

Users are able to retrieve a list of their own pending invitations as long as user (see body params below) is the ID of the requestor.

## Parameters

### Body

- **org** _(string)_ — org ID to filter pending invitations by (optional)
- **user** _(string)_ — user ID to filter pending invitations by (optional)
- **limit** _(string)_ — maximum number of pending invitations to return (optional)
- **cursor** _(string)_ — paginates through pending invitations by setting the `cursor` param (optional)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **invitations** _(Array\<Object>)_ — array of pending invitations
- **nextCursor** _(string)_ — use this `cursor` to facilitate pagination

---

## Example

**Request**

```
POST /api/v1/invitation.list
Authorization: `Bearer ${authToken}`
```

```json
{
  "org": "507f191e810c19729de860ea",
  "limit": 1,
  "cursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwOSI="
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "invitations": [
    {
      "id": "5c54244f4346975677fdffac",
      "token": "vp3VUvpHkyR7B1pMeGonmmJf",
      "org": {
        "id": "507f191e810c19729de860ea"
      },
      "user": {
        "id": null,
        "emailAddress": "beep-beep@acme.com"
      },
      "roles": [
        {
          "id": "327f191e810c19729de76232"
        }
      ],
      "permissions": [],
      "createdAt": "2017-07-13T05:00:42.145Z",
      "updatedAt": "2017-07-13T05:42:42.222Z",
      "expiresAt": "2017-08-13T05:42:42.222Z"
    }
  ],
  "nextCursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwYSI="
}
```
