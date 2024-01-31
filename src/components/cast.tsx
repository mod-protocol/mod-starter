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
import { richEmbedMods, defaultRichEmbedMod } from "@mod-protocol/mod-registry";
import { RichEmbed } from "@mod-protocol/react";
import { renderers } from "@mod-protocol/react-ui-shadcn/dist/renderers";
import {
  BookmarkIcon,
  CommentIcon,
  HeartIcon,
  ShareIcon,
  SyncIcon,
} from "@primer/octicons-react";
import Image from "next/image";
import React, { useMemo } from "react";
import { useRelativeDate } from "../lib/relative-date";
import { CastWithMetadata } from "../types/cast";
import {
  ContextType,
  SendEthTransactionActionResolverEvents,
  SendEthTransactionActionResolverInit,
  SendFcFrameActionResolverEvents,
  SendFcFrameActionResolverInit,
} from "@mod-protocol/core";
import { useExperimentalMods } from "../hooks/use-experimental-mods";
import { useFarcasterIdentity } from "../hooks/use-farcaster-connect";
import { useAccount } from "wagmi";
import {
  sendTransaction,
  switchNetwork,
  waitForTransaction,
} from "wagmi/actions";

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

  const experimentalMods = useExperimentalMods();
  const { farcasterUser } = useFarcasterIdentity();
  const { address } = useAccount();
  const fid = farcasterUser?.fid;

  const context = useMemo<Omit<ContextType, "embed">>(() => {
    return {
      api: process.env.NEXT_PUBLIC_API_URL!,
      user: {
        id: fid,
        wallet: {
          address,
        },
      },
    };
  }, [address, fid]);

  const onSendFcFrameAction = useMemo(() => {
    async function onSendFcFrameActionRes(
      { url, post_url, action }: SendFcFrameActionResolverInit,
      { onError, onSuccess }: SendFcFrameActionResolverEvents
    ) {
      try {
        if (!farcasterUser) {
          onError({ message: "login please" });
          return;
        }
        const options = {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            cast_hash: cast.hash,
            signer_uuid: farcasterUser?.signer_uuid,
            action: {
              button: { title: "abc", index: Number(action) },
              frames_url: url,
              post_url: post_url,
            },
          }),
        };

        const res = await fetch("/post-message/frame-action", options);
        const resJson = await res.json();

        onSuccess(resJson);
      } catch (err) {
        onError(err as any);
      }
    }

    return onSendFcFrameActionRes;
  }, [fid, farcasterUser?.signer_uuid, cast.hash]);

  const onSendEthTransactionAction = useMemo(
    () =>
      async (
        { data, chainId }: SendEthTransactionActionResolverInit,
        {
          onConfirmed,
          onError,
          onSubmitted,
        }: SendEthTransactionActionResolverEvents
      ) => {
        try {
          const parsedChainId = parseInt(chainId);
          // Switch chains if the user is not on the right one
          await switchNetwork({ chainId: parsedChainId });
          // Send the transaction
          const { hash } = await sendTransaction({
            ...data,
            chainId: parsedChainId,
          } as any);
          onSubmitted(hash);
          // Wait for the transaction to be confirmed
          const { status } = await waitForTransaction({
            hash,
            chainId: parsedChainId,
          });
          onConfirmed(hash, status === "success");
        } catch (e) {
          onError(e as any);
        }
      },
    []
  );

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
            <div className="flex-grow min-w-0">
              <span>
                <b>{cast.display_name}</b>
              </span>{" "}
              <span>@{cast.username}</span> <span>· {publishedAt}</span>
              <div className="cursor-pointer mt-1 max-w-[600px] break-words">
                {convertStructuredCastToReactDOMComponents(structuredCast, {})}
                <div>
                  {cast.resolvedEmbeds &&
                    cast.resolvedEmbeds.map((embed, i) => (
                      <div key={i}>
                        <RichEmbed
                          embed={embed}
                          renderers={renderers}
                          {...context}
                          defaultRichEmbedMod={defaultRichEmbedMod}
                          mods={richEmbedMods}
                          resolvers={{
                            onSendEthTransactionAction,
                            onSendFcFrameAction,
                          }}
                        />
                      </div>
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
