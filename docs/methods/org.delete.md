# org.delete

`POST /api/v1/org.delete`

## Description

Deletes the designated org.

Users are automatically dissociated with the deleted org. Assigned roles and permissions are deleted. Scoped permissions and roles not associated with another org are also deleted.

***

## Requires auth

Requestor must be authenticated and authorized with `yeep.org.write` permission for the designated org.

## Parameters

### Body

- **id** _(string)_ — the ID of the organization to delete (required)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **org** _(Object)_ — the newly delete org

***

## Example

**Request**

`POST /api/v1/org.delete`

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
  "ok": true
}
```
