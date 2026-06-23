import { bootstrapAuth } from '@/lib/api/bootstrap';

// Cached at module level — never reset.
// Ensures bootstrapAuth() fires exactly once per page load even when
// React StrictMode double-invokes effects in development.
// (Double-invoke → same promise returned → one HTTP request, no reuse-detection revoke.)
let bootstrapPromise: Promise<boolean> | null = null;

export function runBootstrapOnce(): Promise<boolean> {
  if (!bootstrapPromise) bootstrapPromise = bootstrapAuth();
  return bootstrapPromise;
}
