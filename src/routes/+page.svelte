<script lang="ts">
	import { resolve } from '$app/paths';
	import { remoteDemoQuery } from '$lib/remote/demo.remote';

	const stuff = await remoteDemoQuery();
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<pre>{JSON.stringify(stuff, null, 2)}</pre>

<a href={resolve('/app')}>App</a>
