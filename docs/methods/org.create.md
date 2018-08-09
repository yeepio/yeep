# org.create

`POST /api/v1/org.create`

## Description

Creates new org.

Requestor is automatically assigned with the "admin" role for the newly created org, assuming the org was successfully created.

***

## Requires auth

Requestor must be authenticated and assigned with the `yeep.org.write` permission depending on the `isOrgCreationOpen` setting (see table below).

| isOrgCreationOpen | Required permission |
| ----------------- | ------------------- |
| `true` | `yeep.org.write` |
| `false` | - |

## Parameters

### Body

- **name** _(string)_ — the name of the organization (required)
- **slug** _(string)_ — the URL key of the organization, a.k.a. slug (required)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **org** _(Object)_ — the newly created org

***

## Example

**Request**

```
POST /api/v1/org.create
Authorization: `Bearer ${authToken}`
```

``` json
{
  "name": "ACME Inc.",
  "slug": "acme"
}
```

**Response**

`200 Created`

``` json
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
