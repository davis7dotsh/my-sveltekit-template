<script lang="ts">
	import { CONVEX_URL } from '$lib/convex-env';
	import { getWorkOSContext } from '$lib/stores/workos.svelte';
	import { setupConvex, useConvexClient } from 'convex-svelte';

	const workOSContext = getWorkOSContext();
	const convexUrl = CONVEX_URL;

	if (!convexUrl) {
		throw new Error('Missing PUBLIC_CONVEX_URL');
	}

	const getWorkOSAccessToken = () => workOSContext.getAccessToken();

	setupConvex(convexUrl);

	const convex = useConvexClient();

	convex.setAuth(getWorkOSAccessToken);

	const { children } = $props();
</script>

{@render children()}
