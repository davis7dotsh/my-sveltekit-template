<script lang="ts">
	import { resolve } from '$app/paths';
	import { getWorkOSContext } from '$lib/stores/workos.svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';

	const workOSContext = getWorkOSContext();
	const client = useConvexClient();

	const conferencesQuery = useQuery(api.authed.conferences.list, {});

	let showForm = $state(false);
	let editingId = $state<Id<'conferences'> | null>(null);

	let name = $state('');
	let location = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let description = $state('');

	function resetForm() {
		name = '';
		location = '';
		startDate = '';
		endDate = '';
		description = '';
		editingId = null;
		showForm = false;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const start = new Date(startDate).getTime();
		const end = new Date(endDate).getTime();

		if (editingId) {
			await client.mutation(api.authed.conferences.update, {
				id: editingId,
				name,
				location,
				startDate: start,
				endDate: end,
				description: description || undefined
			});
		} else {
			await client.mutation(api.authed.conferences.create, {
				name,
				location,
				startDate: start,
				endDate: end,
				description: description || undefined
			});
		}

		resetForm();
	}

	function startEdit(conf: NonNullable<typeof conferencesQuery.data>[number]) {
		editingId = conf._id;
		name = conf.name;
		location = conf.location;
		startDate = new Date(conf.startDate).toISOString().split('T')[0];
		endDate = new Date(conf.endDate).toISOString().split('T')[0];
		description = conf.description ?? '';
		showForm = true;
	}

	async function handleDelete(id: Id<'conferences'>) {
		await client.mutation(api.authed.conferences.remove, { id });
	}

	function formatDate(ts: number) {
		return new Date(ts).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function conferenceStatus(start: number, end: number) {
		const now = Date.now();
		if (now < start) return 'upcoming';
		if (now > end) return 'past';
		return 'active';
	}
</script>

{#if !workOSContext.isAuthenticated}
	<div class="flex min-h-screen items-center justify-center bg-stone-50 px-6">
		<div class="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
			<p class="text-xs font-semibold tracking-[0.2em] text-stone-400 uppercase">
				Conference Tracker
			</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight text-stone-900">Sign in with WorkOS</h1>
			<p class="mt-3 text-sm leading-6 text-stone-500">
				Use AuthKit to access the Convex-backed conference dashboard.
			</p>
			<div class="mt-6 flex flex-col gap-3">
				<button
					onclick={() => workOSContext.signIn()}
					class="rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
				>
					Sign in
				</button>
				<button
					onclick={() => workOSContext.signUp()}
					class="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
				>
					Create account
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-stone-50 font-sans text-stone-900">
		<header class="border-b border-stone-200 bg-white">
			<div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
				<div>
					<h1 class="text-lg font-semibold tracking-tight">Conferences</h1>
					<p class="text-sm text-stone-500">{workOSContext.currentUser?.email}</p>
				</div>
				<div class="flex items-center gap-3">
					<a
						href={resolve('/app/references')}
						class="rounded-md px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
					>
						References
					</a>
					<button
						onclick={() => {
							resetForm();
							showForm = !showForm;
						}}
						class="rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
					>
						{showForm ? 'Cancel' : '+ New'}
					</button>
					<button
						onclick={() => workOSContext.signOut()}
						class="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
					>
						Sign out
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-3xl px-6 py-8">
			{#if showForm}
				<form onsubmit={handleSubmit} class="mb-8 rounded-lg border border-stone-200 bg-white p-5">
					<h2 class="mb-4 text-sm font-semibold tracking-wide text-stone-500 uppercase">
						{editingId ? 'Edit Conference' : 'New Conference'}
					</h2>

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<label for="name" class="mb-1 block text-sm font-medium text-stone-700">Name</label>
							<input
								id="name"
								bind:value={name}
								required
								class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
								placeholder="React Conf 2026"
							/>
						</div>
						<div class="sm:col-span-2">
							<label for="location" class="mb-1 block text-sm font-medium text-stone-700"
								>Location</label
							>
							<input
								id="location"
								bind:value={location}
								required
								class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
								placeholder="San Francisco, CA"
							/>
						</div>
						<div>
							<label for="startDate" class="mb-1 block text-sm font-medium text-stone-700"
								>Start Date</label
							>
							<input
								id="startDate"
								type="date"
								bind:value={startDate}
								required
								class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
							/>
						</div>
						<div>
							<label for="endDate" class="mb-1 block text-sm font-medium text-stone-700"
								>End Date</label
							>
							<input
								id="endDate"
								type="date"
								bind:value={endDate}
								required
								class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
							/>
						</div>
						<div class="sm:col-span-2">
							<label for="description" class="mb-1 block text-sm font-medium text-stone-700"
								>Description <span class="text-stone-400">(optional)</span></label
							>
							<textarea
								id="description"
								bind:value={description}
								rows={2}
								class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm transition-colors focus:border-stone-500 focus:outline-none"
								placeholder="Brief description..."
							></textarea>
						</div>
					</div>

					<div class="mt-4 flex justify-end gap-2">
						<button
							type="button"
							onclick={resetForm}
							class="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-stone-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
						>
							{editingId ? 'Update' : 'Add'}
						</button>
					</div>
				</form>
			{/if}

			{#if !conferencesQuery.data}
				<p class="text-sm text-stone-400">Loading...</p>
			{:else if conferencesQuery.data.length === 0}
				<div class="py-20 text-center">
					<p class="text-stone-400">No conferences yet.</p>
					<button
						onclick={() => (showForm = true)}
						class="mt-2 text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900"
					>
						Add your first one
					</button>
				</div>
			{:else}
				<ul class="space-y-3">
					{#each conferencesQuery.data as conf (conf._id)}
						{@const status = conferenceStatus(conf.startDate, conf.endDate)}
						<li
							class="group rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-sm"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<h3 class="truncate text-sm font-semibold">{conf.name}</h3>
										<span
											class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium {status ===
											'active'
												? 'bg-emerald-100 text-emerald-700'
												: status === 'upcoming'
													? 'bg-blue-100 text-blue-700'
													: 'bg-stone-100 text-stone-500'}"
										>
											{status}
										</span>
									</div>
									<p class="mt-1 text-sm text-stone-500">
										{conf.location} &middot; {formatDate(conf.startDate)} &ndash; {formatDate(
											conf.endDate
										)}
									</p>
									{#if conf.description}
										<p class="mt-1.5 text-sm text-stone-400">{conf.description}</p>
									{/if}
								</div>
								<div
									class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<button
										onclick={() => startEdit(conf)}
										class="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
										aria-label="Edit {conf.name}"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
											<path d="m15 5 4 4" />
										</svg>
									</button>
									<button
										onclick={() => handleDelete(conf._id)}
										class="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
										aria-label="Delete {conf.name}"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M3 6h18" />
											<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
											<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
										</svg>
									</button>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</main>
	</div>
{/if}
