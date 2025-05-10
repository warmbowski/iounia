/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as constants from "../constants.js";
import type * as functions_assemblyai from "../functions/assemblyai.js";
import type * as functions_campaigns from "../functions/campaigns.js";
import type * as functions_recordings from "../functions/recordings.js";
import type * as functions_sessions from "../functions/sessions.js";
import type * as functions_transcripts from "../functions/transcripts.js";
import type * as http from "../http.js";
import type * as utililties from "../utililties.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  constants: typeof constants;
  "functions/assemblyai": typeof functions_assemblyai;
  "functions/campaigns": typeof functions_campaigns;
  "functions/recordings": typeof functions_recordings;
  "functions/sessions": typeof functions_sessions;
  "functions/transcripts": typeof functions_transcripts;
  http: typeof http;
  utililties: typeof utililties;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
