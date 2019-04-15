# org.create

`POST /api/org.create`

## Description

Creates new org.

Requestor is automatically assigned with the "admin" role for the newly created org, assuming the org was successfully created.

---

## Auth logic

Requestor must be authenticated and assigned with the `yeep.org.write` permission depending on the `isOrgCreationOpen` config setting (see table below).

| isOrgCreationOpen | Required permission |
| ----------------- | ------------------- |
| `false`           | `yeep.org.write`    |
| `true`            | -                   |

## Parameters

### Body

- **name** _(string)_ — the name of the organization (required)
- **slug** _(string)_ — the URL key of the organization, a.k.a. slug (required)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **org** _(Object)_ — the newly created org

---

## Example

**Request**

```
POST /api/org.create
Authorization: `Bearer ${accessToken}`
```

```json
{
  "name": "ACME Inc.",
  "slug": "acme"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "org": {
    "id": "507f191e810c19729de860ea",
    "name": "ACME Inc.",
    "slug": "acme",
    "createdAt": "2018-07-23T20:24:53.588Z",
    "updatedAt": "2018-07-23T20:24:53.588Z"
  }
}
```
