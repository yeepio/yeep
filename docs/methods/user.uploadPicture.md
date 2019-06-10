# user.uploadPicture

`POST /api/user.uploadPicture`

## Description

Uploads the profile picture of the designated user.

***

## Auth logic

### A. Performing on another user

Requestor must be authenticated and assigned with `yeep.user.write` in _global_ scope permission to set the profile picture of another user.

### B. Requestor is same as user

Users are able to set their own profile picture without explicit permission.

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
POST /api/user.uploadPicture
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
