import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { createClient, type User } from '@workos-inc/authkit-js';
import { createContext, onMount } from 'svelte';

type AuthKitClient = Awaited<ReturnType<typeof createClient>>;

class WorkOSStore {
	isLoaded = $state(false);
	client = $state<AuthKitClient | null>(null);
	currentUser = $state<User | null>(null);

	constructor() {
		onMount(() => {
			if (!browser) {
				this.isLoaded = true;
				return;
			}

			let isDisposed = false;

			void this.initialize().finally(() => {
				if (!isDisposed) {
					this.isLoaded = true;
				}
			});

			return () => {
				isDisposed = true;
				this.client?.dispose();
			};
		});
	}

	get isAuthenticated() {
		return this.currentUser !== null;
	}

	private syncUser() {
		this.currentUser = this.client?.getUser() ?? null;
	}

	private async initialize() {
		try {
			const clientId = env.PUBLIC_WORKOS_CLIENT_ID;
			const redirectUri = env.PUBLIC_WORKOS_REDIRECT_URI;

			if (!clientId || !redirectUri) {
				throw new Error('Missing WorkOS public environment variables');
			}

			const client = await createClient(clientId, {
				devMode: dev,
				redirectUri,
				onRedirectCallback: ({ user }) => {
					this.currentUser = user;
				},
				onRefresh: ({ user }) => {
					this.currentUser = user;
				},
				onRefreshFailure: () => {
					this.currentUser = null;
				}
			});

			this.client = client;
			this.syncUser();

			if (this.currentUser) {
				await this.getAccessToken();
			}
		} catch (error) {
			console.error('Error loading WorkOS AuthKit', error);
			this.currentUser = null;
		}
	}

	async signIn() {
		if (!this.client) return;
		await this.client.signIn();
	}

	async signUp() {
		if (!this.client) return;
		await this.client.signUp();
	}

	async signOut() {
		if (!this.client) return;
		await this.client.signOut({ returnTo: '/app', navigate: false });
		this.currentUser = null;
		window.location.assign('/app');
	}

	async getAccessToken() {
		if (!this.client || !this.currentUser) {
			return null;
		}

		try {
			const accessToken = await this.client.getAccessToken();
			this.syncUser();
			return accessToken;
		} catch (error) {
			console.error('Error getting WorkOS access token', error);
			this.currentUser = null;
			return null;
		}
	}
}

const [internalGetWorkOSContext, setInternalGetWorkOSContext] = createContext<WorkOSStore>();

export function getWorkOSContext() {
	const workOSContext = internalGetWorkOSContext();

	if (!workOSContext) {
		throw new Error('WorkOS context not found');
	}

	return workOSContext;
}

export function setWorkOSContext() {
	const workOSContext = new WorkOSStore();
	setInternalGetWorkOSContext(workOSContext);
	return workOSContext;
}
