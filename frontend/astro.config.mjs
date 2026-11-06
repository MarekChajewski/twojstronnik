import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://twojstronnik.pl',
  trailingSlash: 'always',
  // Tylko do pracy lokalnej: formularz w Astro -> osobny serwer pocztowy.
  vite: { server: { proxy: { '/api/contact': 'http://127.0.0.1:3107' } } },
});
