import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://twojstronnik.pl',
  trailingSlash: 'always',
  // Proxy contact requests to the local mail service during development.
  vite: { server: { proxy: { '/api/contact': 'http://127.0.0.1:3107' } } },
});
