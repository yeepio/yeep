# org.update

`POST /api/v1/org.update`

## Description

Updates the designated org with the specified properties.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.org.write` permission for the designated org scope or the _global_ scope.

## Parameters

### Body

- **id** _(string)_ — org ID (required)
- **name** _(string)_ — the name of the organization (optional)
- **slug** _(string)_ — the URL key of the organization, a.k.a. slug (optional)

_Please note: one of `name` or `slug` must be specified, otherwise update makes no sense._

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **org** _(Object)_ — org details

---

## Example

**Request**

```
POST /api/v1/org.update
Authorization: `Bearer ${accessToken}`
```

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Acme Inc",
  "slug": "acme"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "org": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Acme Inc",
    "slug": "acme",
    "createdAt": "2017-07-13T05:00:42.145Z",
    "updatedAt": "2017-07-13T05:42:42.222Z"
  }
}
```
