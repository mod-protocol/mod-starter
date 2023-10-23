import { useRelativeDate } from "../lib/relative-date";
import React, { useMemo } from "react";
import {
  CommentIcon,
  HeartIcon,
  ShareIcon,
  SyncIcon,
  BookmarkIcon,
} from "@primer/octicons-react";
import {
  StructuredCastImageUrl,
  StructuredCastMention,
  StructuredCastNewline,
  StructuredCastPlaintext,
  StructuredCastTextcut,
  StructuredCastUnit,
  StructuredCastUrl,
  StructuredCastVideo,
  convertCastPlainTextToStructured,
} from "@mod-protocol/farcaster";
import { Embed } from "@mod-protocol/core";
import { renderers } from "@mod-protocol/react-ui-shadcn/dist/renderers";
import {
  contentMiniApps,
  defaultContentMiniApp,
} from "@mod-protocol/miniapp-registry";
import { RenderEmbed } from "@mod-protocol/react";
import { CastWithMetadata } from "../types/cast";
import Image from "next/image";

export const structuredCastToReactDOMComponentsConfig: Record<
  StructuredCastUnit["type"],
  (structuredCast: any, i: number, options: {}) => React.ReactElement
> = {
  plaintext: (structuredCast: StructuredCastPlaintext, i: number, options) => (
    <span key={i}>{structuredCast.serializedContent}</span>
  ),
  url: (structuredCast: StructuredCastUrl, i: number, options) => (
    <a
      key={i}
      href={structuredCast.serializedContent}
      className="text-indigo-600"
    >
      {structuredCast.serializedContent}
    </a>
  ),
  videourl: (structuredCast: StructuredCastVideo, i: number, options) => (
    <a
      key={i}
      href={structuredCast.serializedContent}
      className="text-indigo-600"
    >
      {structuredCast.serializedContent}
    </a>
  ),
  imageurl: (structuredCast: StructuredCastImageUrl, i: number, options) => (
    <a
      key={i}
      href={structuredCast.serializedContent}
      className="text-indigo-600"
    >
      {structuredCast.serializedContent}
    </a>
  ),
  mention: (structuredCast: StructuredCastMention, i: number, options) => (
    <a
      key={i}
      href={structuredCast.serializedContent}
      className="text-indigo-600"
    >
      {structuredCast.serializedContent}
    </a>
  ),
  textcut: (structuredCast: StructuredCastTextcut, i: number, options) => (
    <a
      key={i}
      href={structuredCast.serializedContent}
      className="text-indigo-600"
    >
      {structuredCast.serializedContent}
    </a>
  ),
  newline: (_: StructuredCastNewline, i: number, options) => <br key={i} />,
};

export function convertStructuredCastToReactDOMComponents(
  structuredCast: StructuredCastUnit[],
  options: {}
): (React.ReactElement | string)[] {
  return structuredCast.map((structuredCastUnit, i) =>
    structuredCastToReactDOMComponentsConfig[structuredCastUnit.type](
      structuredCastUnit,
      i,
      options
    )
  );
}

export function Cast({ cast }: { cast: CastWithMetadata }) {
  const publishedAt = useRelativeDate(new Date(cast.timestamp));

  const structuredCast = useMemo(
    () =>
      convertCastPlainTextToStructured({
        text: cast.text,
      }),
    [cast.text]
  );

  const likeCount = useMemo(() => {
    return cast.reactions.likes.reduce((acc, like) => {
      return acc + 1;
    }, 0);
  }, [cast.reactions.likes]);

  const recastCount = useMemo(() => {
    return cast.reactions.recasts.reduce((acc, recast) => {
      return acc + 1;
    }, 0);
  }, [cast.reactions.recasts]);

  return (
    <div className="relative border rounded pb-2">
      <div>
        <div className="px-4 py-3 pb-0 cursor-pointer break-words">
          <div className="flex gap-3 flex-row">
            <div className="relative min-w-[48px]">
              <div>
                <div className="pt-1">
                  <Image
                    alt=""
                    className="rounded-full w-[48px] h-[48px]"
                    src={cast.avatar_url || "https://www.discove.xyz/black.png"}
                    width={48}
                    height={48}
                  />
                </div>
              </div>
            </div>
            <div className="flex-grow">
              <span>
                <b>{cast.display_name}</b>
              </span>{" "}
              <span>@{cast.username}</span> <span>· {publishedAt}</span>
              <div className="cursor-pointer mt-1 max-w-[600px]">
                {convertStructuredCastToReactDOMComponents(structuredCast, {})}
                <div>
                  {cast.resolvedEmbeds &&
                    cast.resolvedEmbeds.map((embed, i) => (
                      <RenderEmbed
                        api={process.env.NEXT_PUBLIC_API_URL!}
                        embed={{
                          metadata: embed.metadata,
                          status: "loaded",
                          url: embed.url,
                          cast_id: cast.hash,
                        }}
                        key={i}
                        renderers={renderers}
                        defaultContentMiniApp={defaultContentMiniApp}
                        contentMiniApps={contentMiniApps}
                      />
                    ))}
                </div>
              </div>
              <div className="flex justify-between mt-2 max-w-[400px]">
                <button className="text-slate-500">
                  <CommentIcon />
                  <span className="ml-2">{cast.repliesCount}</span>
                </button>
                <button className="text-slate-500">
                  <SyncIcon />
                  <span className="ml-2">{recastCount}</span>
                </button>
                <button className="text-slate-500">
                  <HeartIcon /> <span className="ml-2">{likeCount}</span>
                </button>
                <button className="text-slate-500">
                  <BookmarkIcon />
                  <span className="ml-2"></span>
                </button>
                <button className="text-slate-500">
                  <ShareIcon />
                  <span className="ml-2"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
