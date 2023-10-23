"use client";

import useSWRInfinite from "swr/infinite";
import { CastWithMetadata } from "../types/cast";
import { Cast } from "./cast";
import { LoadMoreSentinel } from "./load-more";

type CastFeedParams =
  | { fid: string; parentUrl?: string }
  | { fid?: string; parentUrl: string };

export function CastFeed({ fid, parentUrl }: CastFeedParams) {
  const {
    data: pages,
    size,
    setSize,
    isValidating: loading,
    error,
  } = useSWRInfinite<{ casts: CastWithMetadata[]; cursor: string }>(
    (pageIndex, prevPage) => {
      let baseUrl = `/api/casts?fid=${fid}&parentUrl=${parentUrl}`;
      console.log({ pageIndex, prevPage });
      if (!prevPage) {
        return baseUrl;
      }

      baseUrl = `${baseUrl}&cursor=${prevPage!.cursor}`;

      if (prevPage.casts.length === 0) return null;

      return baseUrl;
    },
    (url: string) =>
      fetch(url).then(async (res) => {
        const { casts, cursor } = await res.json();
        return { casts, cursor };
      }),
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );
  const hasMore = !!pages?.[size - 1]?.casts.length;

  if (!pages) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-3">
      {pages.map((page) =>
        page.casts.map((cast) => (
          <div key={cast.hash}>
            <Cast cast={cast} />
          </div>
        ))
      )}
      {hasMore && (
        <LoadMoreSentinel
          loadMore={() => {
            setSize(size + 1);
          }}
          isLoading={loading}
        ></LoadMoreSentinel>
      )}
      {loading ? (
        <div className="w-full text-center">Loading...</div>
      ) : (
        !pages && <div>Something went wrong</div>
      )}
    </div>
  );
}
