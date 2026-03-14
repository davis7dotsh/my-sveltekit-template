<script lang="ts">
	import { setClerkContext } from '$lib/stores/clerk.svelte';

	const { children } = $props();

	const clerkContext = setClerkContext();
</script>

{#if clerkContext.isClerkLoaded}
	{@render children()}
{:else}
	<div>Loading...</div>
{/if}
