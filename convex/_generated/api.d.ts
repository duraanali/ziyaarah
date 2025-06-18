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
import type * as checkpoints from "../checkpoints.js";
import type * as config from "../config.js";
import type * as packing from "../packing.js";
import type * as ritualSteps from "../ritualSteps.js";
import type * as rituals from "../rituals.js";
import type * as tripStages from "../tripStages.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  checkpoints: typeof checkpoints;
  config: typeof config;
  packing: typeof packing;
  ritualSteps: typeof ritualSteps;
  rituals: typeof rituals;
  tripStages: typeof tripStages;
  trips: typeof trips;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
