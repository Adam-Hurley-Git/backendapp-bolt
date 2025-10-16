<script>
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import '../app.css';

	onMount(() => {
		// Clear old localStorage-based sessions (migration to cookie-based sessions)
		if (browser && typeof window !== 'undefined') {
			// Check for old localStorage session keys
			const hasOldSession = Object.keys(localStorage).some(key =>
				key.startsWith('sb-') || key.includes('supabase')
			);

			if (hasOldSession) {
				console.log('Clearing old localStorage-based Supabase session...');
				// Clear all Supabase-related localStorage items
				Object.keys(localStorage).forEach(key => {
					if (key.startsWith('sb-') || key.includes('supabase')) {
						localStorage.removeItem(key);
					}
				});
				console.log('Old session cleared. Please sign in again.');
			}
		}

		authStore.initialize();

		return () => {
			authStore.cleanup();
		};
	});
</script>

<svelte:head>
	<title>CalendarExtension - ColorKit - Chrome Extension Backend</title>
	<meta name="description" content="Manage your Chrome extension subscription and billing" />
</svelte:head>

<div class="min-h-screen">
	<slot />
</div>
