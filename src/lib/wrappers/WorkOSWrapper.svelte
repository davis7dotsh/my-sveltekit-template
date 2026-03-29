<script lang="ts">
	import { setWorkOSContext } from '$lib/stores/workos.svelte';

	const { children } = $props();

	const workOSContext = setWorkOSContext();
</script>

{#if workOSContext.isLoaded}
	{@render children()}
{:else}
	<div>Loading...</div>
{/if}
