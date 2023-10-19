import {
  UrlMetadata,
  fetchUrlMetadata as fetchUrlMetadata_,
} from "@mod-protocol/core";
import { NextRequest, NextResponse } from "next/server";
import { Cast, CastWithMetadata } from "../../../types/cast";

const fetchUrlMetadata = fetchUrlMetadata_("http://localhost:3001/api");

export async function GET(
  request: NextRequest,
  response: NextResponse<{ casts: Cast[] }>
) {
  try {
    // https://api.neynar.com/v2/farcaster/feed/?api_key={api_key}&fid=194&cursor=2023-07-30T18:41:59.310Z&limit=10
    const searchParams = new URLSearchParams({
      api_key: process.env.NEYNAR_API_SECRET!,
      fid: "1689",
      limit: "10",
    });
    const url = `https://api.neynar.com/v2/farcaster/feed?${searchParams.toString()}`;

    const res = await fetch(url);
    const castsRaw = await res.json();
    const casts: Cast[] = castsRaw.casts.map((cast: any) => {
      return {
        avatar_url: cast.author.pfp_url,
        display_name: cast.author.display_name,
        username: cast.author.username,
        timestamp: cast.timestamp,
        text: cast.text,
        embeds: cast.embeds,
        hash: cast.hash,
      } as Cast;
    });

    // Get metadata for each embed
    const castsWithMetadata = await Promise.all(
      casts.map(async (cast) => {
        if (cast.embeds.length === 0) return cast;
        const metadatas = (
          await Promise.all(
            cast.embeds.map(async (embed) => {
              if (!embed.url) return null;
              console.log("fetching metadata for", embed.url);
              const metadata = await fetchUrlMetadata(embed.url);
              return { url: embed.url, metadata };
            })
          )
        ).filter((metadata) => metadata !== null) as {
          url: string;
          metadata: UrlMetadata;
        }[];
        const castWithMetadata: CastWithMetadata = {
          ...cast,
          embeds: metadatas,
        };
        return castWithMetadata;
      })
    );

    return NextResponse.json({ casts: castsWithMetadata });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
}
