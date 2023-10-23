import { UrlMetadata } from "@mod-protocol/core";

export type Cast = {
  hash: string;
  avatar_url: string;
  display_name: string;
  username: string;
  timestamp: string;
  text: string;
  reactions: {
    likes: { fid: string }[];
    recasts: { fid: string }[];
  };
  repliesCount: number;
  embeds: { url?: string; castId?: { hash: string; fid: number } }[];
};

export type CastWithMetadata = Cast & {
  resolvedEmbeds: { url: string; metadata: UrlMetadata }[];
};
