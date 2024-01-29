import { NextRequest, NextResponse } from "next/server";
import { Cast, CastWithMetadata } from "../../../types/cast";

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
      api_key: process.env.NEYNAR_API_KEY!,
      limit: "10",
      cursor: cursor || "",
      parent_url: parentUrl || "",
      fid: fid || "",
    });
    const url = `https://api.neynar.com/v2/farcaster/feed?${neynarSearchParams.toString()}`;

    const res = await fetch(url);
    const resJson = await res.json();
    const casts: Cast[] = resJson.casts.map((cast: any) => {
      return {
        fid: cast.author.fid,
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

    const castEmbedMetadataRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/cast-embeds-metadata`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(casts.map((cast) => cast.hash)),
      }
    );

    const castEmbedMetadata = await castEmbedMetadataRes.json();

    // Get metadata for each embed
    const castsWithMetadata = casts.map((cast) => {
      if (cast.embeds.length === 0) return cast;
      const metadatas = castEmbedMetadata[cast.hash] || [];
      const castWithMetadata: CastWithMetadata = {
        ...cast,
        resolvedEmbeds: metadatas,
      };
      return castWithMetadata;
    });

    return NextResponse.json({
      casts: castsWithMetadata,
      cursor: resJson.next.cursor,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
}
