import { Embed } from "@mod-protocol/core";

export type Cast = {
  hash: string;
  fid: number;
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
  resolvedEmbeds: (Embed & {
    url: string;
  })[];
};
