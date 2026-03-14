<script lang="ts">
	import ClerkWrapper from '$lib/wrappers/ClerkWrapper.svelte';
	import ConvexWrapper from '$lib/wrappers/ConvexWrapper.svelte';

	const { children } = $props();
</script>

<svelte:head>
	<title>My Sveltekit Template</title>
</svelte:head>

<ClerkWrapper>
	<ConvexWrapper>
		{@render children()}
	</ConvexWrapper>
</ClerkWrapper>
