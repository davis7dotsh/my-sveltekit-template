import { env } from '$env/dynamic/private';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Data, Effect, Layer, ServiceMap } from 'effect';
import { WorkOS, type User } from '@workos-inc/node';

const getWorkOSConfig = () => {
	const workosClientId = env.WORKOS_CLIENT_ID;
	const workosApiKey = env.WORKOS_API_KEY;

	if (!workosClientId || !workosApiKey) {
		throw new Error('Missing WorkOS server environment variables');
	}

	const workos = new WorkOS({
		apiKey: workosApiKey,
		clientId: workosClientId
	});

	return {
		workos,
		workosClientId,
		jwks: createRemoteJWKSet(new URL(workos.userManagement.getJwksUrl(workosClientId)))
	};
};

export class WorkOSError extends Data.TaggedError('WorkOSError')<{
	readonly message: string;
	readonly kind: string;
	readonly traceId: string;
	readonly timestamp: number;
	readonly cause?: unknown;
}> {}

interface WorkOSDef {
	validateAccessToken: (accessToken: string | null | undefined) => Effect.Effect<User, WorkOSError>;
}

export class WorkOSService extends ServiceMap.Service<WorkOSService, WorkOSDef>()('WorkOSService') {
	static readonly layer = Layer.succeed(WorkOSService, {
		validateAccessToken: (accessToken) =>
			Effect.gen(function* () {
				const { jwks, workos, workosClientId } = getWorkOSConfig();

				if (!accessToken) {
					return yield* Effect.fail(
						new WorkOSError({
							message: 'Unauthorized',
							kind: 'AuthenticationError',
							traceId: crypto.randomUUID(),
							timestamp: Date.now(),
							cause: new Error('Missing access token')
						})
					);
				}

				const verification = yield* Effect.tryPromise({
					try: () =>
						jwtVerify(accessToken, jwks, {
							algorithms: ['RS256'],
							issuer: [
								'https://api.workos.com/',
								`https://api.workos.com/user_management/${workosClientId}`
							]
						}),
					catch: (error) =>
						new WorkOSError({
							message: 'Unauthorized',
							kind: 'AuthenticationError',
							traceId: crypto.randomUUID(),
							timestamp: Date.now(),
							cause: error
						})
				});

				const userId = verification.payload.sub;

				if (!userId) {
					return yield* Effect.fail(
						new WorkOSError({
							message: 'Unauthorized',
							kind: 'AuthenticationError',
							traceId: crypto.randomUUID(),
							timestamp: Date.now(),
							cause: new Error('Missing subject claim')
						})
					);
				}

				return yield* Effect.tryPromise({
					try: () => workos.userManagement.getUser(userId),
					catch: (error) =>
						new WorkOSError({
							message: error instanceof Error ? error.message : 'Unknown error',
							kind: 'AuthenticationError',
							traceId: crypto.randomUUID(),
							timestamp: Date.now(),
							cause: error
						})
				});
			})
	});
}
