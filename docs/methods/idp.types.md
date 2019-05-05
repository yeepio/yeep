# idp.types

`POST /api/idp.types`

## Description

Lists identity provider types available for installation.

---

## Parameters

### Body

- **q** _(string)_ — filters identity provider types by the designated query (optional)

---

## Returns

**200 OK** alongside `Object` with the following properties:

- **ok** _(boolean)_ — indicates whether the request was successfully completed
- **error** _(Object)_ — contains error details in case of an error
- **types** _(Array\<Object>)_ — array of identity provider types

---

## Example

**Request**

```
POST /api/idp.types
```

```json
{
  "q": "git"
}
```

**Response**

`200 OK`

```json
{
  "ok": true,
  "types": [
    {
      "name": "GitHub",
      "type": "GITHUB",
      "protocol": "OAUTH",
      "logo": {
        "mime": "image/svg+xml",
        "extension": "svg",
        "value": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\r\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\r\n<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"400px\"\r\n\t height=\"300px\" viewBox=\"0 0 400 300\" enable-background=\"new 0 0 400 300\" xml:space=\"preserve\">\r\n<g id=\"Layer_1\">\r\n\t<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#181616\" d=\"M199.991,1c-84.36,0-152.76,68.398-152.76,152.777\r\n\t\tc0,67.502,43.762,124.761,104.483,144.966c7.637,1.39,10.424-3.316,10.424-7.366c0-3.626-0.128-13.243-0.202-25.991\r\n\t\tc-42.496,9.232-51.473-20.479-51.473-20.479c-6.94-17.64-16.962-22.35-16.962-22.35c-13.865-9.471,1.055-9.285,1.055-9.285\r\n\t\tc15.331,1.082,23.401,15.753,23.401,15.753c13.628,23.338,35.755,16.597,44.454,12.695c1.392-9.875,5.341-16.615,9.708-20.425\r\n\t\tc-33.925-3.865-69.588-16.962-69.588-75.505c0-16.687,5.954-30.315,15.718-40.996c-1.566-3.864-6.815-19.397,1.5-40.435\r\n\t\tc0,0,12.822-4.112,42.014,15.661c12.191-3.389,25.249-5.083,38.245-5.138c12.979,0.056,26.036,1.749,38.246,5.138\r\n\t\tc29.173-19.773,41.975-15.661,41.975-15.661c8.336,21.038,3.087,36.571,1.521,40.435c9.78,10.68,15.697,24.309,15.697,40.996\r\n\t\tc0,58.689-35.719,71.604-69.753,75.377c5.486,4.725,10.368,14.049,10.368,28.298c0,20.426-0.181,36.893-0.181,41.911\r\n\t\tc0,4.083,2.746,8.83,10.502,7.345c60.659-20.238,104.384-77.466,104.384-144.944C352.769,69.398,284.369,1,199.991,1z\"/>\r\n</g>\r\n<g id=\"Homepage\">\r\n</g>\r\n</svg>\r\n"
      }
    }
  ]
}
```
