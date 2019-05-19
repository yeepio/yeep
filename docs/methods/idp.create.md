# idp.create

`POST /api/idp.create`

## Description

Installs the given identity provider under the designated org.

---

## Parameters

### Body

- **org** _(string)_ — the ID of the organization to install the identity provider under (optional; defaults to global scope)
- **type** _(string)_ — identity provider type (required)
- **protocol** _(string)_ — identity provider protocol - `OAUTH` is currently the only valid option (required)
- **clientId** _(string)_ — identity provider client ID (required when protocol is `OAUTH`)
- **clientSecret** _(string)_ — identity provider client secret (required when protocol is `OAUTH`)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **idp** _(Array\<Object>)_ — details about the installed identity provider

---

## Example

**Request**

```
POST /api/idp.create
```

```json
{
  "org": "507f191e810c19729de555fe",
  "type": "GITHUB",
  "protocol": "OAUTH",
  "clientId": "xxx",
  "clientSecret": "xxxxxx"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "identityProvider": {
    "id": "507f191e810c19729de860ea",
    "type": "GITHUB",
    "protocol": "OAUTH",
    "org": null,
    "createdAt": "2018-07-23T20:24:53.588Z",
    "updatedAt": "2018-07-23T20:24:53.588Z"
  }
}
```
