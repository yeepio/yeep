const YeepClient = require('@yeep/client');

const yeepClient = new YeepClient({
  baseURL: process.env.API_BASE_URL,
});

export default yeepClient;
