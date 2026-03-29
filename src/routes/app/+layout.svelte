<script lang="ts">
	import ConvexWrapper from '$lib/wrappers/ConvexWrapper.svelte';
	import WorkOSWrapper from '$lib/wrappers/WorkOSWrapper.svelte';

	const { children } = $props();
</script>

<svelte:head>
	<title>Conference Tracker</title>
</svelte:head>

<WorkOSWrapper>
	<ConvexWrapper>
		{@render children()}
	</ConvexWrapper>
</WorkOSWrapper>
