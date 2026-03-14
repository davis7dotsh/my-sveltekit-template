import { Clerk } from '@clerk/clerk-js';
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import { createContext, onMount } from 'svelte';
import { ui } from '@clerk/ui';

type EmittedOrganization = NonNullable<
	Parameters<Parameters<Clerk['addListener']>[0]>[0]['organization']
>;
type EmittedUser = NonNullable<Parameters<Parameters<Clerk['addListener']>[0]>[0]['user']>;
type EmittedSession = NonNullable<Parameters<Parameters<Clerk['addListener']>[0]>[0]['session']>;

class ClerkStore {
	isClerkLoaded = $state(false);
	clerk = new Clerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
	currentOrganization = $state<EmittedOrganization | null>(null);
	currentSession = $state<EmittedSession | null>(null);
	currentUser = $state<EmittedUser | null>(null);

	constructor() {
		$effect(() => {
			const cleanup = this.clerk.addListener((emission) => {
				if (emission.organization) {
					this.currentOrganization = emission.organization;
				} else {
					this.currentOrganization = null;
				}

				if (emission.session) {
					this.currentSession = emission.session;
				} else {
					this.currentSession = null;
				}

				if (emission.user) {
					this.currentUser = emission.user;
				} else {
					this.currentUser = null;
				}
			});

			return () => {
				cleanup();
			};
		});

		onMount(async () => {
			try {
				await this.clerk.load({
					ui,
					afterSignOutUrl: '/app',
					signInForceRedirectUrl: '/app',
					signUpForceRedirectUrl: '/app'
				});
				this.isClerkLoaded = true;
			} catch (error) {
				console.error('Error loading Clerk', error);
			} finally {
				this.isClerkLoaded = true;
			}
		});
	}
}

const [internalGetClerkContext, setInternalGetClerkContext] = createContext<ClerkStore>();

export function getClerkContext() {
	const clerkContext = internalGetClerkContext();

	if (!clerkContext) {
		throw new Error('Clerk context not found');
	}

	return clerkContext;
}

export function setClerkContext() {
	const clerkContext = new ClerkStore();
	setInternalGetClerkContext(clerkContext);
	return clerkContext;
}
