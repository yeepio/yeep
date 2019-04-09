# user.list

`POST /api/v1/user.list`

## Description

Retrieves list of users that the requestor has access to.

***

## Auth logic

Requestor must be authenticated. No explicit permissions required; retrieves users that the requestor can access via `yeep.user.read`.

## Parameters

### Body

- **q** _(string)_ — filters users by the designated query (optional)
- **org** _(string)_ — filters users by the designated org (optional)
- **limit** _(string)_ — maximum number of users to return (optional)
- **cursor** _(string)_ — paginates through users by setting the `cursor` param (optional)
- **projection** _(Object)_ — user fields to return (optional)
  - **id** _(boolean)_ — (optional; defaults to `true`)
  - **username** _(boolean)_ - (optional; defaults to `true`)
  - **fullName** _(boolean)_ - (optional; defaults to `true`)
  - **picture** _(boolean)_ - (optional; defaults to `true`)
  - **emails** _(boolean)_ - (optional; defaults to `true`)
  - **orgs** _(boolean)_ - (optional; defaults to `true`)
  - **createdAt** _(boolean)_ - (optional; defaults to `true`)
  - **updatedAt** _(boolean)_ - (optional; defaults to `true`)
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
Authorization: `Bearer ${accessToken}`
```

``` json
{
  "q": "acme",
  "limit": 1,
  "cursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwOSI=",
  "projection": {
    "emails": false
  }
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
    "orgs": [
      "5b85b610394ca184fe18076e"
    ],
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }],
  "nextCursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwYSI="
}
```
