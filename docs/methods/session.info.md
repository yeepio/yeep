# session.info

`POST /api/v1/session.info`

## Description

Retrieves information on the currently active session.

***

## Auth logic

Requestor must be authenticated.

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **session** _(Object)_ — session info

***

## Example

**Request**

```
POST /api/v1/session.info
Authorization: `Bearer ${authToken}`
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "session": {}
}
```
