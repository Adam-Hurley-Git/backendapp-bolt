import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000,
		strictPort: false
	},
	build: {
		target: 'esnext'
	},
	define: {
		'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(
			process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
		),
		'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
			process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
		),
		'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
			process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || ''
		),
		'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
			process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || ''
		)
	}
});
