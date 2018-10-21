# user.deletePicture

`POST /api/v1/user.deletePicture`

## Description

Deletes the profile picture of the designated user.

***

## Requires auth

Requestor must be authenticated and assigned with global `yeep.user.write` permission to set the profile picture of another user.

Otherwise, users are able to delete their own profile picture.

## Parameters

### Body

- **id** _(string)_ — user ID (required)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **user** _(Object)_ — updated user info

***

## Example

**Request**

```
POST /api/v1/user.deletePicture
Authorization: `Bearer ${authToken}`
```

``` json
{
  "id": "507f191e810c19729de860ea"
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "picture": null,
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
