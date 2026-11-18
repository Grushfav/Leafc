"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fetchAndCache, readCmsCache } from "@/lib/cms/cache";

/**
 * loading  - nothing to show yet (hold the page, do not show built-in copy)
 * ready    - data is available (from cache and/or network)
 * failed   - the request failed and there is no cached data
 * timeout  - the API is slow; fall back to built-in copy but keep waiting
 */
export type CmsResourceStatus = "loading" | "ready" | "failed" | "timeout";

export const CMS_HOLD_TIMEOUT_MS = 3000;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useCmsResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: { cache?: boolean; timeoutMs?: number } = {},
): { data: T | undefined; status: CmsResourceStatus } {
  const { cache = true, timeoutMs = CMS_HOLD_TIMEOUT_MS } = options;
  const [state, setState] = useState<{
    key: string | null;
    data: T | undefined;
    status: CmsResourceStatus;
  }>({ key: null, data: undefined, status: "loading" });

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // Paint cached data before the browser paints, so repeat visits never flash.
  useIsomorphicLayoutEffect(() => {
    if (key == null || !cache) return;
    const cached = readCmsCache<T>(key);
    if (cached.hit) {
      setState({ key, data: cached.value, status: "ready" });
    }
  }, [key, cache]);

  useEffect(() => {
    if (key == null) return;
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setState((current) =>
        current.key === key && current.status === "ready"
          ? current
          : { key, data: undefined, status: "timeout" },
      );
    }, timeoutMs);

    fetchAndCache(key, () => fetcherRef.current(), { cache })
      .then((value) => {
        if (cancelled) return;
        setState((current) => {
          if (
            current.key === key &&
            current.status === "ready" &&
            JSON.stringify(current.data) === JSON.stringify(value)
          ) {
            return current;
          }
          return { key, data: value, status: "ready" };
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState((current) =>
          current.key === key && current.status === "ready"
            ? current
            : { key, data: undefined, status: "failed" },
        );
      })
      .finally(() => window.clearTimeout(timer));

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key, cache, timeoutMs]);

  // Ignore state that belongs to a previous key (e.g. navigating between pages).
  if (state.key !== key) {
    return { data: undefined, status: "loading" };
  }
  return { data: state.data, status: state.status };
}
