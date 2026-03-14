// "private" queries/mutations/actions are ones that get called from the sveltekit backend, not the client
// they're all protected by the CONVEX_API_KEY

import { v } from 'convex/values';
import {
	customAction,
	customCtxAndArgs,
	customMutation,
	customQuery
} from 'convex-helpers/server/customFunctions';
import { action, mutation, query } from '../_generated/server';

const apiKeyGuard = customCtxAndArgs({
	args: { apiKey: v.string() },
	input: async (ctx, { apiKey }) => {
		if (apiKey !== process.env.CONVEX_API_KEY) {
			throw new Error('Invalid API key');
		}
		return { ctx, args: {} };
	}
});

export const privateQuery = customQuery(query, apiKeyGuard);
export const privateMutation = customMutation(mutation, apiKeyGuard);
export const privateAction = customAction(action, apiKeyGuard);
