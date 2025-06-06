import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from 'svelte-kit-sst';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
	},
};

export default config;
