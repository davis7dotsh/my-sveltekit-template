import { authedQuery } from './helpers';

export const authedDemoQuery = authedQuery({
	args: {},
	handler: async (ctx) => {
		const message = `Hello, ${ctx.identity.email}!`;
		return { message };
	}
});
