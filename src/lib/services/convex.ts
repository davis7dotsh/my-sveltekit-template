import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { ConvexHttpClient } from 'convex/browser';
import { Data, Layer, ServiceMap } from 'effect';
import * as Effect from 'effect/Effect';
import { CONVEX_URL } from '../convex-env';
import {
	getFunctionName,
	type ArgsAndOptions,
	type DefaultFunctionArgs,
	type FunctionReference,
	type OptionalRestArgs
} from 'convex/server';

export class ConvexError extends Data.TaggedError('ConvexError')<{
	readonly message: string;
	readonly kind: string;
	readonly traceId: string;
	readonly timestamp: number;
	readonly operation: 'query' | 'mutation' | 'action';
	readonly functionName: string;
	readonly componentPath?: string;
	readonly cause?: unknown;
}> {}

type PrivateQueryRunner = <
	Args extends DefaultFunctionArgs,
	Result,
	ComponentPath extends string | undefined
>(data: {
	func: FunctionReference<'query', 'public', Args, Result, ComponentPath>;
	args: Omit<Args, 'apiKey'>;
}) => Effect.Effect<Result, ConvexError>;

type PrivateMutationRunner = <
	Args extends DefaultFunctionArgs,
	Result,
	ComponentPath extends string | undefined
>(data: {
	func: FunctionReference<'mutation', 'public', Args, Result, ComponentPath>;
	args: Omit<Args, 'apiKey'>;
}) => Effect.Effect<Result, ConvexError>;

type PrivateActionRunner = <
	Args extends DefaultFunctionArgs,
	Result,
	ComponentPath extends string | undefined
>(data: {
	func: FunctionReference<'action', 'public', Args, Result, ComponentPath>;
	args: Omit<Args, 'apiKey'>;
}) => Effect.Effect<Result, ConvexError>;

interface ConvexPrivate {
	query: PrivateQueryRunner;
	mutation: PrivateMutationRunner;
	action: PrivateActionRunner;
}

export class ConvexPrivateService extends ServiceMap.Service<ConvexPrivateService, ConvexPrivate>()(
	'ConvexPrivateService'
) {
	static readonly layer = Layer.sync(ConvexPrivateService, () => {
		if (!CONVEX_URL) {
			throw new Error('Missing PUBLIC_CONVEX_URL');
		}

		const convex = new ConvexHttpClient(CONVEX_URL);
		const apiKey = env.CONVEX_PRIVATE_BRIDGE_KEY;

		if (!apiKey) {
			throw new Error('Missing CONVEX_PRIVATE_BRIDGE_KEY');
		}

		const withApiKey = <Args extends DefaultFunctionArgs>(args: Omit<Args, 'apiKey'>) =>
			({ ...args, apiKey }) as unknown as Args;

		const createConvexError = <
			Type extends 'query' | 'mutation' | 'action',
			Args extends DefaultFunctionArgs,
			Result,
			ComponentPath extends string | undefined
		>({
			operation,
			func,
			error
		}: {
			operation: Type;
			func: FunctionReference<Type, 'public', Args, Result, ComponentPath>;
			error: unknown;
		}) =>
			new ConvexError({
				message: error instanceof Error ? error.message : String(error),
				kind: `convex_${operation}_error`,
				traceId: randomUUID(),
				timestamp: Date.now(),
				operation,
				functionName: getFunctionName(func),
				componentPath: func._componentPath,
				cause: error
			});

		const query: PrivateQueryRunner = ({ func, args }) =>
			Effect.tryPromise({
				try: () =>
					convex.query(func, ...([withApiKey(args)] as unknown as OptionalRestArgs<typeof func>)),
				catch: (error) => createConvexError({ operation: 'query', func, error })
			});

		const mutation: PrivateMutationRunner = ({ func, args }) =>
			Effect.tryPromise({
				try: () =>
					convex.mutation(
						func,
						...([withApiKey(args)] as unknown as ArgsAndOptions<
							typeof func,
							{ skipQueue: boolean }
						>)
					),
				catch: (error) => createConvexError({ operation: 'mutation', func, error })
			});

		const action: PrivateActionRunner = ({ func, args }) =>
			Effect.tryPromise({
				try: () =>
					convex.action(func, ...([withApiKey(args)] as unknown as OptionalRestArgs<typeof func>)),
				catch: (error) => createConvexError({ operation: 'action', func, error })
			});

		return {
			query,
			mutation,
			action
		};
	});
}
