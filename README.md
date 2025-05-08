# IounAI - TTRPG Campaign and Sessoin Management

An app that uses Generative AI to help TTRPG players and GMs manage their campaigns and record progress across sessions via audio transcription. All campaign and session info can be summariezed and stored. An interactive chat can be used to ask questions about the campaign and get answers based on the stored information. The app can be used by players and GMs alike to enhance their TTRPG experience.

Northstar ideas: The app can also generate new content based on the campaign and session info, such as off session chat interactions with NPCs that can be recorded and reviewed by GM and committed to canon if approved. The app will integrate with micro-publishing to create book form stories across sessions to allow printing or publishing.

## Setup list

- [x] Create a new TanStack Start app (Tamstack Router, Tanstack Query)
  - [x] Plan and set up basic static and dynamic routes
- [x] Set up HeroUI as a component library (great accessibility)
  - [x] Set up Tailwind CSS for styling, as required by HeroUI
- [x] Add auth and user managment via Clerk
- [x] Add Convex for data storage and management
  - [x] Integrate Convex with Tanstack Query for caching
  - [x] Integrate Convex and Clerk for auth in data storage

## Feature list

- [x] Set up basic static and dynamic routes
  - [x] Home page - public landing page
  - [x] Campaigns/campaign details
  - [x] Sessions/session details
  - [ ] Recordings and transcriptions
- [x] Sign in and sign up flow
  - [x] Figure out custom form integration with Clerk
  - [x] Don't use prebuilt Clerk components
  - [ ] User profile page
- [x] Secure routes that require auth
- [x] Set up Convex schema for data tables
  - [x] campaigns, sessions, recordings, transcriptions tables
  - [x] Set up Convex functions for crud for all tables
  - [x] Figure out Convex file storage for audio files
  - [x] Figure out best practice for data loading and securing data enpoints
- [x] Install Google GenAI SDK
  - [x] Set up Google GenAI API key and auth
  - [x] Set up Convex actions for calling GenAI apis
  - [x] Integrate GenAI into app for recording transcription and save to Convex in chunks by diarization
  - [x] Figure out how to add text embeddings to transcription chunks
  - [x] Maybe process audio files into transcriptions, summaries, and embeddings after audio is uploaded
    - [ ] Maybe trigger with interaction, chron job, or webhook, whatever is best to reduce GenAI costs

## Refinement list

- [ ] Revise layouts to remove left nav and add breadcrumbs
  - [ ] Use Tanstack Router breadcrumbs
  - [ ] Use HeroUI breadcrumbs
- [ ] Use file storage service other than Convex.
  - [ ] Convex bandwidth limits are too low for loading audio files in UI
  - [ ] Maybe use Firestore Storage or UploadThing
- [ ] Remove clerk url from user ids, and use raw clerk user id in members and attendee tables
- [ ] Refactor all AI calls to use Vercel AI SDK.
  - [ ] Replace Gemini transcription with dedicated transcription model like Assembly AI
    - [x] Problems with Gemini timestamps is the biggest obstacle
- [ ] Figure out a better way to check if user is logged in, current implementation is adds latency to all route loads
- [ ] Refine vscode copilot to include lib specific custom instructions and best practices for:
  - [ ] Convex
  - [ ] Clerk
  - [ ] Tanstack Query
  - [ ] Tanstack Router
  - [ ] HeroUI
  - [ ] Tailwind CSS

<br />
<br />
<br />
<br />
<br />
<br />

---

Welcome to your new TanStack app!

# Getting Started

To run this application:

```bash
pnpm install
pnpm start
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

## Setting up Convex

- Set the `VITE_CONVEX_URL` and `CONVEX_DEPLOYMENT` environment variables in your `.env.local`. (Or run `npx convex init` to set them automatically.)
- Run `npx convex dev` to start the Convex server.

## Setting up Netlify

First install the Netlify CLI with:

```bash
npm install -g netlify-cli`
```

```bash
netlify init
```

## T3Env

- You can use T3Env to add type safety to your environment variables.
- Add Environment variables to the `src/env.mjs` file.
- Use the environment variables in your code.

### Usage

```ts
import { env } from '@/env'

console.log(env.VITE_APP_TITLE)
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router'
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/people',
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json() as Promise<{
      results: {
        name: string
      }[]
    }>
  },
  component: () => {
    const data = peopleRoute.useLoaderData()
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    )
  },
})
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ...

const queryClient = new QueryClient()

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
})
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from '@tanstack/react-query'

import './App.css'

function App() {
  const { data } = useQuery({
    queryKey: ['people'],
    queryFn: () =>
      fetch('https://swapi.dev/api/people')
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  })

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
pnpm add @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

function App() {
  const count = useStore(countStore)
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  )
}

export default App
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store, Derived } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
})
doubledStore.mount()

function App() {
  const count = useStore(countStore)
  const doubledCount = useStore(doubledStore)

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  )
}

export default App
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
