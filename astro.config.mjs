import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://wizai.fr',
    integrations: [sitemap()],
    vite: {
    plugins: [tailwindcss()],
  },
});
