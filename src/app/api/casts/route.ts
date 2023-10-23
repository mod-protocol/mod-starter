import {
  UrlMetadata,
  fetchUrlMetadata as fetchUrlMetadata_,
} from "@mod-protocol/core";
import { NextRequest, NextResponse } from "next/server";
import { Cast, CastWithMetadata } from "../../../types/cast";

const fetchUrlMetadata = fetchUrlMetadata_(process.env.NEXT_PUBLIC_API_URL!);

export async function GET(
  request: NextRequest,
  response: NextResponse<{ casts: Cast[]; cursor: string }>
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const parentUrl = searchParams.get("parent_url");
    const fid = searchParams.get("fid");

    if (!parentUrl && !fid) {
      throw new Error("Must provide either parent_url or fid");
    }

    // https://api.neynar.com/v2/farcaster/feed/?api_key={api_key}&fid=194&cursor=2023-07-30T18:41:59.310Z&limit=10
    const neynarSearchParams = new URLSearchParams({
      api_key: process.env.NEYNAR_API_SECRET!,
      limit: "10",
      cursor: cursor || "",
      parent_url: parentUrl || "",
      fid: fid || "",
    });
    const url = `https://api.neynar.com/v2/farcaster/feed?${neynarSearchParams.toString()}`;

    console.log(url);

    const res = await fetch(url);
    const resJson = await res.json();
    const casts: Cast[] = resJson.casts.map((cast: any) => {
      return {
        avatar_url: cast.author.pfp_url,
        display_name: cast.author.display_name,
        username: cast.author.username,
        timestamp: cast.timestamp,
        text: cast.text,
        embeds: cast.embeds,
        hash: cast.hash,
        reactions: cast.reactions,
        repliesCount: cast.replies.count,
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
          resolvedEmbeds: metadatas,
        };
        return castWithMetadata;
      })
    );

    return NextResponse.json({
      casts: castsWithMetadata,
      cursor: resJson.next.cursor,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
}
