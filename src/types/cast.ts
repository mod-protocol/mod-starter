import { Embed, UrlMetadata } from "@mod-protocol/core";

export type Cast = {
  hash: string;
  avatar_url: string;
  display_name: string;
  username: string;
  timestamp: string;
  text: string;
  embeds: { url?: string; castId?: { hash: string; fid: number } }[];
};

export type CastWithMetadata = Cast & {
  embeds: { url: string; metadata: UrlMetadata }[];
};
