import { ConvexPrivateService } from '$lib/services/convex';
import { Effect } from 'effect';
import { api } from '../../convex/_generated/api';
import { query } from '$app/server';
import { WorkOSService } from '$lib/services/workos';
import { effectRunner } from '$lib/runtime';

const demoRemote = Effect.gen(function* () {
	const convex = yield* ConvexPrivateService;

	const res = yield* convex.query({
		func: api.private.demo.privateDemoQuery,
		args: {
			username: 'hello there'
		}
	});

	return res;
});

export const remoteDemoQuery = query(async () => {
	const res = await effectRunner(demoRemote);

	return res;
});

const demoAuthed = (accessToken: string | null | undefined) =>
	Effect.gen(function* () {
		const workos = yield* WorkOSService;

		const user = yield* workos.validateAccessToken(accessToken);

		return user;
	});

export const remoteAuthedDemoQuery = query('unchecked', async (accessToken: string | null) => {
	const res = await effectRunner(demoAuthed(accessToken));

	return {
		user: {
			id: res.id,
			email: res.email
		}
	};
});
