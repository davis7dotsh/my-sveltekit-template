<script lang="ts">
	import { getClerkContext } from '$lib/stores/clerk.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';

	const clerkContext = getClerkContext();

	const demoQuery = useQuery(api.authed.demo.authedDemoQuery, {});

	$inspect(demoQuery.data);
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center">
	{#if clerkContext.clerk.user}
		<div
			{@attach (el) => {
				clerkContext.clerk.mountUserButton(el);
			}}
		></div>
	{:else}
		<div
			{@attach (el) => {
				clerkContext.clerk.mountSignIn(el, {});
			}}
		></div>
	{/if}
</div>
