import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://cis1912.org',
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },
});