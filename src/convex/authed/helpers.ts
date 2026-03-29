// "authed" queries/mutations/actions are ones that get called from the client, protected by the WorkOS auth token

import { customAction, customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import { action, mutation, query } from '../_generated/server';

export const authedQuery = customQuery(query, {
	args: {},
	input: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new Error('Unauthorized');
		}

		return { ctx: { ...ctx, identity }, args: {} };
	}
});

export const authedMutation = customMutation(mutation, {
	args: {},
	input: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new Error('Unauthorized');
		}

		return { ctx: { ...ctx, identity }, args: {} };
	}
});

export const authedAction = customAction(action, {
	args: {},
	input: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new Error('Unauthorized');
		}

		return { ctx: { ...ctx, identity }, args: {} };
	}
});
