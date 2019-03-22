# org.list

`POST /api/v1/org.list`

## Description

Retrieves list of organisations that the requestor has access to.

***

## Auth logic

Requestor must be authenticated. No explicit permissions are required; only retrieves organisations that the requestor can access via `yeep.org.read`.

## Parameters

### Body

- **q** _(string)_ — filters organisations by the designated query (optional)
- **limit** _(string)_ — maximum number of organisations to return (optional)
- **cursor** _(string)_ — paginates through organisations by setting the `cursor` param (optional)
- **user** _(string)_ — when specified returns organizations that the designated user is member of (optional)

***

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **orgs** _(Array\<Object>)_ — array of organisations
- **nextCursor** _(string)_ — use this `cursor` to facilitate pagination

***

## Example

**Request**

```
POST /api/v1/org.list
Authorization: `Bearer ${accessToken}`
```

``` json
{
  "q": "acme",
}
```

**Response**

`200 OK`

``` json
{
  "ok": true,
  "orgs": [{
    "_id": "5c86b03771ac98675a2f8e30",
    "name": "Acme Inc",
    "slug": "acme",
    "createdAt": "2019-03-11T19:00:07.282Z",
    "updatedAt": "2019-03-11T19:00:07.282Z",
    "usersCount": 5
  }],
  "nextCursor": "IjViN2QwZGIyMzg1YzcyNWY5ZjNkODkwYSI="
}
```
