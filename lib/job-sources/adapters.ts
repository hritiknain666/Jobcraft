import type { NormalizedJob } from "./types";

export type JobSourceAdapter<T> = (payload: T) => NormalizedJob[];
