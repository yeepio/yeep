# user.setPicture

`POST /api/v1/user.setPicture`

## Description

Sets the profile picture of the designated user.

***

## Requires auth

Requestor must be authenticated and assigned with global `yeep.user.write` permission to set the profile picture of another user.

Otherwise, users are able to set their own profile picture.

## Parameters

### Content type

`multipart/form-data`

### Body

- **id** _(string)_ — user ID (required)
- **picture** _(buffer)_ — the picture data (required)
- **cropSize** _(number)_ — size of the crop area (always square); defaults to the min width/height of the image (optional)
- **cropX** _(number)_ — X coordinate of top-left corner of crop box; defaults to `0` (optional)
- **cropY** _(number)_ — Y coordinate of top-left corner of crop box; defaults to `0` (optional)

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
POST /api/v1/user.setPicture
Authorization: `Bearer ${authToken}`
multipart/form-data
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "user": {
    "id": "507f191e810c19729de860ea",
    "picture": "https://yourdomain.com/media/507f191e810c19729de860ea.jpeg",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
