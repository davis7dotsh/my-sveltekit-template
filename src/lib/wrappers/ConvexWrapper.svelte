<script lang="ts">
	import { CONVEX_URL } from '$lib/services/convex-env';
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { setupConvex, useConvexClient } from 'convex-svelte';

	const clerkContext = getClerkContext();

	const getClerkAuthToken = async () => {
		if (!clerkContext.currentSession) return null;

		return clerkContext.currentSession.getToken({
			template: 'convex'
		});
	};

	setupConvex(CONVEX_URL);

	const convex = useConvexClient();

	convex.setAuth(getClerkAuthToken);

	const { children } = $props();
</script>

{@render children()}
