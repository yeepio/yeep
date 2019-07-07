import YeepClient from '@yeep/client';

const yeepClient = new YeepClient({
  baseURL: process.env.API_BASE_URL,
  onError: (err) => console.error(err),
});

export default yeepClient;
