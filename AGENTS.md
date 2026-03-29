Project guidelines:

- use bun for the package manager
- when installing new packages, use `bun add` instead of manually editing the package.json file
- use modern svelte and sveltekit patterns and primitives
- avoid `as any` at all costs, try to infer types from functions as much as possible
- when defining convex actions, queries, and mutations that are exposed to the client use the `authed` setup in `src/convex/authed`
- when defining convex actions, queries, and mutations that are called from the backend use the `private` setup in `src/convex/private`
- use effect v4 for all backend code
- use the convex service for calling convex queries, actions, and mutations from the backend
- use tailwindcss for styling whenever possible, only resort to custom css if needed
- every svelte component should have `lang="ts"`
- after making changes to convex, run `bun run convex:gen` to generate the new api
- run `bun run lint` to check for linting errors, `bun run format`, and `bun run check` to check for errors after making changes
- be concise with all of your answers.
