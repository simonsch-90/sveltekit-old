import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Enable esbuild polyfill plugins
	plugins: [sveltekit()],
});
