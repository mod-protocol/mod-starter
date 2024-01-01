"use client";

import * as React from "react";

// Core
import {
  Embed,
  ModManifest,
  fetchUrlMetadata,
  handleAddEmbed,
  handleOpenFile,
  handleSetInput,
} from "@mod-protocol/core";
import {
  Channel,
  getFarcasterChannels,
  getFarcasterMentions,
} from "@mod-protocol/farcaster";
import { creationMods, defaultRichEmbedMod } from "@mod-protocol/mod-registry";
import { CreationMod, RichEmbed } from "@mod-protocol/react";
import { EditorContent, useEditor } from "@mod-protocol/react-editor";

// UI implementation
import { ModsSearch } from "@mod-protocol/react-ui-shadcn/dist/components/creation-mods-search";
import { CastLengthUIIndicator } from "@mod-protocol/react-ui-shadcn/dist/components/cast-length-ui-indicator";
import { ChannelPicker } from "@mod-protocol/react-ui-shadcn/dist/components/channel-picker";
import { Button } from "@mod-protocol/react-ui-shadcn/dist/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mod-protocol/react-ui-shadcn/dist/components/ui/popover";
import { EmbedsEditor } from "@mod-protocol/react-ui-shadcn/dist/lib/embeds";
import { createRenderMentionsSuggestionConfig } from "@mod-protocol/react-ui-shadcn/dist/lib/mentions";
import { renderers } from "@mod-protocol/react-ui-shadcn/dist/renderers";

// Optionally replace with your API_URL here
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.modprotocol.org";

const getResults = getFarcasterMentions(API_URL);
const getChannels = getFarcasterChannels(API_URL);
const getUrlMetadata = fetchUrlMetadata(API_URL);
const onError = (err: any) => window.alert(err.message);
const onSubmit = async ({
  text,
  embeds,
  channel,
}: {
  text: string;
  embeds: Embed[];
  channel: Channel;
}) => {
  window.alert(
    `This is a demo, and doesn't do anything.\n\nCast text:\n${text}\nEmbeds:\n${embeds
      .map((embed) => (embed as any).url)
      .join(", ")}\nChannel:\n${channel.name}`
  );

  return true;
};

export default function EditorExample() {
  const {
    editor,
    getText,
    getEmbeds,
    setEmbeds,
    setText,
    setChannel,
    getChannel,
    addEmbed,
    handleSubmit,
  } = useEditor({
    fetchUrlMetadata: getUrlMetadata,
    onError,
    onSubmit,
    linkClassName: "text-blue-600",
    renderMentionsSuggestionConfig: createRenderMentionsSuggestionConfig({
      getResults: getResults,
    }),
  });

  const [currentMod, setCurrentMod] = React.useState<ModManifest | null>(null);

  // force re-render on CSR
  React.useEffect(() => {}, [currentMod]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-2 border border-input rounded-md">
        <EditorContent
          editor={editor}
          autoFocus
          className="w-full h-full min-h-[200px]"
        />
        <EmbedsEditor
          embeds={getEmbeds()}
          setEmbeds={setEmbeds}
          RichEmbed={({ embed }) => (
            <RichEmbed
              api={API_URL}
              defaultRichEmbedMod={defaultRichEmbedMod}
              mods={[defaultRichEmbedMod]}
              embed={embed}
              renderers={renderers}
            />
          )}
        />
      </div>
      <div className="flex flex-row pt-2 gap-1">
        <ChannelPicker
          getChannels={getChannels}
          onSelect={setChannel}
          value={getChannel()}
        />
        <Popover
          open={!!currentMod}
          onOpenChange={(op: boolean) => {
            if (!op) setCurrentMod(null);
          }}
        >
          <PopoverTrigger></PopoverTrigger>
          <ModsSearch mods={creationMods} onSelect={setCurrentMod} />
          <PopoverContent className="w-[400px] ml-2" align="start">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">{currentMod?.name}</h4>
              <hr />
              {currentMod && (
                <CreationMod
                  input={getText()}
                  embeds={getEmbeds()}
                  api={API_URL}
                  user={{}}
                  variant="creation"
                  manifest={currentMod}
                  renderers={renderers}
                  onOpenFileAction={handleOpenFile}
                  onExitAction={() => setCurrentMod(null)}
                  onSetInputAction={handleSetInput(setText)}
                  onAddEmbedAction={handleAddEmbed(addEmbed)}
                  onEthPersonalSignAction={() => {}}
                />
              )}
            </div>
          </PopoverContent>
        </Popover>
        <CastLengthUIIndicator getText={getText} />
        <div className="grow"></div>
        <Button type="submit">Cast</Button>
      </div>
    </form>
  );
}
