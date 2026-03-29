<script lang="ts">
	import { resolve } from '$app/paths';
	import PageError from '$lib/components/PageError.svelte';
	import { remoteAuthedDemoQuery, remoteDemoQuery } from '$lib/remote/demo.remote';
	import { getWorkOSContext } from '$lib/stores/workos.svelte';
	import { api } from '../../../convex/_generated/api';
	import { useConvexClient, useQuery } from 'convex-svelte';

	const workOSContext = getWorkOSContext();
	const client = useConvexClient();
	const authedDemo = useQuery(api.authed.demo.authedDemoQuery, {});

	let mutationResult = $state<string | null>(null);
	let mutationLoading = $state(false);
	let serverAuthResult = $state<string | null>(null);
	let serverAuthLoading = $state(false);

	async function runClientMutation() {
		mutationLoading = true;
		mutationResult = null;

		try {
			const id = await client.mutation(api.authed.conferences.create, {
				name: `Test Conf ${Date.now()}`,
				location: 'Localhost',
				startDate: Date.now(),
				endDate: Date.now() + 86400000,
				description: 'Created from references page'
			});
			mutationResult = `Created conference: ${id}`;
		} catch (error) {
			mutationResult = `Error: ${error instanceof Error ? error.message : String(error)}`;
		} finally {
			mutationLoading = false;
		}
	}

	async function runServerAuthDemo() {
		serverAuthLoading = true;
		serverAuthResult = null;

		try {
			const accessToken = await workOSContext.getAccessToken();
			const result = await remoteAuthedDemoQuery(accessToken);
			serverAuthResult = JSON.stringify(result, null, 2);
		} catch (error) {
			serverAuthResult = `Error: ${error instanceof Error ? error.message : String(error)}`;
		} finally {
			serverAuthLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-stone-50 font-sans text-stone-900">
	<header class="border-b border-stone-200 bg-white">
		<div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-3">
				<a
					href={resolve('/app')}
					class="text-sm text-stone-400 transition-colors hover:text-stone-600">&larr; Back</a
				>
				<div>
					<h1 class="text-lg font-semibold tracking-tight">Pattern References</h1>
					<p class="text-sm text-stone-500">{workOSContext.currentUser?.email}</p>
				</div>
			</div>
			<button
				onclick={() => workOSContext.signOut()}
				class="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
			>
				Sign out
			</button>
		</div>
	</header>

	<main class="mx-auto max-w-3xl space-y-6 px-6 py-8">
		<section class="rounded-lg border border-stone-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-stone-400 uppercase">
				1. Client Authed Query
			</h2>
			<p class="mt-1 text-sm text-stone-500">
				Reactive query via <code class="rounded bg-stone-100 px-1 py-0.5 text-xs"
					>useQuery(api.authed.demo.authedDemoQuery, {'{}'})</code
				>
			</p>
			<div class="mt-3 rounded-md bg-stone-50 p-3">
				{#if authedDemo.isLoading}
					<p class="text-sm text-stone-400">Loading...</p>
				{:else if authedDemo.data}
					<pre class="text-sm text-stone-700">{JSON.stringify(authedDemo.data, null, 2)}</pre>
				{:else}
					<p class="text-sm text-stone-400">No data yet.</p>
				{/if}
			</div>
			<details class="mt-3">
				<summary class="cursor-pointer text-xs font-medium text-stone-400 hover:text-stone-600"
					>How it works</summary
				>
				<div class="mt-2 space-y-1 text-xs text-stone-500">
					<p>
						WorkOS AuthKit provides the access token, and <code
							class="rounded bg-stone-100 px-1 py-0.5">ConvexWrapper</code
						>
						passes it into <code class="rounded bg-stone-100 px-1 py-0.5">convex.setAuth()</code>.
					</p>
					<p>
						<code class="rounded bg-stone-100 px-1 py-0.5">authedQuery</code> then checks
						<code class="rounded bg-stone-100 px-1 py-0.5">ctx.auth.getUserIdentity()</code> on the Convex
						side.
					</p>
				</div>
			</details>
		</section>

		<section class="rounded-lg border border-stone-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-stone-400 uppercase">
				2. Client Authed Mutation
			</h2>
			<p class="mt-1 text-sm text-stone-500">
				Imperative mutation via <code class="rounded bg-stone-100 px-1 py-0.5 text-xs"
					>useConvexClient()</code
				>.
			</p>
			<div class="mt-3 flex items-center gap-3">
				<button
					onclick={runClientMutation}
					disabled={mutationLoading}
					class="rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
				>
					{mutationLoading ? 'Creating...' : 'Create Test Conference'}
				</button>
				{#if mutationResult}
					<p class="text-sm text-stone-500">{mutationResult}</p>
				{/if}
			</div>
		</section>

		<section class="rounded-lg border border-stone-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-stone-400 uppercase">
				3. Private Backend Query
			</h2>
			<p class="mt-1 text-sm text-stone-500">
				Server-side Convex call through <code class="rounded bg-stone-100 px-1 py-0.5 text-xs"
					>ConvexPrivateService</code
				>.
			</p>
			<div class="mt-3 rounded-md bg-stone-50 p-3">
				<svelte:boundary>
					{@const result = await remoteDemoQuery()}
					<pre class="text-sm text-stone-700">{JSON.stringify(result, null, 2)}</pre>
					{#snippet pending()}
						<p class="text-sm text-stone-400">Loading from server...</p>
					{/snippet}
					{#snippet failed(error, reset)}
						<div class="space-y-2">
							<PageError {error} />
							<button
								onclick={reset}
								class="text-xs font-medium text-stone-500 underline underline-offset-2 hover:text-stone-700"
								>Retry</button
							>
						</div>
					{/snippet}
				</svelte:boundary>
			</div>
		</section>

		<section class="rounded-lg border border-stone-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-stone-400 uppercase">
				4. Server-side WorkOS Validation
			</h2>
			<p class="mt-1 text-sm text-stone-500">
				Validate the current WorkOS access token on the SvelteKit server, then fetch the user from
				WorkOS.
			</p>
			<div class="mt-3 space-y-3">
				<button
					onclick={runServerAuthDemo}
					disabled={serverAuthLoading}
					class="rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
				>
					{serverAuthLoading ? 'Validating...' : 'Run server auth demo'}
				</button>
				{#if serverAuthResult}
					<pre
						class="overflow-x-auto rounded-md bg-stone-50 p-3 text-sm text-stone-700">{serverAuthResult}</pre>
				{/if}
			</div>
			<details class="mt-3">
				<summary class="cursor-pointer text-xs font-medium text-stone-400 hover:text-stone-600"
					>How it works</summary
				>
				<div class="mt-2 space-y-1 text-xs text-stone-500">
					<p>
						The browser asks AuthKit for an access token with <code
							class="rounded bg-stone-100 px-1 py-0.5">getAccessToken()</code
						>.
					</p>
					<p>
						The remote query passes that token into <code class="rounded bg-stone-100 px-1 py-0.5"
							>WorkOSService.validateAccessToken()</code
						>.
					</p>
					<p>
						The service verifies the JWT against WorkOS JWKS, then fetches the user record with the
						WorkOS Node SDK.
					</p>
				</div>
			</details>
		</section>

		<section class="rounded-lg border border-stone-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-stone-400 uppercase">
				5. Error Handling Patterns
			</h2>
			<div class="mt-3 space-y-3 text-xs text-stone-600">
				<div class="rounded-md border border-stone-200 p-3">
					<h3 class="font-semibold text-stone-700">Server-side tagged errors</h3>
					<p class="mt-1">
						<code class="rounded bg-stone-100 px-1 py-0.5">effectRunner</code> logs and maps
						<code class="rounded bg-stone-100 px-1 py-0.5">ConvexError</code>,
						<code class="rounded bg-stone-100 px-1 py-0.5">WorkOSError</code>, and
						<code class="rounded bg-stone-100 px-1 py-0.5">GenericError</code> into HTTP responses.
					</p>
				</div>
				<div class="rounded-md border border-stone-200 p-3">
					<h3 class="font-semibold text-stone-700">UI boundaries</h3>
					<p class="mt-1">
						<code class="rounded bg-stone-100 px-1 py-0.5">&lt;svelte:boundary&gt;</code> handles pending
						and failed remote calls cleanly in the UI.
					</p>
				</div>
			</div>
		</section>

		<section class="rounded-lg border border-stone-200 bg-white p-5">
			<h2 class="text-xs font-semibold tracking-wide text-stone-400 uppercase">
				6. Architecture Overview
			</h2>
			<div
				class="mt-3 overflow-x-auto rounded-md bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-600"
			>
				<pre>Client (browser)
  |
  |-- WorkOS AuthKit client -> access token
  |-- useQuery()            -> WebSocket -> Convex (authed via WorkOS JWT)
  |-- client.mutation()     -> WebSocket -> Convex (authed via WorkOS JWT)
  '-- await remote()        -> HTTP      -> SvelteKit server
                                      |
                                      |-- WorkOSService        -> WorkOS JWKS + API
                                      '-- ConvexPrivateService -> Convex (API key)

Convex functions:
  |-- authed/*  -> client-facing, protected by WorkOS JWT
  '-- private/* -> backend-only, protected by API key</pre>
			</div>
		</section>
	</main>
</div>
