"use client";

import { UrlMetadata } from "@mod-protocol/core";
import {
  contentMiniApps,
  defaultContentMiniApp,
} from "@mod-protocol/miniapp-registry";
import { RenderEmbed } from "@mod-protocol/react";
import { renderers } from "@mod-protocol/react-ui-shadcn/dist/renderers";
import useSWR from "swr";
import { CastWithMetadata } from "../types/cast";

export function CastFeed({ url }: { url: string }) {
  const { data, isValidating } = useSWR<CastWithMetadata[]>(
    url,
    (url: string) => fetch(url).then(async (res) => (await res.json()).casts)
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map((cast) => (
        <div key={cast.hash}>
          <div>{cast.username}</div>
          <div>{cast.text}</div>
          <div>
            {cast.embeds.map(
              (embed: { url: string; metadata: UrlMetadata }, i) => (
                <div key={i}>
                  <RenderEmbed
                    embed={{
                      cast_id: cast.hash,
                      status: "loaded",
                      url: embed.url,
                      metadata: embed.metadata,
                    }}
                    renderers={renderers}
                    defaultContentMiniApp={defaultContentMiniApp}
                    contentMiniApps={contentMiniApps}
                  />
                  {JSON.stringify(embed)}
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
