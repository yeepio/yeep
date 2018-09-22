# user.list

`POST /api/v1/user.list`

## Description

Retrieves list of users that the requestor has access to.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.user.read` role.

## Parameters

### Body

- **q** _(string)_ — filters users by the designated query (optional)
- **limit** _(string)_ — maximum number of users to return (optional)
- **cursor** _(string)_ — paginates through users by setting the `cursor` param (optional)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **users** _(Array\<Object>)_ — array of users
- **nextCursor** _(string)_ — use this `cursor` to facilitate pagination

***

## Example

**Request**

```
POST /api/v1/user.list
Authorization: `Bearer ${authToken}`
```

``` json
{
  "q": "acme",
  "limit": 1,
  "cursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwOSI="
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "users": [{
    "id": "507f191e810c19729de860ea",
    "username": "wile",
    "fullName": "Wile E. Coyote",
    "picture": "https://www.acme.com/pictures/coyote.png",
    "emails": [
      {
        "address": "coyote@acme.com",
        "isVerified": true,
        "isPrimary": true,
      },
    ],
    "orgs": [
      "5b85b610394ca184fe18076e"
    ],
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }],
  "nextCursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwYSI="
}
```
