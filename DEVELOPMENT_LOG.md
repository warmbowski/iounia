# Development Log for IounAI Project

This document tracks progress made on the IounAI TTRPG Campaign and Session Management application.

## Initial Setup

- ✅ Created a new TanStack Start app with TanStack Router and TanStack Query
- ✅ Set up HeroUI as the component library for better accessibility
  - ✅ Integrated HeroUI Link component with TanStack Router Link component
- ✅ Configured Tailwind CSS for styling, as required by HeroUI
- ✅ Added authentication and user management via Clerk
  - ✅ Implemented custom form integration with Clerk
  - ✅ Avoided using prebuilt Clerk components
- ✅ Integrated Convex for data storage and management
  - ✅ Set up integration between Convex and TanStack Query for caching
  - ✅ Integrated Convex with Clerk for authenticated data storage

## Routing & Navigation

- ✅ Planned and set up basic static and dynamic routes
- ✅ Implemented secure routes that require authentication
- ✅ Created public landing page
- ✅ Added breadcrumbs to improve navigation
  - ✅ Created breadcrumb generation in TanStack Router loaderData
  - ✅ Used useMatch to compile breadcrumbs
  - ✅ Implemented HeroUI for displaying breadcrumbs
- ✅ Removed left navigation in favor of improved navigation structure
- ✅ Fixed authentication flow in routing
  - ✅ Implemented token-based auth context in route loader
  - ✅ Created JWT parsing utility for extracting user data from tokens

## SSR & Hydration Mismatch Errors

- ✅ Fixed auth issues during SSR because of 2 issues with @convex-dev/react-query package
  - ✅ [New ConvexHttpClient instance wipes out auth token](https://github.com/get-convex/convex-react-query/issues/15)
  - ✅ [Deprecated ConvexHttpClient.consistentQuery method throws errors](https://github.com/get-convex/convex-react-query/issues/16)
  - ✅ Fixed by convex team (see issues for details)
- ✅ Fixed Tailwind CSS hydration issues by removing problematic Vite plugin
  - ✅ Maintained Tailwind CSS support through PostCSS config
- ✅ Fixed hydration errors with react-codemirror by lazy loading the component
- ✅ Fixed hydration errors with react-remark by lazy loading the component
- ✅ Fixed hydration errors on formatted dates due to timezone differences between server and client

## Data Management

- ✅ Originally set up Firebase for data and file management
  - ✅ Migrated to Convex for for better DX with schema, typing, and transactional functions
  - ✅ Also because Firebase's security rules were complex, and a huge risk of making a mistake and getting unpredictable bill.
  - ✅ Convex's server side approach seemed much more secure compared to Firebase's client side approach
- ✅ Set up Convex schema for data tables
  - ✅ Created tables for campaigns, sessions, recordings, and transcriptions
  - ✅ Implemented Convex functions for CRUD operations on all tables
- ✅ Set up invite system for users to join campaigns
- ✅ Added PoC caching mechanism for Convex query function data
  - ✅ Used TanStack Query's PersistedQueryClient to cache large transcripts in IndexedDB

## File Storage

- ✅ Initially investigated Convex file storage for audio files
- ✅ Migrated from Convex to Cloudflare R2 for file storage due to serving audio files leading to big egress bandwidth (free on R2)

## AI Integration

- ✅ Installed Google GenAI SDK
  - ✅ Set up Google GenAI API key and authentication
  - ✅ Implemented Convex actions for calling GenAI APIs
- ✅ Integrated GenAI for recording transcription
  - ✅ Added functionality to save transcriptions to Convex in chunks by diarization
  - ✅ Added text embeddings to transcription chunks
  - ✅ Added vector search of transcription chunks
    - ✅ Refactored to expand search results to include more chunks around the vector search results for better context
- ✅ Refactored AI calls to use Vercel AI SDK
  - ✅ Replaced Gemini transcription with dedicated Assembly AI model to solve timestamp issues

## UI Components

- ✅ Created campaign and session detail pages
- ✅ Implemented recordings and transcriptions UI
- ✅ Built chat window for AI interactions
- ✅ Developed components for managing campaigns, sessions, and recordings
- ✅ Improved TopNav component
  - ✅ Added user profile button with authentication state
  - ✅ Fixed login/signup flow and button states
  - ✅ Implemented proper user data display from JWT and Clerk
- ✅ Implemented markdown input component with react-codemirror package
  - ✅ needed to lazy load react-codemirror to avoid hydration errors
- ✅ rendering markdown react-remark package
  - ✅ Styled similar to HeroUI inputs using tailwind @apply directive

## Dependencies & Performance

- ✅ Updated critical dependencies
  - ✅ Upgraded Convex from 1.24.6 to 1.24.8
  - ✅ Upgraded Vite from 6.1.0 to 6.3.5

## Optimizations & Refinements

- ✅ Refined VSCode Copilot to include library-specific instructions for Convex
- ✅ Worked on improved method to check if users are logged in to reduce route load latency
- ✅ Removed Clerk URL from user IDs and use raw Clerk user ID in members and attendee tables
- ✅ tanstack-router set to preload on link hover, added manual preloading to non links that navigate (cards)

## Future Investigation

- Stream audio from R2 using Range requests
- Considering Backblaze Media Storage/Streaming for improved media handling
- Investigating solutions for transcription model optimization
- Problematic jwt session tokens when dev app left open for a long time
  - JWT `aud="convex"` claim is missing from token
  - may only affect development environment

## Work List

### AI Features

- [ ] Reimplement AI chat window for campaign and session Q&A
  - [ ] Implement with AI Chat component from Convex
  - [ ] Per user chat history
  - [ ] Chat topics and conversation management
- [ ] Implement Chat with NPCs
  - [ ] DM Assigns users to interact with specific NPCs
  - [ ] DM can view and manage NPC conversations and commit conversations to lore

### Campaign Management

- [ ] Editing campaign details
- [ ] Uploading campaign lore documents in various formats, such as PDF, text, etc.
- [ ] Add character lists to campaigns,
  - [ ] Allow users to add/edit their characters
- [ ] AI adds or suggests to add characters from new transcripts
- [ ] Feed character entities to AI for better context in transcriptions

### Session Management

### Recording/Transcript Management

- [x] Implement recording deletion and cascading deletion of transcriptions
- [x] Add transcript follow/unfollow when playing recording

### User Profile Management

- [ ] Implement user profile management
  - [ ] Allow users to update their profile information
  - [ ] Add user avatar support

### Other Stuff

- [x] set up prod deployment on Netlify
  - [x] Set up Convex production environment
    - [x] Migrate dev database to prod
  - [ ] Set up Clerk production environment
    - [ ] Migrate users from dev to prod
  - [ ] Set up Cloudflare R2 development bucket
- [x] Add application favicons
- [ ] Implement pagination for recordings and transcriptions list functions
- [ ] Move to Turborepo monorepo and move many UI components to package
  - [x] ~~Fork `@convex-dev/react-query` into monorepo package to fix issues and add pagination support~~

---
