function parseAuthnHeader(headerValue) {
  const arr = headerValue.split(' ');

  return {
    schema: arr[0],
    token: arr[1] || null,
  };
}

export default parseAuthnHeader;
